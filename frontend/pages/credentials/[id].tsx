// Credential detail page with data minimization

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface Credential {
  id: string
  issuer: string
  issuedAt: string
  status?: string
}

const ALLOWED_FIELDS = ['id', 'issuer', 'issuedAt', 'status'] as const

function minimizeCredentialData(data: Record<string, any>): Credential {
  const minimized: Partial<Credential> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in data) {
      minimized[field] = data[field]
    }
  }
  return minimized as Credential
}

export default function CredentialPage() {
  const { query } = useRouter()
  const [credential, setCredential] = useState<Credential | null>(null)

  useEffect(() => {
    if (!query.id) return

    fetch(`/api/credentials/${query.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCredential(minimizeCredentialData(data))
      })
      .catch(() => setCredential(null))
  }, [query.id])

  if (!credential) return <div>Loading...</div>

  return (
    <div>
      <h1>Credential</h1>
      <p>ID: {credential.id}</p>
      <p>Issuer: {credential.issuer}</p>
      <p>Issued At: {credential.issuedAt}</p>
      {credential.status && <p>Status: {credential.status}</p>}
    </div>
  )
}

