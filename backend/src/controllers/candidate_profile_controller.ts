import { CandidateProfile, CourseCredential } from '../models/candidate_profile';
import { mintCourseCredential } from '../blockchain/blockchain_integration.ts';

const profiles: Record<string, CandidateProfile> = {};

export function createCandidate(id: string, name: string): CandidateProfile {
  const profile: CandidateProfile = { id, name, credentials: [] };
  profiles[id] = profile;
  return profile;
}

export async function addCourseCredential(candidateId: string, courseName: string): Promise<CourseCredential> {
  const profile = profiles[candidateId];
  if (!profile) {
    throw new Error('Candidate not found');
  }
  const credential = await mintCourseCredential(candidateId, courseName);
  profile.credentials.push(credential);
  return credential;
}

export function getCandidate(candidateId: string): CandidateProfile | undefined {
  return profiles[candidateId];
}
