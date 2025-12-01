const VisualPost = require('../models/VisualPost');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const _uploadImageToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'psyche_library/visual_posts',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const _generateNextPostId = async () => {
  const lastPost = await VisualPost.findOne().sort({ post_id: -1 }).limit(1);
  
  if (!lastPost || !lastPost.post_id) {
    return 'VP001';
  }

  const lastNumber = parseInt(lastPost.post_id.replace('VP', ''));
  const nextNumber = lastNumber + 1;
  return `VP${String(nextNumber).padStart(3, '0')}`;
};

/**
 * @desc    Create a new visual post
 * @route   POST /api/visualpost
 * @access  Private (requires authentication)
 */
exports.createVisualPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.userId;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    if (title.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title must not exceed 100 characters',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let uploadResult;
    try {
      uploadResult = await _uploadImageToCloudinary(req.file.buffer);
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: uploadError.message,
      });
    }

    const post_id = await _generateNextPostId();

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

    const visualPost = new VisualPost({
      post_id,
      title,
      content,
      author_id: userId,
      author_username: user.username,
      image_url: uploadResult.secure_url,
      image_public_id: uploadResult.public_id,
      tags: parsedTags,
      status: 'pending',
    });

    await visualPost.save();

    res.status(201).json({
      success: true,
      message: 'Visual post created successfully. Pending admin approval.',
      data: visualPost,
    });
  } catch (error) {
    console.error('Error creating visual post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create visual post',
      error: error.message,
    });
  }
};

/**
 * @desc    Get current user's posts (both visual and perspective posts)
 * @route   GET /api/visualpost/my-posts
 * @access  Private (requires authentication)
 */
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.userId;

    const visualPosts = await VisualPost.find({ author_id: userId })
      .sort({ createdAt: -1 });

    const sortedPosts = visualPosts.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
      success: true,
      data: sortedPosts,
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message,
    });
  }
};
/**
 * @desc    Get all published visual posts (public)
 * @route   GET /api/visualpost
 * @access  Public
 */
exports.getPublishedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = 'newest' } = req.query;

    const query = { status: 'published' };

    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'likes':
        sortOption = { likes: -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const posts = await VisualPost.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author_id', 'username displayName avatar');

    const count = await VisualPost.countDocuments(query);

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
    console.error('Error fetching published visual posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single visual post by ID
 * @route   GET /api/visualpost/:id
 * @access  Public
 */
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await VisualPost.findOne({ post_id: id })
      .populate('author_id', 'username displayName avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

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