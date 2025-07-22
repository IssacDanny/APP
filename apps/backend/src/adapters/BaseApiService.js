const axios = require('axios');

/**
 * This is the interface (as a base class) for all service adapters.
 * It defines the contract that every adapter must follow.
 * New adapters MUST extend this class and implement its methods.
 */
class BaseApiService {
  /**
   * @param {string} baseURL The base URL of the downstream service.
   */
  constructor(baseURL) {
    if (!baseURL) {
      throw new Error('A baseURL must be provided to the service adapter.');
    }
    this.api = axios.create({
      baseURL: baseURL,
      // You could add shared headers or auth logic here in the future
    });
  }

  // --- CRUD Method Contract ---

  async list(params = {}) {
    throw new Error('Method "list()" not implemented.');
  }

  async getById(id) {
    throw new Error('Method "getById()" not implemented.');
  }

  async create(data) {
    throw new Error('Method "create()" not implemented.');
  }

  async update(id, data) {
    throw new Error('Method "update()" not implemented.');
  }

  async delete(id) {
    throw new Error('Method "delete()" not implemented.');
  }

  // --- Schema Method Contract ---

  /**
   * @param {string} context Should be 'list', 'create', 'update', or 'detail'.
   */
  async getSchema(context) {
    throw new Error('Method "getSchema()" not implemented.');
  }
}

module.exports = BaseApiService;