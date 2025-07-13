import { useState } from 'react';

// Simple multi-step onboarding UI
export default function Onboarding() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [npi, setNpi] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');

  const next = () => setStep((prev) => (prev < 4 ? (prev + 1) as any : prev));
  const back = () => setStep((prev) => (prev > 1 ? (prev - 1) as any : prev));

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      {step === 1 && (
        <div>
          <h1>Enter NPI</h1>
          <input
            type="text"
            placeholder="NPI"
            value={npi}
            onChange={(e) => setNpi(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          <button onClick={next} style={{ marginTop: '1rem' }}>Next</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h1>Confirm Details</h1>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
          </label>
          <button onClick={back} style={{ marginTop: '1rem', marginRight: '0.5rem' }}>
            Back
          </button>
          <button onClick={next} style={{ marginTop: '1rem' }}>Confirm</button>
        </div>
      )}
      {step === 3 && (
        <div>
          <h1>Enter OTP</h1>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          <button onClick={back} style={{ marginTop: '1rem', marginRight: '0.5rem' }}>
            Back
          </button>
          <button onClick={next} style={{ marginTop: '1rem' }}>Verify</button>
        </div>
      )}
      {step === 4 && (
        <div>
          <h1>Success!</h1>
          <p>You have completed onboarding.</p>
        </div>
      )}
    </div>
  );
}
