import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { parseResource } from '../engine/parser';
import { ReactUIVisitor } from '../engine/ReactUIVistitor.tsx';
import { serviceManifest } from '../manifests/project';
import { mockApi } from '../api';
import { interpolateTitle } from '../utils.ts'; // We'll create this utility

export function ResourceDetailPage() {
  const { resourceName, id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!resourceName || !id) return;
    setLoading(true);
    mockApi(resourceName, 'retrieveByID', { id })
      .then(response => setItem(response.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [resourceName, id]);

  if (!resourceName) return <div>Invalid Resource</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const resourceModel = parseResource(serviceManifest, resourceName);
  
  // Interpolate the title before passing it to the model
  resourceModel.viewSchema.title = interpolateTitle(resourceModel.viewSchema.title, item);

  // Pass the single item as the data for the visitor
  const visitor = new ReactUIVisitor([item], () => {}); // Visitor expects an array
  
  return resourceModel.accept(visitor);
}