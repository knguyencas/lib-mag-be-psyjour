const VisualPost = require('../models/VisualPost');
const PerspectivePost = require('../models/PerspectivePost');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const _uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'psyche_library/visual_posts',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

const _generateNextPostId = async () => {
  const lastPost = await VisualPost.findOne({})
    .sort({ post_id: -1 })
    .lean();

  if (!lastPost || !lastPost.post_id) {
    return 'VP001';
  }

  const num = parseInt(lastPost.post_id.replace('VP', ''), 10) || 0;
  const next = num + 1;
  return 'VP' + String(next).padStart(3, '0');
};

const createVisualPost = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { title, content, tags } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      throw ApiError.badRequest('Image is required');
    }

    if (!title || !title.trim()) {
      throw ApiError.badRequest('Title is required');
    }

    if (!content || !content.trim()) {
      throw ApiError.badRequest('Content is required');
    }

    const user = await User.findById(userId).select('username');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const uploadResult = await _uploadImageToCloudinary(imageFile);

    let tagsList = [];
    if (tags) {
      try {
        tagsList = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch {
        tagsList = [];
      }
    }

    const post_id = await _generateNextPostId();

    const newPost = new VisualPost({
      post_id,
      title: title.trim(),
      content: content.trim(),
      author_id: userId,
      author_username: user.username,
      image_url: uploadResult.secure_url,
      image_public_id: uploadResult.public_id,
      tags: tagsList,
      status: 'pending'
    });

    await newPost.save();

    res.status(201).json(
      ApiResponse.success(
        {
          post_id: newPost.post_id,
          title: newPost.title,
          status: newPost.status,
          createdAt: newPost.createdAt
        },
        '✅ Post submitted successfully! Waiting for admin approval.',
        201
      )
    );
  } catch (error) {
    next(error);
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const userId = req.userId;

    const visualPosts = await VisualPost.find({ author_id: userId })
      .sort({ status: 1, createdAt: -1 })
      .lean();

    const perspectivePosts = await PerspectivePost.find({ author_id: userId })
      .sort({ status: 1, createdAt: -1 })
      .lean();

    const sortPosts = (posts) => {
      const pending = posts.filter(p => p.status === 'pending');
      const others = posts.filter(p => p.status !== 'pending');
      
      others.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return [...pending, ...others];
    };

    res.json(
      ApiResponse.success({
        visualPosts: sortPosts(visualPosts),
        perspectivePosts: sortPosts(perspectivePosts),
        totalVisual: visualPosts.length,
        totalPerspective: perspectivePosts.length
      }, 'Posts retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVisualPost,
  getUserPosts
};