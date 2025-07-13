import Keycloak from 'keycloak-js';
import { useEffect } from 'react';

const keycloak = new Keycloak({
  url: 'https://keycloak.example.com/auth',
  realm: 'wallet',
  clientId: 'wallet-client',
});

export default function WalletLogin() {
  useEffect(() => {
    keycloak.init({ onLoad: 'check-sso' });
  }, []);

  const handleLogin = () => {
    keycloak.login();
  };

  return (
    <div>
      <h1>Wallet</h1>
      <button onClick={handleLogin}>Login with Keycloak</button>
    </div>
  );
}
