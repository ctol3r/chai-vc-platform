import React from 'react';

interface Alert {
  id: number;
  message: string;
  timestamp: string;
}

const sampleAlerts: Alert[] = [
  { id: 1, message: 'License about to expire for Dr. Smith', timestamp: '2023-08-01 10:00' },
  { id: 2, message: 'New sanction found for Jane Doe', timestamp: '2023-08-02 14:30' },
];

const AlertsPage: React.FC = () => {
  return (
    <div>
      <h1>Continuous Monitoring Alerts</h1>
      <ul>
        {sampleAlerts.map(alert => (
          <li key={alert.id}>
            <strong>{alert.message}</strong>
            <br />
            <span>{alert.timestamp}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlertsPage;
