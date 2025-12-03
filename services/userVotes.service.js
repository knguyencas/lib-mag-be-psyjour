const Vote = require('../models/Vote');
const ApiError = require('../utils/apiError');

class UserVotesService {
  async generateVoteId() {
    const prefix = 'VT';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Toggle vote (upvote/downvote for perspective posts & comments, like for visual posts)
   * @param {String} userId
   * @param {String} targetType - 'perspective_post', 'visual_post', 'comment'
   * @param {String} targetId
   * @param {String} voteType - 'upvote', 'downvote', 'like'
   */
  async toggleVote(userId, targetType, targetId, voteType) {
    if (targetType === 'visual_post' && voteType !== 'like') {
      throw ApiError.badRequest('Visual posts only support "like" votes');
    }

    if ((targetType === 'perspective_post' || targetType === 'comment') && 
        voteType !== 'upvote' && voteType !== 'downvote') {
      throw ApiError.badRequest('Perspective posts and comments only support "upvote" or "downvote"');
    }

    const existingVote = await Vote.findOne({
      user_id: userId,
      target_type: targetType,
      target_id: targetId
    });

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        await Vote.deleteOne({ vote_id: existingVote.vote_id });
        console.log(`Removed ${voteType} from ${targetType} ${targetId}`);
        return { action: 'removed', voteType };
      }

      existingVote.vote_type = voteType;
      await existingVote.save();
      console.log(`Changed vote to ${voteType} on ${targetType} ${targetId}`);
      return { action: 'changed', voteType };
    }

    const vote_id = await this.generateVoteId();
    
    await Vote.create({
      vote_id,
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
      vote_type: voteType
    });

    console.log(`Added ${voteType} to ${targetType} ${targetId}`);
    return { action: 'added', voteType };
  }

  async getUserVote(userId, targetType, targetId) {
    const vote = await Vote.findOne({
      user_id: userId,
      target_type: targetType,
      target_id: targetId
    });

    return vote ? { voteType: vote.vote_type } : null;
  }

  async getVoteCounts(targetType, targetId) {
    const votes = await Vote.aggregate([
      { 
        $match: { 
          target_type: targetType,
          target_id: targetId
        }
      },
      {
        $group: {
          _id: '$vote_type',
          count: { $sum: 1 }
        }
      }
    ]);

    if (targetType === 'visual_post') {
      const likes = votes.find(v => v._id === 'like')?.count || 0;
      return { likes };
    }

    const upvotes = votes.find(v => v._id === 'upvote')?.count || 0;
    const downvotes = votes.find(v => v._id === 'downvote')?.count || 0;
    
    return { upvotes, downvotes, score: upvotes - downvotes };
  }

  async getUserVotesBatch(userId, targetType, targetIds) {
    const votes = await Vote.find({
      user_id: userId,
      target_type: targetType,
      target_id: { $in: targetIds }
    }).lean();

    const voteMap = {};
    votes.forEach(vote => {
      voteMap[vote.target_id] = vote.vote_type;
    });

    return voteMap;
  }
}

module.exports = new UserVotesService();