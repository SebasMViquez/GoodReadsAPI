import type { Author } from '@/types';
import { realAuthorOverrides } from './realCatalog';

const copy = (en: string, es: string) => ({ en, es });

const seededAuthors: Author[] = [
  {
    id: 'author-elia-marrow',
    name: 'Elia Marrow',
    portrait:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    location: 'London, United Kingdom',
    shortBio: copy(
      'Elia writes literary speculative fiction about memory, intimacy, and the architecture of belonging.',
      'Elia escribe ficcion especulativa literaria sobre memoria, intimidad y la arquitectura de la pertenencia.',
    ),
    notableWork: copy('The Glass Archive', 'El archivo de cristal'),
  },
  {
    id: 'author-soren-vale',
    name: 'Soren Vale',
    portrait:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    location: 'Copenhagen, Denmark',
    shortBio: copy(
      'A former urban designer turned novelist, Soren crafts cerebral stories with emotional weather.',
      'Ex disenador urbano convertido en novelista, Soren crea historias cerebrales con clima emocional.',
    ),
    notableWork: copy('Midnight Cartography', 'Cartografia de medianoche'),
  },
  {
    id: 'author-linh-duvall',
    name: 'Linh Duvall',
    portrait:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    location: 'Montreal, Canada',
    shortBio: copy(
      'Linh blends historical texture and luminous prose to explore rituals, grief, and resilience.',
      'Linh mezcla textura historica y prosa luminosa para explorar rituales, duelo y resiliencia.',
    ),
    notableWork: copy('A Theory of Lanterns', 'Una teoria de los faroles'),
  },
  {
    id: 'author-iris-navarro',
    name: 'Iris Navarro',
    portrait:
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
    location: 'Barcelona, Spain',
    shortBio: copy(
      'Iris is known for intimate character studies rooted in food, memory, and quiet transformation.',
      'Iris es conocida por estudios intimos de personaje arraigados en la comida, la memoria y la transformacion silenciosa.',
    ),
    notableWork: copy('Salt Between Chapters', 'Sal entre capitulos'),
  },
  {
    id: 'author-niko-sol',
    name: 'Niko Sol',
    portrait:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80',
    location: 'Santiago, Chile',
    shortBio: copy(
      'Niko writes cinematic science fiction with lush world-building and meditative pacing.',
      'Niko escribe ciencia ficcion cinematografica con mundos exuberantes y un ritmo meditativo.',
    ),
    notableWork: copy('Velvet Astronomy', 'Astronomia de terciopelo'),
  },
  {
    id: 'author-marianne-caul',
    name: 'Marianne Caul',
    portrait:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80',
    location: 'Edinburgh, Scotland',
    shortBio: copy(
      'Marianne creates fantastical novels filled with tactile detail, folklore, and fierce tenderness.',
      'Marianne crea novelas fantasticas llenas de detalle tactil, folclore y una ternura feroz.',
    ),
    notableWork: copy('Ink & Winter', 'Tinta e invierno'),
  },
  {
    id: 'author-casper-holloway',
    name: 'Casper Holloway',
    portrait:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    location: 'Dublin, Ireland',
    shortBio: copy(
      'Casper builds literary mysteries around obsession, archives, and the stories people withhold.',
      'Casper construye misterios literarios alrededor de la obsesion, los archivos y las historias que la gente oculta.',
    ),
    notableWork: copy('The Quiet Index', 'El indice silencioso'),
  },
  {
    id: 'author-celeste-yoon',
    name: 'Celeste Yoon',
    portrait:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    location: 'Seoul, South Korea',
    shortBio: copy(
      'Celeste writes ambitious cross-genre fiction where time, family, and ambition blur together.',
      'Celeste escribe ficcion ambiciosa entre generos donde el tiempo, la familia y la ambicion se difuminan.',
    ),
    notableWork: copy('The Orchard of Hours', 'El huerto de las horas'),
  },
];

export const authors: Author[] = seededAuthors.map((author) => ({
  ...author,
  ...(realAuthorOverrides[author.id] ?? {}),
}));
