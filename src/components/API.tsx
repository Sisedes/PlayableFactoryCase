'use client';
import { useState } from 'react';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
}

const endpoints: ApiEndpoint[] = [
  { method: 'GET', path: '/api/categories', description: 'Get all categories' },
  { method: 'GET', path: '/api/products', description: 'Get all products' },
  { method: 'GET', path: '/api/products/popular', description: 'Get popular products' },
];

export default function ApiExplorer() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    setLoading(true);
    try {
      const res = await fetch(endpoint.path);
      const data = await res.json();
      setResponse({ endpoint, status: res.status, data });
    } catch (error) {
      setResponse({ endpoint, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Explorer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Endpoints List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Endpoints</h2>
          {endpoints.map((endpoint, index) => (
            <div key={index} className="border p-4 mb-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {endpoint.method}
                </span>
                <code className="font-mono">{endpoint.path}</code>
              </div>
              <p className="text-gray-600 mb-3">{endpoint.description}</p>
              <button
                onClick={() => testEndpoint(endpoint)}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test'}
              </button>
            </div>
          ))}
        </div>

        {/* Response Display */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Response</h2>
          {response && (
            <div className="border p-4 rounded">
              <div className="mb-2">
                <strong>Endpoint:</strong> {response.endpoint?.path}
              </div>
              {response.status && (
                <div className="mb-2">
                  <strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    response.status < 300 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {response.status}
                  </span>
                </div>
              )}
              <div>
                <strong>Data:</strong>
                <pre className="bg-gray-100 p-3 rounded mt-2 overflow-auto max-h-96">
                  {JSON.stringify(response.data || response.error, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}