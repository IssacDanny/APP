const BaseApiService = require('./BaseApiService');

class ProjectMasterApiService extends BaseApiService {
  static resources = {
    projects: {
      actions: {
        list: {
          api: { method: 'get', path: '/projects' },
          schema: require('../schemas/instances/project-list.json'),
        },
        create: {
          api: { method: 'post', path: '/projects' },
          schema: require('../schemas/instances/project-create.json'),
        },
      },
    },
  };
  constructor() {
    super(process.env.PROJECTMASTER_API_URL);
  }
}
module.exports = new ProjectMasterApiService();