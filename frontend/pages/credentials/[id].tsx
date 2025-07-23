import { useState } from 'react';
import { needsReauthentication } from '../../utils/session';

export default function CredentialPage() {
    const [lastAuth, setLastAuth] = useState<Date | null>(null);

    function handlePrivilegedAction() {
        if (needsReauthentication(lastAuth)) {
            alert('Please re-authenticate to continue.');
            setLastAuth(new Date());
            return;
        }
        // perform privileged action (placeholder)
        console.log('Privileged action executed');
    }

    return (
        <div>
            <h1>Credential</h1>
            <button onClick={handlePrivilegedAction}>Run privileged action</button>
        </div>
    );
}
