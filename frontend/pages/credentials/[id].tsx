import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface CourseCredential {
  courseName: string;
  tokenId: string;
  blockchainAddress: string;
  issueDate: string;
}

export default function CredentialPage() {
  const router = useRouter();
  const { id } = router.query;
  const [credentials, setCredentials] = useState<CourseCredential[]>([]);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const res = await fetch(`/api/candidates/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCredentials(data.credentials || []);
      }
    }
    load();
  }, [id]);

  return (
    <div>
      <h1>Candidate Credentials</h1>
      <ul>
        {credentials.map((c) => (
          <li key={c.tokenId}>
            {c.courseName} - Token: {c.tokenId} - Address: {c.blockchainAddress}
          </li>
        ))}
      </ul>
    </div>
  );
}
