import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { parseResource } from '../engine/parser.ts';
import { ReactUIVisitor } from '../engine/ReactUIVistitor.tsx';
import { serviceManifest } from '../manifests/project.ts';
import { mockApi } from '../api.ts';
import { interpolateTitle } from '../utils.ts';

export function ResourcePage() {
  const { resourceName, id } = useParams();
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data fetching logic based on URL
  useEffect(() => {
    if (!resourceName) return;
    
    const actionToCall = id ? 'retrieveByID' : 'retrieve';
    setLoading(true);
    mockApi(resourceName, actionToCall, { id })
      .then(response => {
        // The visitor always expects an array of data.
        setData(Array.isArray(response.data) ? response.data : [response.data]);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [resourceName, id]);

  // The UI is memoized to prevent re-generation on every render
  const ui = useMemo(() => {
    if (!resourceName || !data) return null;

    // 1. Parse the manifest to get our AST (the model)
    const resourceModel = parseResource(serviceManifest, resourceName);

    // 2. Handle title templating for detail views
    if (id && data[0]) {
      resourceModel.viewSchema.title = interpolateTitle(resourceModel.viewSchema.title, data[0]);
    }

    // 3. Create the visitor with the fetched data
    // We can wire up the real form submit handler here later.
    const visitor = new ReactUIVisitor(data, () => {});

    // 4. Generate the entire UI by visiting the top-level resource model
    return resourceModel.accept(visitor);
  }, [resourceName, id, data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <>{ui}</>;
}