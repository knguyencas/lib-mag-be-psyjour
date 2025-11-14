// Format
class ApiResponse {
  /**
   * Success response
   * @param {*} data
   * @param {string} message 
   * @param {number} statusCode 
   */
  static success(data = null, message = 'Success', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode
    };
  }

  /**
   * Error response
   * @param {string} message
   * @param {number} statusCode 
   * @param {*} errors
   */
  static error(message = 'Error', statusCode = 500, errors = null) {
    return {
      success: false,
      message,
      errors,
      statusCode
    };
  }

  /**
   * Paginated response
   * @param {Array} data 
   * @param {Object} pagination 
   * @param {string} message
   */
  static paginated(data, pagination, message = 'Success') {
    return {
      success: true,
      message,
      data,
      pagination: {
        page: parseInt(pagination.page) || 1,
        limit: parseInt(pagination.limit) || 20,
        total: pagination.total || 0,
        pages: pagination.pages || 0
      }
    };
  }
}

module.exports = ApiResponse;