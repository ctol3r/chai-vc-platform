import React from 'react';

const DeveloperPortal: React.FC = () => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Chai VC Platform Developer Portal</h1>
      <p>Welcome to the Chai VC Platform developer portal. This page provides basic examples for integrating with our APIs.</p>

      <h2>Example API Key</h2>
      <pre>example_key_1234567890</pre>
      <p>Include your API key in the <code>X-API-Key</code> header when making requests.</p>

      <h2>Sample GraphQL Request</h2>
      <pre>
curl -X POST https://api.chai-vc.example.com/graphql \
  -H "Content-Type: application/json" \
  -H "X-API-Key: example_key_1234567890" \
  -d '{"query": "{ credentials { id status } }"}'
      </pre>
    </div>
  );
};

export default DeveloperPortal;
