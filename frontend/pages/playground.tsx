import React from 'react';

const PlaygroundPage: React.FC = () => (
  <div style={{ height: '100vh' }}>
    <iframe
      src="https://codesandbox.io/embed/new"
      style={{ width: '100%', height: '100%', border: 0, borderRadius: '4px', overflow: 'hidden' }}
      title="CodeSandbox Playground"
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    />
  </div>
);

export default PlaygroundPage;
