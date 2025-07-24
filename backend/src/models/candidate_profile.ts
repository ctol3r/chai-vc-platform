export interface CandidateProfile {
  id: string;
  name: string;
  credentials: CourseCredential[];
}

export interface CourseCredential {
  courseName: string;
  tokenId: string;
  blockchainAddress: string;
  issueDate: Date;
}
