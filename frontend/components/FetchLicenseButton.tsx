import { useState } from 'react';

interface FetchLicenseButtonProps {
  issuerId: string;
  onFetched?: (license: any) => void;
}

export default function FetchLicenseButton({ issuerId, onFetched }: FetchLicenseButtonProps) {
  const [loading, setLoading] = useState(false);

  const fetchLicense = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/license?issuerId=${issuerId}`);
      const data = await res.json();
      if (onFetched) {
        onFetched(data);
      }
    } catch (err) {
      console.error('Failed to fetch license', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={fetchLicense} disabled={loading}>
      {loading ? 'Fetching…' : 'Fetch License'}
    </button>
  );
}
