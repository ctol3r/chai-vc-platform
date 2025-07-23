import { useState } from 'react'

export default function Assistant() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const askQuestion = async () => {
    const res = await fetch('/api/admin/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    setResponse(data.answer);
  }
  return (
    <div>
      <h1>Admin GPT Assistant</h1>
      <textarea value={question} onChange={e => setQuestion(e.target.value)} />
      <button onClick={askQuestion}>Ask</button>
      <pre>{response}</pre>
    </div>
  );
}
