import type { Locale } from '@/types';

export const genreLabels: Record<string, Record<Locale, string>> = {
  'Literary Fiction': { en: 'Literary Fiction', es: 'Ficcion literaria' },
  Speculative: { en: 'Speculative', es: 'Especulativa' },
  'Book Club': { en: 'Book Club', es: 'Club de lectura' },
  Mystery: { en: 'Mystery', es: 'Misterio' },
  'Urban Fiction': { en: 'Urban Fiction', es: 'Ficcion urbana' },
  'Historical Fiction': { en: 'Historical Fiction', es: 'Ficcion historica' },
  Feminist: { en: 'Feminist', es: 'Feminista' },
  Contemporary: { en: 'Contemporary', es: 'Contemporanea' },
  Romance: { en: 'Romance', es: 'Romance' },
  'Science Fiction': { en: 'Science Fiction', es: 'Ciencia ficcion' },
  'Space Opera': { en: 'Space Opera', es: 'Opera espacial' },
  Adventure: { en: 'Adventure', es: 'Aventura' },
  Fantasy: { en: 'Fantasy', es: 'Fantasia' },
  Cozy: { en: 'Cozy', es: 'Acogedora' },
  Thriller: { en: 'Thriller', es: 'Thriller' },
  'Magical Realism': { en: 'Magical Realism', es: 'Realismo magico' },
  'Family Saga': { en: 'Family Saga', es: 'Saga familiar' },
  Memoir: { en: 'Memoir', es: 'Memorias' },
  Essays: { en: 'Essays', es: 'Ensayos' },
  Travel: { en: 'Travel', es: 'Viajes' },
  Drama: { en: 'Drama', es: 'Drama' },
  'Feel-Good': { en: 'Feel-Good', es: 'Reconfortante' },
  'Climate Fiction': { en: 'Climate Fiction', es: 'Ficcion climatica' },
  Political: { en: 'Political', es: 'Politica' },
};

export const ui = {
  common: {
    language: { en: 'Language', es: 'Idioma' },
    spanish: { en: 'Spanish', es: 'Espanol' },
    english: { en: 'English', es: 'Ingles' },
    light: { en: 'Light', es: 'Claro' },
    dark: { en: 'Dark', es: 'Oscuro' },
    browseNow: { en: 'Browse now', es: 'Explorar ahora' },
    startExploring: { en: 'Start exploring', es: 'Empezar a explorar' },
    nothingHereYet: { en: 'Nothing here yet', es: 'Aun no hay nada aqui' },
    trending: { en: 'Trending', es: 'Tendencia' },
    editorPick: { en: 'Editor pick', es: 'Seleccion editorial' },
    readingProgress: { en: 'Reading progress', es: 'Progreso de lectura' },
    viewDetails: { en: 'View details', es: 'Ver detalles' },
    searchPlaceholder: {
      en: 'Search books, authors, moods, or genres',
      es: 'Buscar libros, autores, tonos o generos',
    },
    pageNotFoundTitle: {
      en: 'This page drifted off the shelf',
      es: 'Esta pagina se perdio del estante',
    },
    pageNotFoundDescription: {
      en: 'The route exists in imagination only. Use the main navigation to jump back into the curated experience.',
      es: 'La ruta solo existe en la imaginacion. Usa la navegacion principal para volver a la experiencia curada.',
    },
    returnHome: { en: 'Return home', es: 'Volver al inicio' },
  },
  nav: {
    home: { en: 'Home', es: 'Inicio' },
    discover: { en: 'Discover', es: 'Descubrir' },
    readers: { en: 'Readers', es: 'Lectores' },
    library: { en: 'My Library', es: 'Mi biblioteca' },
    community: { en: 'Community', es: 'Comunidad' },
    profile: { en: 'Profile', es: 'Perfil' },
    brandTagline: {
      en: 'Curated reading, beautifully staged',
      es: 'Lectura curada, presentada con elegancia',
    },
    navigate: { en: 'Navigate', es: 'Navegar' },
  },
  footer: {
    eyebrow: { en: 'For readers with taste', es: 'Para lectores con criterio' },
    title: {
      en: 'Discover books through a premium editorial lens.',
      es: 'Descubre libros a traves de una mirada editorial premium.',
    },
    description: {
      en: 'GoodReads blends discovery, shelving, reviews, and reader identity into a social reading experience that feels cinematic on every screen.',
      es: 'GoodReads mezcla descubrimiento, listas, resenas e identidad lectora en una experiencia social de lectura con tono cinematografico en cualquier pantalla.',
    },
    navigate: { en: 'Navigate', es: 'Navegacion' },
    highlights: { en: 'Highlights', es: 'Destacados' },
    follow: { en: 'Follow', es: 'Seguir' },
    editorialPicks: { en: 'Editorial picks', es: 'Selecciones editoriales' },
    topReviewers: { en: 'Top reviewers', es: 'Mejores resenistas' },
    readingLists: { en: 'Reading lists', es: 'Listas de lectura' },
    seasonalArrivals: { en: 'Seasonal arrivals', es: 'Novedades de temporada' },
    bottomCopy: {
      en: 'Designed as a premium reading product concept.',
      es: 'Disenado como concepto de producto premium para lectura.',
    },
    bottomCta: { en: 'Start your next shelf', es: 'Empieza tu siguiente estante' },
  },
  shelves: {
    want: { en: 'Want to Read', es: 'Quiero leer' },
    current: { en: 'Currently Reading', es: 'Leyendo ahora' },
    read: { en: 'Read', es: 'Leidos' },
  },
} as const;

export const getGenreLabel = (genre: string, locale: Locale) =>
  genreLabels[genre]?.[locale] ?? genre;
