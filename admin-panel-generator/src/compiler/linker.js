// src/compiler/linker.js

/**
 * Defines the static "frame" or "shell" of the admin panel.
 * The `navigation` array is an empty slot that the linker will fill.
 */
const adminPanelFrame = {
  panelName: "My Generated Admin Panel",
  navigation: []
};

/**
 * The Linker function takes an array of individual service schemas (each representing
 * a navigation group or menu) and links them together into a single, valid "grand schema".
 * This simulates a backend facade aggregating schemas from multiple microservices.
 *
 * @param {Array<object>} serviceSchemas - An array of schema objects, where each
 *   object conforms to the 'navigationItem' definition in our meta-schema.
 * @returns {object} The final, aggregated grand schema object.
 */
export function linkSchemas(serviceSchemas) {
  // Create a deep copy of the frame to avoid mutation issues on re-renders.
  const grandSchema = JSON.parse(JSON.stringify(adminPanelFrame));
  
  // Simply place the collected service schemas into the 'navigation' slot.
  grandSchema.navigation = serviceSchemas;
  
  console.log("Linker: Successfully linked service schemas into the grand schema.");
  
  return grandSchema;
}