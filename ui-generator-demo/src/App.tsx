import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { serviceManifest } from './manifests/project.ts';
import { ResourcePage } from './pages/ResourcePage.tsx'; // Import our generator component
import './App.css'; 

function App() {
  const resourceNames = Object.keys(serviceManifest);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <nav className="sidebar">
          <h2>Resources</h2>
          <ul>
            {resourceNames.map(name => (
              <li key={name}>
                <Link to={`/${name}`}>{name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="content">
          <Routes>
            {/* The ResourcePage component now handles ALL rendering */}
            <Route path="/:resourceName" element={<ResourcePage />} />
            <Route path="/:resourceName/:id" element={<ResourcePage />} />
            <Route path="/" element={<Navigate to={`/${resourceNames[0]}`} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;