import React from 'react';

interface SavingsData {
  month: string;
  hoursSaved: number;
}

const monthlySavings: SavingsData[] = [
  { month: 'January', hoursSaved: 5 },
  { month: 'February', hoursSaved: 7 },
  { month: 'March', hoursSaved: 12 },
  { month: 'April', hoursSaved: 10 },
  { month: 'May', hoursSaved: 14 },
];

const IssuerDashboard: React.FC = () => {
  const totalSaved = monthlySavings.reduce((sum, { hoursSaved }) => sum + hoursSaved, 0);
  return (
    <div>
      <h1>Issuer Dashboard</h1>
      <h2>Monthly Verification-Time Savings</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Hours Saved</th>
          </tr>
        </thead>
        <tbody>
          {monthlySavings.map(({ month, hoursSaved }) => (
            <tr key={month}>
              <td>{month}</td>
              <td>{hoursSaved}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total Hours Saved: {totalSaved}</p>
    </div>
  );
};

export default IssuerDashboard;
