import { useState } from 'react'

export default function Feedback() {
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState('')

  const sendFeedback = async () => {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    const data = await res.json()
    if (data.reply) {
      setReply(data.reply)
    }
  }

  return (
    <div>
      <h1>User Feedback</h1>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Enter your suggestion here"
      />
      <button onClick={sendFeedback}>Submit Feedback</button>
      {reply && <p>{reply}</p>}
    </div>
  )
}
