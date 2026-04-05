import type { Locale, ReadingProgress, ShelfStatus } from '@/types';
import { authors } from './authors';
import { books } from './books';
import { reviews, testimonials } from './reviews';
import { users } from './users';

export { authors, books, reviews, testimonials, users };

export const currentUser = users[0];

export const getAuthorById = (authorId: string) =>
  authors.find((author) => author.id === authorId);

export const getBookById = (bookId: string) =>
  books.find((book) => book.id === bookId);

export const getBookBySlug = (slug: string) =>
  books.find((book) => book.slug === slug);

export const getUserById = (userId: string) =>
  users.find((user) => user.id === userId);

export const getUserByUsername = (username: string) =>
  users.find((user) => user.username === username);

export const getReviewById = (reviewId: string) =>
  reviews.find((review) => review.id === reviewId);

export const getReviewsForBook = (bookId: string) =>
  reviews.filter((review) => review.bookId === bookId);

export const getReviewsForUser = (userId: string) =>
  reviews.filter((review) => review.userId === userId);

export const getBooksByIds = (bookIds: string[]) =>
  bookIds
    .map((id) => getBookById(id))
    .filter((book): book is NonNullable<typeof book> => Boolean(book));

export const getBooksFromProgress = (entries: ReadingProgress[]) =>
  entries
    .map((entry) => {
      const book = getBookById(entry.bookId);
      return book ? { ...book, progress: entry.progress } : null;
    })
    .filter((book): book is NonNullable<typeof book> => Boolean(book));

export const getRelatedBooks = (bookId: string, limit = 4) => {
  const book = getBookById(bookId);

  if (!book) {
    return [];
  }

  return books
    .filter(
      (candidate) =>
        candidate.id !== book.id &&
        candidate.genres.some((genre) => book.genres.includes(genre)),
    )
    .slice(0, limit);
};

export const featuredBooks = books.filter((book) => book.featured);
export const trendingBooks = books.filter((book) => book.trending);
export const editorPicks = books.filter((book) => book.editorPick);
export const featuredReviews = reviews.filter((review) => review.featured);
export const topReviewers = users.slice(0, 4);

export const genreLabels = Array.from(
  new Set(books.flatMap((book) => book.genres)),
).sort();

export const getShelfLabel = (shelf: ShelfStatus, locale: Locale = 'en') => {
  const labels: Record<ShelfStatus, Record<Locale, string>> = {
    'want-to-read': { en: 'Want to Read', es: 'Quiero leer' },
    'currently-reading': { en: 'Currently Reading', es: 'Leyendo ahora' },
    read: { en: 'Read', es: 'Leidos' },
  };

  return labels[shelf][locale];
};
