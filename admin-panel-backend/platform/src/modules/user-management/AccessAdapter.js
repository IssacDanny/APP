// platform/src/modules/user-management/AccessAdapter.js

export default class AccessAdapter {
  constructor({ accessManagementService }) {
    if (!accessManagementService) {
      throw new Error("AccessAdapter requires an 'accessManagementService'.");
    }
    this.service = accessManagementService;
  }

  // FIX: Accept the context object
  async getUsers(req, context) {
    // The service method itself might need the context (e.g., to get a tenantId)
    const users = await this.service.getUsers(context);
    return { response: users };
  }

  // FIX: Accept the context object
  async updateUserRoles(req, context) {
    const { id } = req.params;
    const { roles } = req.body;
    const updatedUser = await this.service.updateUserRoles(id, roles, context);
    
    return {
      response: updatedUser,
      payloads: {
        audit: { message: `User ${context.user.email} updated roles for user ${id}.` },
      },
    };
  }
}