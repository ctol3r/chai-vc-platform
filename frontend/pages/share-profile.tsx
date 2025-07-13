import React from 'react';
import ShareProfileButton from '../components/ShareProfileButton';

/**
 * Example page showing how the ShareProfileButton could be used.
 * In a real application the profile URL would likely be generated dynamically.
 */
const ShareProfilePage: React.FC = () => {
  const profileUrl = 'https://example.com/my-profile';

  return (
    <main style={{ padding: '2rem' }}>
      <h1>My Profile</h1>
      <ShareProfileButton profileUrl={profileUrl} />
    </main>
  );
};

export default ShareProfilePage;
