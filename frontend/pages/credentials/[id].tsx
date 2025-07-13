import { useRouter } from 'next/router';

export default function Credential() {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div style={{ padding: 20 }}>
      <h1>Credential {id}</h1>
      <p>Placeholder credential page.</p>
    </div>
  );
}
