import { useState, useEffect } from 'react';
import { linkSchemas } from '../compiler/linker';           // Phase 1: Linker
import { parseAdminPanelSchema } from '../compiler/parser'; // Phase 2: Parser
import { UIGeneratorVisitor } from '../compiler/visitor';   // Phase 3: Visitor

// VITE env variable for the API host
const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:4000';
const SCHEMA_ENDPOINT = `${API_HOST}/api/v1/schemas/definitions`;

/**
 * A custom hook that encapsulates the entire schema compilation process.
 * It handles fetching, linking, parsing, and visiting to generate the UI IR.
 *
 * @returns {{ir: object | null, error: string | null, isLoading: boolean}}
 */
export function useCompiler() {
  const [ir, setIr] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This function encapsulates the entire compilation process.
    const compileSchemaToIR = async () => {
      try {
        // --- FETCH PHASE ---
        console.log("Compiler: Fetching schema definitions from backend...");
        const response = await fetch(SCHEMA_ENDPOINT);
        if (!response.ok) {
          throw new Error(`Failed to fetch schemas: ${response.status} ${response.statusText}`);
        }
        const serviceSchemas = await response.json(); // This is the ARRAY of schemas.

        // --- LINKING PHASE ---
        console.log("Compiler: Linking service schemas into a grand schema...");
        const grandSchema = linkSchemas(serviceSchemas);

        // --- PARSING PHASE ---
        // The parser expects a JSON string, so we stringify the linked object.
        console.log("Compiler: Parsing grand schema and building AST...");
        const astRoot = parseAdminPanelSchema(JSON.stringify(grandSchema));

        // --- VISITOR/GENERATION PHASE ---
        console.log("Compiler: Traversing AST to generate UI Intermediate Representation (IR)...");
        const visitor = new UIGeneratorVisitor();
        const finalIr = astRoot.accept(visitor);
        
        setIr(finalIr);
        console.log("✅ Compilation successful!");

      } catch (e) {
        console.error("❌ Compilation Failed:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    compileSchemaToIR();
  }, []); // Run only once on component mount

  return { ir, error, isLoading };
}