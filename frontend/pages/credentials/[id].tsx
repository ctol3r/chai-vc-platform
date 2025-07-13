import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ErrorDisplay from "../../components/ErrorDisplay";

interface CredentialData {
  id: string;
  // Additional fields would go here
}

const CredentialPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<CredentialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      setError("Request timed out. Please try again later.");
      setLoading(false);
    }, 5000);

    fetch(`/api/credentials/${id}`, { signal: controller.signal })
      .then((response) => {
        if (response.status === 429) {
          throw new Error(
            "Rate limit exceeded. Please wait before retrying."
          );
        }
        if (!response.ok) {
          throw new Error("Failed to fetch credential data.");
        }
        return response.json();
      })
      .then((json) => {
        clearTimeout(timeout);
        setData(json as CredentialData);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          return; // timeout already handled
        }
        clearTimeout(timeout);
        setError(err.message);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [id]);

  if (error) {
    return <ErrorDisplay title="Unable to load credential" message={error} />;
  }

  if (loading) {
    return <div>Loading credential...</div>;
  }

  return (
    <div>
      <h1>Credential {id}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default CredentialPage;
