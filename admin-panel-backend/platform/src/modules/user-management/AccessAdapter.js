// platform/src/modules/user-management/AccessAdapter.js

export default class AccessAdapter {
  constructor({ accessManagementService }) {
    if (!accessManagementService) {
      throw new Error("AccessAdapter requires an 'accessManagementService'.");
    }
    this.service = accessManagementService;
  }

  // This method is now only used for the UI, so it passes context.
  async getUsers(context) {
    const users = await this.service.getUsers(context);
    return { response: users };
  }

  // This is the method causing the error. Let's fix its call signature.
  async updateUserRoles(context) {
    const { req } = context;
    const { id } = req.params;
    const { roles } = req.body;
    
    // The service layer should deal with business logic, not parsing the request.
    // The adapter's job is to extract the details from the request and pass them cleanly.
    const updatedUser = await this.service.updateUserRoles(id, roles, context);
    
    return {
      response: updatedUser,
      payloads: {
        audit: { message: `User ${context.user.email} updated roles for user ${id}.` },
      },
    };
  }
}