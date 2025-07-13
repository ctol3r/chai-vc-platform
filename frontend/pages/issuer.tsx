import React, { useState } from 'react';

const IssuerPortal: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFile(f);
  };

  const handleUpload = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result as string;
      try {
        const res = await fetch('/issue-vc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ csvData: text }),
        });
        if (res.ok) {
          setMessage('VCs issued!');
        } else {
          setMessage('Error issuing VCs');
        }
      } catch (err) {
        setMessage('Network error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h1>Issuer Portal</h1>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>
        Upload CSV
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default IssuerPortal;
