import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { parseResource } from '../engine/parser';
import { ReactUIVisitor } from '../engine/ReactUIVistitor';
import { serviceManifest } from '../manifests/project';
import { mockApi } from '../api';

export function ResourceListPage() {
  const { resourceName } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!resourceName) return;
    setLoading(true);
    mockApi(resourceName, 'retrieve')
      .then(response => setData(response.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [resourceName]);

  if (!resourceName) return <div>Invalid Resource</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // The core generation logic is now here!
  const resourceModel = parseResource(serviceManifest, resourceName);
  const visitor = new ReactUIVisitor(data, (/* form submit handler */) => {}); // We'll add form handling later if needed
  
  return resourceModel.accept(visitor);
}