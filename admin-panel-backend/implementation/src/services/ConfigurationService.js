import { configDb } from '../data/database.js';
import { HttpError } from '#platform/core/errors.js';

/**
 * The concrete implementation of the ConfigurationService.
 * It fulfills the contract required by the platform's ConfigurationAdapter
 * by interacting with our in-memory database.
 */
export default class ConfigurationService {
  constructor() {
    // This service is simple and has no dependencies for now.
    // In a real app, it might receive a database client via DI.
    this.db = configDb;
  }

  /**
   * Retrieves all configuration variables.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of config objects.
   */
  async getAll() {
    // Convert the Map values to an array for the API response.
    return Array.from(this.db.values());
  }

  /**
   * Updates the value of a specific configuration variable.
   * @param {string} key - The key of the variable to update.
   * @param {string} value - The new value for the variable.
   * @returns {Promise<object>} A promise that resolves to the updated config object.
   * @throws {HttpError} If the key does not exist.
   */
  async update(key, value) {
    if (!this.db.has(key)) {
      // It's good practice to handle cases where a client tries to update a non-existent key.
      throw new HttpError(`Configuration key '${key}' not found.`, 404);
    }

    // Get the existing record.
    const existingRecord = this.db.get(key);

    // Create the updated record with a new timestamp.
    const updatedRecord = {
      ...existingRecord,
      value,
      lastModified: new Date().toISOString(),
    };

    // Save the updated record back to our in-memory "database".
    this.db.set(key, updatedRecord);

    // Return the updated record as the API response.
    return updatedRecord;
  }
}