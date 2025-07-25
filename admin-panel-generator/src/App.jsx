import { useEffect, useState } from 'react';
import { parseAdminPanelSchema } from './compiler/parser';

// Import our sample schema to test with
import sampleSchema from './schemas/sampleSchema.json';

function App() {
  const [astRoot, setAstRoot] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, you would fetch this from a server.
    // Here, we convert our imported JSON object back to a string
    // to simulate the raw data we'd get from an API.
    const schemaString = JSON.stringify(sampleSchema);

    try {
      // This is the moment of truth!
      const parsedAst = parseAdminPanelSchema(schemaString);
      setAstRoot(parsedAst);
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  }, []); // The empty dependency array ensures this runs only once on mount.

  if (error) {
    return (
      <div className="error-display">
        <h1>Failed to Build Admin Panel</h1>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#fee', padding: '1rem' }}>
          {error}
        </pre>
      </div>
    );
  }

  if (!astRoot) {
    return <h1>Compiling Admin Panel...</h1>;
  }

  return (
    <div className="App">
      <h1>{astRoot.panelName}</h1>
      <p>Successfully compiled the schema!</p>
      <pre>{JSON.stringify(astRoot, null, 2)}</pre>
    </div>
  );
}

export default App;