import { issueCredential } from '../src/controllers/credential_controller';

(async () => {
    await issueCredential('user123', { id: 'cred1' });
    console.log('audit scrapbook test executed');
})();
