const adminMetaService = require('../services/adminMeta.service');
const ApiResponse = require('../utils/apiResponse');

class AdminMetaController {
  async searchAuthors(req, res, next) {
    try {
      const { q } = req.query;
      const results = await adminMetaService.searchAuthors(q);

      res.json(
        ApiResponse.success(results, 'Author search results')
      );
    } catch (error) {
      next(error);
    }
  }

  async searchCategories(req, res, next) {
    try {
      const { q } = req.query;
      const results = await adminMetaService.searchCategories(q);

      res.json(
        ApiResponse.success(results, 'Category search results')
      );
    } catch (error) {
      next(error);
    }
  }

  async searchTags(req, res, next) {
    try {
      const { q } = req.query;
      const results = await adminMetaService.searchTags(q);

      res.json(
        ApiResponse.success(results, 'Tag search results')
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminMetaController();
