const PerspectivePost = require('../models/PerspectivePost');
const User = require('../models/User');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');

const generatePostId = async () => {
  const lastPost = await PerspectivePost.findOne().sort({ post_id: -1 }).limit(1);
  
  if (!lastPost || !lastPost.post_id) {
    return 'PP001';
  }

  const lastNumber = parseInt(lastPost.post_id.replace('PP', ''));
  const nextNumber = lastNumber + 1;
  return `PP${String(nextNumber).padStart(3, '0')}`;
};

exports.createPerspectivePost = async (req, res) => {
  try {
    const { topic, content, primary_genre, tags } = req.body;
    const userId = req.userId;

    if (!topic || !content) {
      return res.status(400).json({
        success: false,
        message: 'Topic and content are required',
      });
    }

    if (topic.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Topic must not exceed 200 characters',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const post_id = await generatePostId();

    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = tags.split(',').map(tag => tag.trim());
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    const perspectivePost = new PerspectivePost({
      post_id,
      topic,
      content,
      author_id: userId,
      primary_genre: primary_genre || 'General',
      tags: parsedTags,
      status: 'pending',
    });

    await perspectivePost.save();

    res.status(201).json({
      success: true,
      message: 'Perspective post created successfully. Pending admin approval.',
      data: perspectivePost,
    });
  } catch (error) {
    console.error('Error creating perspective post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create perspective post',
      error: error.message,
    });
  }
};

exports.getUserPerspectivePosts = async (req, res) => {
  try {
    const userId = req.userId;

    const perspectivePosts = await PerspectivePost.find({ author_id: userId })
      .sort({ createdAt: -1 });

    const sortedPosts = perspectivePosts.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
      success: true,
      data: sortedPosts,
    });
  } catch (error) {
    console.error('Error fetching user perspective posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message,
    });
  }
};

exports.getPublishedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, genre, sort = 'newest' } = req.query;

    const query = { status: 'published' };
    if (genre) {
      query.primary_genre = genre;
    }

    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'upvotes':
        sortOption = { upvotes: -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const posts = await PerspectivePost.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author_id', 'username');

    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const votes = await Vote.aggregate([
        { $match: { target_type: 'perspective_post', target_id: post.post_id }},
        { $group: { _id: '$vote_type', count: { $sum: 1 }}}
      ]);
      
      const upvotes = votes.find(v => v._id === 'upvote')?.count || 0;
      const downvotes = votes.find(v => v._id === 'downvote')?.count || 0;
      
      const commentCount = await Comment.countDocuments({
        target_type: 'perspective_post',
        target_id: post.post_id,
        status: 'approved'
      });

      return {
        ...post.toObject(),
        upvotes,
        downvotes,
        commentsCount: commentCount
      };
    }));

    const count = await PerspectivePost.countDocuments(query);

    res.status(200).json({
      success: true,
      data: postsWithCounts,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching published posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message,
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await PerspectivePost.findOne({ post_id: id })
      .populate('author_id', 'username');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.views += 1;
    await post.save();

    const votes = await Vote.aggregate([
      { $match: { target_type: 'perspective_post', target_id: post.post_id }},
      { $group: { _id: '$vote_type', count: { $sum: 1 }}}
    ]);
    
    const upvotes = votes.find(v => v._id === 'upvote')?.count || 0;
    const downvotes = votes.find(v => v._id === 'downvote')?.count || 0;

    const postWithCounts = {
      ...post.toObject(),
      upvotes,
      downvotes
    };

    res.status(200).json({
      success: true,
      data: postWithCounts,
    });
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message,
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { topic, content, primary_genre, tags } = req.body;

    const post = await PerspectivePost.findOne({ post_id: id });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.author_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this post',
      });
    }

    if (topic && topic.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Topic must not exceed 200 characters',
      });
    }

    if (topic) post.topic = topic;
    if (content) post.content = content;
    if (primary_genre) post.primary_genre = primary_genre;
    if (tags) {
      let parsedTags = [];
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = tags.split(',').map(tag => tag.trim());
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
      post.tags = parsedTags;
    }

    if (post.status === 'published') {
      post.status = 'pending';
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const post = await PerspectivePost.findOne({ post_id: id });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.author_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post',
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message,
    });
  }
};