// Shared types for the application
export interface Candidate {
  _id?: string;
  id?: string;
  name: string;
  position: string;
  votes: number;
  image?: string;
}

export interface ApiError {
  message: string;
  error?: string;
}

