import type {
  Author,
  Book,
  FeedActivityItem,
  Locale,
  LocalizedText,
  Review,
  Testimonial,
  User,
} from '@/types';
import { getGenreLabel } from './ui';

export type ResolvedAuthor = Omit<Author, 'shortBio' | 'notableWork'> & {
  shortBio: string;
  notableWork: string;
};

export type ResolvedBook = Omit<
  Book,
  | 'title'
  | 'subtitle'
  | 'format'
  | 'ratingCount'
  | 'description'
  | 'shortDescription'
  | 'quote'
  | 'mood'
  | 'shelves'
  | 'genres'
> & {
  title: string;
  subtitle: string;
  format: string;
  ratingCount: string;
  description: string;
  shortDescription: string;
  quote: string;
  mood: string;
  shelves: string;
  genres: string[];
};

export type ResolvedReview = Omit<
  Review,
  'title' | 'excerpt' | 'body' | 'createdAt'
> & {
  title: string;
  excerpt: string;
  body: string;
  createdAt: string;
};

export type ResolvedUser = Omit<
  User,
  'role' | 'bio' | 'followers' | 'following' | 'pagesRead' | 'badges' | 'activity'
> & {
  role: string;
  bio: string;
  followers: string;
  following: string;
  pagesRead: string;
  badges: string[];
  activity: Array<{
    id: string;
    type: User['activity'][number]['type'];
    content: string;
    bookId?: string;
    targetUserId?: string;
    createdAt: string;
    timestamp: string;
    likes?: number;
    comments?: number;
  }>;
};

export type ResolvedFeedActivityItem = Omit<FeedActivityItem, 'content' | 'createdAt'> & {
  content: string;
  createdAt: string;
};

export type ResolvedTestimonial = Omit<Testimonial, 'quote' | 'label'> & {
  quote: string;
  label: string;
};

export const localizeText = (value: LocalizedText | string, locale: Locale) =>
  typeof value === 'string' ? value : value[locale];

const formatCompactCount = (value: number) => {
  if (value >= 1000) {
    const compactValue = value / 1000;
    return `${compactValue.toFixed(compactValue >= 10 ? 1 : 1).replace('.0', '')}k`;
  }

  return `${value}`;
};

export const localizeAuthor = (author: Author, locale: Locale): ResolvedAuthor => ({
  ...author,
  shortBio: localizeText(author.shortBio, locale),
  notableWork: localizeText(author.notableWork, locale),
});

export const localizeBook = (book: Book, locale: Locale): ResolvedBook => ({
  ...book,
  title: localizeText(book.title, locale),
  subtitle: localizeText(book.subtitle, locale),
  format: localizeText(book.format, locale),
  ratingCount: localizeText(book.ratingCount, locale),
  description: localizeText(book.description, locale),
  shortDescription: localizeText(book.shortDescription, locale),
  quote: localizeText(book.quote, locale),
  mood: localizeText(book.mood, locale),
  shelves: localizeText(book.shelves, locale),
  genres: book.genres.map((genre) => getGenreLabel(genre, locale)),
});

export const localizeReview = (review: Review, locale: Locale): ResolvedReview => ({
  ...review,
  title: localizeText(review.title, locale),
  excerpt: localizeText(review.excerpt, locale),
  body: localizeText(review.body, locale),
  createdAt: localizeText(review.createdAt, locale),
});

export const localizeUser = (user: User, locale: Locale): ResolvedUser => ({
  ...user,
  role: localizeText(user.role, locale),
  bio: localizeText(user.bio, locale),
  followers:
    locale === 'es'
      ? `${formatCompactCount(user.followersCount)} seguidores`
      : `${formatCompactCount(user.followersCount)} followers`,
  following:
    locale === 'es'
      ? `${formatCompactCount(user.followingCount)} siguiendo`
      : `${formatCompactCount(user.followingCount)} following`,
  pagesRead: localizeText(user.pagesRead, locale),
  badges: user.badges.map((badge) => localizeText(badge, locale)),
  activity: user.activity.map((item) => ({
    ...item,
    content: localizeText(item.content, locale),
    createdAt: localizeText(item.createdAt, locale),
  })),
});

export const localizeTestimonial = (
  testimonial: Testimonial,
  locale: Locale,
): ResolvedTestimonial => ({
  ...testimonial,
  quote: localizeText(testimonial.quote, locale),
  label: localizeText(testimonial.label, locale),
});

export const localizeActivityItem = (
  item: FeedActivityItem,
  locale: Locale,
): ResolvedFeedActivityItem => ({
  ...item,
  content: localizeText(item.content, locale),
  createdAt: localizeText(item.createdAt, locale),
});
