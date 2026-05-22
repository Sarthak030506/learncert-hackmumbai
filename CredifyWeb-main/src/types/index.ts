export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  subscriptionTier: 'free' | 'premium';
}

export interface VideoTracking {
  id: string;
  userId: string;
  youtubeId: string;
  videoTitle: string;
  durationWatched: number; // in seconds
  totalDuration: number; // in seconds
  status: 'watching' | 'completed';
  timestamp: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseName: string;
  platform: string;
  issuedAt: string;
  blockchainHash?: string;
  metadata: {
    videoIds: string[];
    totalHours: number;
    completionDate: string;
  };
}

export interface AnalyticsData {
  userId: string;
  totalHoursWatched: number;
  coursesCompleted: number;
  learningStreak: number;
  topCategories: string[];
  lastUpdated: string;
}
