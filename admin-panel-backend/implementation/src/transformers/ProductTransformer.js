// A collection of pure functions for data transformation.
// This file has no dependencies on Express or our core engine.

export default {
  /**
   * Transforms our clean internal model to the messy external API's format.
   * @param {object} internalData - Data from our UI form (e.g., { name, stock }).
   * @returns {object} Data formatted for the external API.
   */
  toExternal(internalData) {
    console.log('[TRANSFORM] Converting internal model to external');
    return {
      product_name: internalData.name,
      stock_qty: internalData.stock,
      metadata: { source: 'admin-panel' }, // Can also add data
    };
  },

  /**
   * Transforms the messy external API's response to our clean internal model.
   * @param {object} externalData - The raw response from the external API.
   * @returns {object} Data formatted for our UI and services.
   */
  toInternal(externalData) {
    console.log('[TRANSFORM] Converting external model to internal');
    return {
      id: externalData.prod_id,
      name: externalData.prod_name,
      stock: externalData.inventory.on_hand,
    };
  },
};