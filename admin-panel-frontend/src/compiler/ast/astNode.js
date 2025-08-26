/**
 * The base class for all nodes in the Abstract Syntax Tree.
 * It enforces the implementation of the accept method, crucial for the Visitor pattern.
 */
export class ASTNode {
  constructor() {
    if (this.constructor === ASTNode) {
      throw new Error("ASTNode is an abstract class and cannot be instantiated directly.");
    }
  }

  /**
   * Accepts a visitor and calls the appropriate visit method on it.
   * This is the core of the Visitor pattern's double-dispatch mechanism.
   * @param {import('../VisitorBase').VisitorBase} visitor The visitor instance.
   */
  accept(visitor) {
    throw new Error("The 'accept' method must be implemented by concrete subclasses.");
  }
}