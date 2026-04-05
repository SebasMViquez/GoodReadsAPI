export type ThemeMode = 'dark' | 'light';
export type Locale = 'es' | 'en';
export type LocalizedText = Record<Locale, string>;
export type ProfileVisibility = 'public' | 'private';
export type InterfaceDensity = 'comfortable' | 'compact';
export type MessageAccess = 'everyone' | 'followers';
export type NotificationType =
  | 'message'
  | 'follow'
  | 'activity'
  | 'follow-request'
  | 'request-approved';

export type ShelfStatus = 'want-to-read' | 'currently-reading' | 'read';

export interface SocialComment {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface Author {
  id: string;
  name: string;
  portrait: string;
  location: string;
  shortBio: LocalizedText;
  notableWork: LocalizedText;
}

export interface Book {
  id: string;
  slug: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  authorId: string;
  year: number;
  pageCount: number;
  format: LocalizedText;
  rating: number;
  ratingCount: LocalizedText;
  description: LocalizedText;
  shortDescription: LocalizedText;
  quote: LocalizedText;
  cover: string;
  backdrop: string;
  genres: string[];
  mood: LocalizedText;
  accent: string;
  shelves: LocalizedText;
  friendsReading: number;
  featured?: boolean;
  trending?: boolean;
  editorPick?: boolean;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText;
  likes: number;
  comments: number;
  likedBy?: string[];
  commentItems?: SocialComment[];
  createdAt: LocalizedText;
  featured?: boolean;
}

export interface ReadingProgress {
  bookId: string;
  progress: number;
}

export interface ActivityItem {
  id: string;
  type: 'finished' | 'review' | 'started' | 'favorite' | 'follow' | 'shelf';
  content: LocalizedText;
  bookId?: string;
  targetUserId?: string;
  createdAt: LocalizedText;
  timestamp: string;
  likes?: number;
  comments?: number;
  likedBy?: string[];
  commentItems?: SocialComment[];
}

export interface FeedActivityItem extends ActivityItem {
  userId: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  banner: string;
  role: LocalizedText;
  bio: LocalizedText;
  location: string;
  website?: string;
  profileVisibility: ProfileVisibility;
  followersCount: number;
  followingCount: number;
  booksRead: number;
  pagesRead: LocalizedText;
  streak: number;
  favoriteGenres: string[];
  badges: LocalizedText[];
  wantToRead: string[];
  currentlyReading: ReadingProgress[];
  read: string[];
  favoriteBooks: string[];
  featuredReviews: string[];
  activity: ActivityItem[];
}

export interface AuthAccount {
  userId: string;
  email: string;
  password: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  status: 'sent' | 'seen';
}

export interface Conversation {
  id: string;
  participantIds: [string, string];
  updatedAt: string;
  messages: Message[];
}

export interface FollowRequest {
  id: string;
  requesterId: string;
  targetUserId: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  actorUserId?: string;
  bookId?: string;
  requestId?: string;
  message?: string;
  createdAt: string;
  read: boolean;
}

export interface Testimonial {
  id: string;
  quote: LocalizedText;
  userId: string;
  label: LocalizedText;
}

export interface AppSettings {
  privacy: {
    messageAccess: MessageAccess;
    showReadingActivity: boolean;
    showFavorites: boolean;
    showFollowers: boolean;
  };
  notifications: {
    likes: boolean;
    follows: boolean;
    comments: boolean;
    messages: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  appearance: {
    density: InterfaceDensity;
    reduceMotion: boolean;
  };
  language: {
    contentLocale: Locale;
  };
  reading: {
    yearlyGoal: number;
    preferredFormat: string;
    favoriteGenres: string[];
    showReadingProgress: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionAlerts: boolean;
  };
}
