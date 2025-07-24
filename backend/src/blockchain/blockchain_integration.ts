import { PolkadotService } from './polkadot_service.ts';
import { CourseCredential } from '../models/candidate_profile';

const polkadot = new PolkadotService();

export async function mintCourseCredential(candidateId: string, courseName: string): Promise<CourseCredential> {
  const metadata = JSON.stringify({ candidateId, courseName, issued: new Date().toISOString() });
  const { tokenId, owner } = await polkadot.mintNFT(metadata);
  return {
    courseName,
    tokenId,
    blockchainAddress: owner,
    issueDate: new Date(),
  };
}
