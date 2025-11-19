export type UserProfile = {
  id?: number;
  name: string;
  bio: string;
  location: string;
  typicalDrivingTimes: string;
  contactInfo: string;
  parkingPass: string;
  major: string;
  extracurriculars: string;
};

export type Recommendation = {
  user: UserProfile;
  score: number;
};

export type Rating = {
  id?: number;
  fromUserId: number;
  toUserId: number;
  role: "driver" | "passenger";
  score: number;
  comments: string;
};

export type PaymentSuggestionRequest = {
  distanceMiles: number;
  gasPrice: number;
};

export type IssueReportRequest = {
  userId?: number;
  message: string;
  category?: string;
};

