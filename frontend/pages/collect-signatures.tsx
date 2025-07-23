import { useState } from 'react';

export default function CollectSignatures() {
  const [step, setStep] = useState<'department' | 'board' | 'done'>('department');
  const [deptSig, setDeptSig] = useState('');
  const [boardSig, setBoardSig] = useState('');

  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deptSig.trim()) {
      setStep('board');
    }
  };

  const handleBoardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (boardSig.trim()) {
      setStep('done');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', fontFamily: 'sans-serif' }}>
      {step === 'department' && (
        <form onSubmit={handleDeptSubmit}>
          <h1>Department Head Signature</h1>
          <input
            type="text"
            placeholder="Type signature"
            value={deptSig}
            onChange={(e) => setDeptSig(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
          <button type="submit" style={{ marginTop: 12 }}>
            Continue
          </button>
        </form>
      )}

      {step === 'board' && (
        <form onSubmit={handleBoardSubmit}>
          <h1>Board Signature</h1>
          <input
            type="text"
            placeholder="Type signature"
            value={boardSig}
            onChange={(e) => setBoardSig(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
          <button type="submit" style={{ marginTop: 12 }}>
            Finish
          </button>
        </form>
      )}

      {step === 'done' && (
        <div>
          <h1>Signatures Collected</h1>
          <p><strong>Department Head:</strong> {deptSig}</p>
          <p><strong>Board:</strong> {boardSig}</p>
        </div>
      )}
    </div>
  );
}
