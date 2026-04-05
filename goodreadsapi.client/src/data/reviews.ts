import type { Review, Testimonial } from '@/types';

const copy = (en: string, es: string) => ({ en, es });

export const reviews: Review[] = [
  {
    id: 'review-01',
    bookId: 'book-glass-archive',
    userId: 'user-amelia',
    rating: 5,
    title: copy(
      'Like stepping inside a memory palace built from grief',
      'Como entrar en un palacio de la memoria construido con duelo',
    ),
    excerpt: copy(
      'This feels like prestige television translated into prose: elegant, devastating, and impossible to shake.',
      'Se siente como television de prestigio traducida a prosa: elegante, devastadora e imposible de sacudirse.',
    ),
    body: copy(
      'Marrow writes with an astonishing sense of atmosphere. The city itself becomes a character, but what stayed with me most was how intimate the novel remains even while its ideas are enormous. I highlighted more passages here than in any book I have read this year.',
      'Marrow escribe con un sentido de atmosfera asombroso. La ciudad misma se vuelve personaje, pero lo que mas se me quedo fue la intimidad que conserva la novela incluso cuando sus ideas son enormes. Subraye mas pasajes aqui que en cualquier otro libro que haya leido este ano.',
    ),
    likes: 1240,
    comments: 86,
    createdAt: copy('2 days ago', 'hace 2 dias'),
    featured: true,
  },
  {
    id: 'review-02',
    bookId: 'book-midnight-cartography',
    userId: 'user-dorian',
    rating: 4,
    title: copy(
      'Inventive urban fantasy for people who love maps and melancholy',
      'Fantasia urbana inventiva para quienes aman los mapas y la melancolia',
    ),
    excerpt: copy(
      'The speculative premise is brilliant, but the emotional architecture is what gives it weight.',
      'La premisa especulativa es brillante, pero la arquitectura emocional es lo que le da peso.',
    ),
    body: copy(
      'The middle section slows down intentionally, yet I found the payoff worth it. It is a city novel in the deepest sense: infrastructure, memory, loneliness, transit, and all the secret systems we build to survive ourselves.',
      'La seccion media desacelera de forma intencional, pero senti que la recompensa lo justifica. Es una novela de ciudad en el sentido mas profundo: infraestructura, memoria, soledad, transito y todos los sistemas secretos que construimos para sobrevivirnos.',
    ),
    likes: 902,
    comments: 48,
    createdAt: copy('5 days ago', 'hace 5 dias'),
    featured: true,
  },
  {
    id: 'review-03',
    bookId: 'book-theory-of-lanterns',
    userId: 'user-safiya',
    rating: 5,
    title: copy('Opulent, tactile, and emotionally precise', 'Opulenta, tactil y emocionalmente precisa'),
    excerpt: copy(
      'Every page glows with detail, but the craft never overwhelms the women at the center.',
      'Cada pagina brilla con detalle, pero el oficio nunca eclipsa a las mujeres del centro de la historia.',
    ),
    body: copy(
      'This is the kind of historical fiction that trusts readers to fall in love with labor, routine, and lineage. I came for the lantern atelier and stayed for the intergenerational complexity. Absolute stunner.',
      'Esta es la clase de ficcion historica que confia en que el lector se enamore del trabajo, la rutina y el linaje. Vine por el atelier de faroles y me quede por su complejidad intergeneracional. Una maravilla absoluta.',
    ),
    likes: 2104,
    comments: 112,
    createdAt: copy('1 week ago', 'hace 1 semana'),
    featured: true,
  },
  {
    id: 'review-04',
    bookId: 'book-salt-between-chapters',
    userId: 'user-julian',
    rating: 4,
    title: copy('Tender without becoming overly sweet', 'Tierna sin volverse empalagosa'),
    excerpt: copy(
      'Food writing, family drama, and a second-chance romance that actually earns its softness.',
      'Escritura sobre comida, drama familiar y un romance de segunda oportunidad que realmente se gana su suavidad.',
    ),
    body: copy(
      'A quieter book than the marketing suggests, which for me was a strength. The recipe fragments felt like emotional annotations, and Alba is such a grounded protagonist.',
      'Es un libro mas silencioso de lo que sugiere el marketing, y para mi eso fue una fortaleza. Los fragmentos de recetas se sintieron como anotaciones emocionales, y Alba es una protagonista muy aterrizada.',
    ),
    likes: 486,
    comments: 21,
    createdAt: copy('3 days ago', 'hace 3 dias'),
  },
  {
    id: 'review-05',
    bookId: 'book-velvet-astronomy',
    userId: 'user-safiya',
    rating: 5,
    title: copy('Grand scale, intimate pulse', 'Escala inmensa, pulso intimo'),
    excerpt: copy(
      'The political negotiations are thrilling, but the real marvel is how emotionally legible the whole galaxy feels.',
      'Las negociaciones politicas son emocionantes, pero el verdadero milagro es lo emocionalmente legible que se siente toda la galaxia.',
    ),
    body: copy(
      'Niko Sol understands that vast stories need a human heartbeat. I loved the chamber-music rhythm of the dialogue and the confidence of the world-building.',
      'Niko Sol entiende que las historias vastas necesitan un latido humano. Me encanto el ritmo de musica de camara en los dialogos y la seguridad del world-building.',
    ),
    likes: 1312,
    comments: 74,
    createdAt: copy('6 days ago', 'hace 6 dias'),
  },
  {
    id: 'review-06',
    bookId: 'book-ink-and-winter',
    userId: 'user-amelia',
    rating: 5,
    title: copy(
      'A fantasy novel with the hush of snowfall',
      'Una novela fantastica con el silencio de la nieve cayendo',
    ),
    excerpt: copy(
      'This book made me want to sit by a window, light a candle, and believe that weather can be written.',
      'Este libro me hizo querer sentarme junto a una ventana, encender una vela y creer que el clima puede escribirse.',
    ),
    body: copy(
      'The monastery setting is exquisite. I appreciated how Marianne Caul balances coziness with genuine stakes; the novel feels handmade in the best way.',
      'El escenario del monasterio es exquisito. Aprecio como Marianne Caul equilibra calidez con riesgos reales; la novela se siente hecha a mano en el mejor sentido.',
    ),
    likes: 1750,
    comments: 91,
    createdAt: copy('2 weeks ago', 'hace 2 semanas'),
  },
  {
    id: 'review-07',
    bookId: 'book-quiet-index',
    userId: 'user-dorian',
    rating: 4,
    title: copy(
      'For readers who enjoy mysteries built from omission',
      'Para lectores que disfrutan misterios construidos desde la omision',
    ),
    excerpt: copy(
      'The premise hooked me immediately, and the atmosphere is excellent from the first page.',
      'La premisa me atrapo de inmediato, y la atmosfera es excelente desde la primera pagina.',
    ),
    body: copy(
      'I would have loved a bit more from the ending, but the central idea is so good that I am still thinking about it. Rare literary thriller energy.',
      'Me habria gustado un poco mas del final, pero la idea central es tan buena que sigo pensando en ella. Energia de thriller literario poco comun.',
    ),
    likes: 512,
    comments: 19,
    createdAt: copy('4 days ago', 'hace 4 dias'),
  },
  {
    id: 'review-08',
    bookId: 'book-orchard-of-hours',
    userId: 'user-julian',
    rating: 5,
    title: copy(
      'A family saga with the elegance of magical realism at its best',
      'Una saga familiar con la elegancia del mejor realismo magico',
    ),
    excerpt: copy(
      'It is lush, yes, but never ornamental. Every miracle reveals something human.',
      'Es exuberante, si, pero nunca ornamental. Cada milagro revela algo humano.',
    ),
    body: copy(
      'This novel is about ambition, sacrifice, and the emotional bookkeeping that families do across generations. One of the easiest five-star reads I have had in months.',
      'Esta novela trata sobre ambicion, sacrificio y la contabilidad emocional que las familias llevan entre generaciones. Uno de los cinco estrellas mas faciles que he dado en meses.',
    ),
    likes: 1184,
    comments: 63,
    createdAt: copy('1 week ago', 'hace 1 semana'),
  },
  {
    id: 'review-09',
    bookId: 'book-atlas-of-soft-fires',
    userId: 'user-noor',
    rating: 4,
    title: copy(
      'A beautiful companion for anyone rebuilding quietly',
      'Una compania hermosa para quien se reconstruye en silencio',
    ),
    excerpt: copy(
      'Softly intellectual and full of observations that feel true in the body before they feel true on the page.',
      'Suavemente intelectual y llena de observaciones que se sienten ciertas en el cuerpo antes que en la pagina.',
    ),
    body: copy(
      'I found this collection unexpectedly moving. It avoids the usual self-optimization language and instead lingers in ambiguity, place, and recovery.',
      'Me parecio una coleccion inesperadamente conmovedora. Evita el lenguaje habitual de autooptimizacion y prefiere demorarse en la ambiguedad, el lugar y la recuperacion.',
    ),
    likes: 329,
    comments: 13,
    createdAt: copy('8 days ago', 'hace 8 dias'),
  },
  {
    id: 'review-10',
    bookId: 'book-paper-moons',
    userId: 'user-noor',
    rating: 4,
    title: copy('Glamour with moral complexity underneath', 'Glamour con complejidad moral debajo'),
    excerpt: copy(
      'The romance sparkles, but it is the class tension and labor politics that give the novel its shape.',
      'El romance brilla, pero son la tension de clase y la politica laboral las que le dan forma a la novela.',
    ),
    body: copy(
      'I loved the setting and the costume details. The ending lands on a note that feels earned rather than easy, which made me appreciate it even more.',
      'Me encantaron el escenario y los detalles del vestuario. El final cae en una nota que se siente ganada y no facil, y eso hizo que la apreciara aun mas.',
    ),
    likes: 441,
    comments: 28,
    createdAt: copy('9 days ago', 'hace 9 dias'),
  },
  {
    id: 'review-11',
    bookId: 'book-rooms-for-starlight',
    userId: 'user-amelia',
    rating: 5,
    title: copy('Interior design as emotional architecture', 'El diseno interior como arquitectura emocional'),
    excerpt: copy(
      'A healing novel that still has edge, intention, and a beautiful sense of place.',
      'Una novela reparadora que aun conserva filo, intencion y un hermoso sentido del lugar.',
    ),
    body: copy(
      'This is exactly the sort of contemporary fiction I want more of: visually evocative, warm without being bland, and populated by adults with believable histories.',
      'Esto es exactamente el tipo de ficcion contemporanea que quiero leer mas: visualmente evocadora, calida sin ser plana y habitada por adultos con historias creibles.',
    ),
    likes: 688,
    comments: 34,
    createdAt: copy('5 days ago', 'hace 5 dias'),
  },
  {
    id: 'review-12',
    bookId: 'book-ninth-season',
    userId: 'user-safiya',
    rating: 5,
    title: copy(
      'Political, lyrical, and terrifyingly plausible',
      'Politica, lirica y aterradoramente plausible',
    ),
    excerpt: copy(
      'Climate fiction often sacrifices character for urgency. This one does not.',
      'La ficcion climatica a menudo sacrifica personaje por urgencia. Esta no.',
    ),
    body: copy(
      'The world feels lived-in, the stakes are sharp, and the central relationship keeps the whole thing emotionally grounded. I would gladly spend another 500 pages in this world.',
      'El mundo se siente vivido, los riesgos son agudos y la relacion central mantiene todo emocionalmente anclado. Pasaria con gusto otras 500 paginas en este universo.',
    ),
    likes: 1642,
    comments: 98,
    createdAt: copy('1 day ago', 'hace 1 dia'),
    featured: true,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    quote: copy(
      'GoodReads makes discovering your next favorite novel feel cinematic instead of transactional.',
      'GoodReads hace que descubrir tu proxima novela favorita se sienta cinematografico en lugar de transaccional.',
    ),
    userId: 'user-amelia',
    label: copy('Monthly book club host', 'Host de club de lectura mensual'),
  },
  {
    id: 'testimonial-2',
    quote: copy(
      'I came for the recommendations and stayed for the way every shelf feels curated, not cluttered.',
      'Vine por las recomendaciones y me quede por la forma en que cada estante se siente curado, no saturado.',
    ),
    userId: 'user-safiya',
    label: copy('Reads 80 books a year', 'Lee 80 libros al ano'),
  },
  {
    id: 'testimonial-3',
    quote: copy(
      'The whole product feels like a boutique reading salon disguised as an app.',
      'Todo el producto se siente como un salon boutique de lectura disfrazado de app.',
    ),
    userId: 'user-dorian',
    label: copy('Critic and essayist', 'Critico y ensayista'),
  },
];
