// src/adapters/UmsApiService.js

const BaseApiService = require('./BaseApiService');

class UmsApiService extends BaseApiService {
  // THIS IS THE PART THAT IS MISSING OR INCORRECT
  // The validation is failing because this 'list' action is not defined.
  static resources = {
    users: {
      actions: {
        list: {
          api: { method: 'get', path: '/users' },
          schema: require('../schemas/instances/user-list.json'),
        },
      },
    },
  };

  // THIS IS THE PART SHOWN IN YOUR SCREENSHOT
  // This code is correct and is what triggers the validation.
  constructor() {
    super(process.env.UMS_API_URL);
  }
}

module.exports = new UmsApiService();