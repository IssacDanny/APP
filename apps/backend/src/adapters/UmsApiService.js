const BaseApiService = require('./BaseApiService');

class UmsApiService extends BaseApiService {
  constructor() {
    // Pass the specific service URL to the parent constructor
    super(process.env.UMS_API_URL);
  }

  // Implement the 'list' method from the interface
  async list(params = {}) {
    console.log('UmsApiService: Fetching users...');
    return (await this.api.get('/users', { params })).data;
  }

  // Implement the 'getSchema' method from the interface
  async getSchema(context) {
    console.log(`UmsApiService: Fetching schema for context '${context}' dynamically...`);
    const response = await this.api.get(`/schemas/${context}`);
    return response.data;
  }
  
  // We don't need to implement create, update, etc. if this service doesn't support them yet.
  // Calling them would throw the error from the base class.
}

module.exports = new UmsApiService();