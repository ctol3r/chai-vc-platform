import { useState, useRef } from "react";
import { useRouter } from "next/router";

interface Match {
  id: number;
  company: string;
  position: string;
  score: number;
}

const matches: Match[] = [
  { id: 1, company: "ACME Hospital", position: "Registered Nurse", score: 86 },
  { id: 2, company: "Better Clinic", position: "Pharmacist", score: 73 },
  { id: 3, company: "Care Center", position: "Medical Assistant", score: 67 }
];

export default function CredentialMatchPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const startXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const startX = startXRef.current;
    if (startX === null) return;
    if (endX < startX - 50) {
      // Swiped left -> skip
      nextCard();
    } else if (endX > startX + 50) {
      // Swiped right -> apply
      alert(`Applied to ${matches[index].company}!`);
      nextCard();
    }
    startXRef.current = null;
  };

  const nextCard = () => {
    setIndex((idx) => Math.min(idx + 1, matches.length));
  };

  const match = matches[index];

  if (!match) {
    return <div>No more matches.</div>;
  }

  return (
    <div className="wallet-swipe-container">
      <h1>Credential ID: {router.query.id}</h1>
      <div
        className="swipe-card"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <h2>{match.company}</h2>
        <p>{match.position}</p>
        <strong>Match Score: {match.score}%</strong>
      </div>
      <p>Swipe right to apply or left to skip.</p>
      <style jsx>{`
        .wallet-swipe-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
        }
        .swipe-card {
          width: 300px;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          margin: 1rem 0;
          user-select: none;
          background: #fff;
        }
      `}</style>
    </div>
  );
}
