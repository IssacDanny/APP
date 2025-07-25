import { useState, useEffect } from 'react';
import { linkSchemas } from '../compiler/linker';
import { parseAdminPanelSchema } from '../compiler/parser';
import { UIGeneratorVisitor } from '../compiler/visitor';

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
    const compileApplication = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/schemas`);
        if (!response.ok) {
          throw new Error(`Failed to fetch schemas: ${response.statusText}`);
        }
        const serviceSchemas = await response.json();
        const flattenedSchemas = serviceSchemas.flat();
        
        const grandSchema = linkSchemas(flattenedSchemas);
        const ast = parseAdminPanelSchema(JSON.stringify(grandSchema));
        const visitor = new UIGeneratorVisitor();
        const generatedIr = ast.accept(visitor);
        
        setIr(generatedIr);
      } catch (err) {
        console.error("💥 COMPILATION FAILED:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    compileApplication();
  }, []); // Empty dependency array ensures this runs only once.

  return { ir, error, isLoading };
}