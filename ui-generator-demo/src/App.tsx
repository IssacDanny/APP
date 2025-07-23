import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { serviceManifest, projectData } from './manifests/project';
import { parseResource } from './engine/parser';
import { ReactUIVisitor } from './engine/ReactUIVistitor';

function App() {
  const [data, setData] = useState(projectData);

  // ✅ This function now lives in the component that owns the state
  const handleFormSubmit = (actionName: string, formData: any, context: any) => {
    console.log(`Executing action '${actionName}' with data:`, formData);
    if (actionName === 'create') {
      setData(currentData => [...currentData, { ...formData, id: uuidv4() }]);
    }
    if (actionName === 'update') {
      setData(currentData =>
        currentData.map(item => (item.id === context.id ? { ...item, ...formData } : item))
      );
    }
    if (actionName === 'delete') {
      // Ensure the delete confirmation was checked
      if (formData.confirmation === true) {
        setData(currentData => currentData.filter(item => item.id !== context.id));
      } else {
        alert("You must confirm to delete.");
      }
    }
  };

  const ui = useMemo(() => {
    console.log("Parsing manifest and generating UI...");
    
    const resourceModel = parseResource(serviceManifest, 'projects');
    
    // Pass the data and the new handler function to the visitor
    const visitor = new ReactUIVisitor(data, handleFormSubmit);

    return resourceModel.accept(visitor);
  }, [data]);

  return (
    <div className="App">
      {ui}
    </div>
  );
}

export default App;