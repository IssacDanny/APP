import React, { useState } from 'react';
import ResourceRenderer from './components/ResourceRenderer';

// Import our manifest and data files
import { projectManifest, projectData } from './schemas/project.manifest';
import { userManifest, userData } from './schemas/user.manifest';

function App() {
  const [currentView, setCurrentView] = useState('projects');

  return (
    <div className="app-container">
      <nav className="app-nav">
        <button onClick={() => setCurrentView('projects')} disabled={currentView === 'projects'}>
          Manage Projects
        </button>
        <button onClick={() => setCurrentView('users')} disabled={currentView === 'users'}>
          Manage Users
        </button>
      </nav>

      <main>
        {currentView === 'projects' && (
          <ResourceRenderer manifest={projectManifest} initialData={projectData} />
        )}
        {currentView === 'users' && (
          <ResourceRenderer manifest={userManifest} initialData={userData} />
        )}
      </main>
    </div>
  );
}
export default App;