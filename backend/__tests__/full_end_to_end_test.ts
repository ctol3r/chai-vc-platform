import { createCandidate, addCourseCredential, getCandidate } from '../src/controllers/candidate_profile_controller.ts';

(async () => {
  const candidate = createCandidate('cand1', 'Jane Doe');
  await addCourseCredential('cand1', 'Blockchain 101');
  const result = getCandidate('cand1');
  if (!result || result.credentials.length === 0) {
    throw new Error('Credential minting failed');
  }
  console.log('Candidate profile with credentials:', result);
})();
