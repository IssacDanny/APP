const BaseApiService = require('./BaseApiService');

class ProjectMasterApiService extends BaseApiService {
  constructor() {
    super(process.env.PROJECTMASTER_API_URL);
  }

  // Implement 'list'
  async list(params = {}) {
    console.log('ProjectMasterApiService: Fetching projects...');
    return (await this.api.get('/projects', { params })).data;
  }

  // Implement 'create'
  async create(data) {
    console.log('ProjectMasterApiService: Creating project...');
    return (await this.api.post('/projects', data)).data;
  }

  // Implement 'getSchema'
  async getSchema(context) {
    console.log(`ProjectMasterApiService: Returning schema for context '${context}' directly...`);
    switch (context) {
      case 'list':
        return require('../schemas/project-list-columns.json');
      case 'create':
        return require('../schemas/project-create-form.json');
      default:
        throw new Error(`Schema context '${context}' not found.`);
    }
  }
}

module.exports = new ProjectMasterApiService();