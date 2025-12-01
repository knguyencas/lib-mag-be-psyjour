const PerspectivePost = require('../models/PerspectivePost');
const User = require('../models/User');

/**
 * Helper function to generate next post_id (PP001, PP002, etc.)
 */
const generatePostId = async () => {
  const lastPost = await PerspectivePost.findOne().sort({ post_id: -1 }).limit(1);
  
  if (!lastPost || !lastPost.post_id) {
    return 'PP001';
  }

  const lastNumber = parseInt(lastPost.post_id.replace('PP', ''));
  const nextNumber = lastNumber + 1;
  return `PP${String(nextNumber).padStart(3, '0')}`;
};

/**
 * @desc    Create a new perspective post
 * @route   POST /api/perspectivepost
 * @access  Private (requires authentication)
 */
exports.createPerspectivePost = async (req, res) => {
  try {
    const { topic, content, primary_genre, tags } = req.body;
    const userId = req.userId; // From authenticate middleware

    // Validation
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

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate post_id
    const post_id = await generatePostId();

    // Parse tags if they come as a string
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

    // Create perspective post
    const perspectivePost = new PerspectivePost({
      post_id,
      topic,
      content,
      author_id: userId,
      primary_genre: primary_genre || 'General',
      tags: parsedTags,
      status: 'pending', // Default status for new posts
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

/**
 * @desc    Get current user's perspective posts
 * @route   GET /api/perspectivepost/my-posts
 * @access  Private (requires authentication)
 */
exports.getUserPerspectivePosts = async (req, res) => {
  try {
    const userId = req.userId; // From authenticate middleware

    // Get user's perspective posts
    const perspectivePosts = await PerspectivePost.find({ author_id: userId })
      .sort({ createdAt: -1 }); // Sort by newest first

    // Sort posts: pending first, then by date
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

/**
 * @desc    Get all published perspective posts (public)
 * @route   GET /api/perspectivepost
 * @access  Public
 */
exports.getPublishedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, genre, sort = 'newest' } = req.query;

    // Build query
    const query = { status: 'published' };
    if (genre) {
      query.primary_genre = genre;
    }

    // Build sort
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

    // Execute query with pagination
    const posts = await PerspectivePost.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author_id', 'username');

    // Get total count for pagination
    const count = await PerspectivePost.countDocuments(query);

    res.status(200).json({
      success: true,
      data: posts,
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

/**
 * @desc    Get a single perspective post by ID
 * @route   GET /api/perspectivepost/:id
 * @access  Public
 */
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params; // This is post_id (e.g., PP001)

    const post = await PerspectivePost.findOne({ post_id: id })
      .populate('author_id', 'username');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      data: post,
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

/**
 * @desc    Update a perspective post
 * @route   PUT /api/perspectivepost/:id
 * @access  Private (author only)
 */
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

/**
 * @desc    Delete a perspective post
 * @route   DELETE /api/perspectivepost/:id
 * @access  Private (author only)
 */
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