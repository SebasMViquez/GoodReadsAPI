import type { Book } from '@/types';
import { realBookOverrides } from './realCatalog';

const copy = (en: string, es: string) => ({ en, es });

const seededBooks: Book[] = [
  {
    id: 'book-glass-archive',
    slug: 'the-glass-archive',
    title: copy('The Glass Archive', 'El archivo de cristal'),
    subtitle: copy(
      'A novel about memory and illuminated cities',
      'Una novela sobre memoria y ciudades iluminadas',
    ),
    authorId: 'author-elia-marrow',
    year: 2025,
    pageCount: 412,
    format: copy('Hardcover', 'Tapa dura'),
    rating: 4.8,
    ratingCount: copy('18.2k ratings', '18.2k valoraciones'),
    description: copy(
      'In a city where discarded memories are turned into translucent architecture, archivist Mara Ansel is asked to preserve a district scheduled for demolition. What begins as a municipal assignment unfolds into a study of inheritance, grief, and the costs of erasing what once defined a place.',
      'En una ciudad donde los recuerdos descartados se convierten en arquitectura translucida, la archivista Mara Ansel recibe el encargo de preservar un distrito destinado a la demolicion. Lo que comienza como una tarea municipal se transforma en una exploracion sobre herencia, duelo y el costo de borrar aquello que alguna vez definio un lugar.',
    ),
    shortDescription: copy(
      'A luminous literary sci-fi novel about cities, memory, and what we choose to preserve.',
      'Una novela luminosa de ciencia ficcion literaria sobre ciudades, memoria y lo que decidimos preservar.',
    ),
    quote: copy(
      'Every room remembers the people who once believed it could save them.',
      'Cada habitacion recuerda a las personas que alguna vez creyeron que podia salvarlas.',
    ),
    cover:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80',
    genres: ['Literary Fiction', 'Speculative', 'Book Club'],
    mood: copy('Luminous and reflective', 'Luminosa y reflexiva'),
    accent: '#d0a46c',
    shelves: copy('341k shelved', '341k en estantes'),
    friendsReading: 128,
    featured: true,
    trending: true,
    editorPick: true,
  },
  {
    id: 'book-midnight-cartography',
    slug: 'midnight-cartography',
    title: copy('Midnight Cartography', 'Cartografia de medianoche'),
    subtitle: copy(
      'Tracing a city that appears only after dark',
      'Trazando una ciudad que solo aparece despues del anochecer',
    ),
    authorId: 'author-soren-vale',
    year: 2024,
    pageCount: 368,
    format: copy('Deluxe Edition', 'Edicion de lujo'),
    rating: 4.7,
    ratingCount: copy('14.6k ratings', '14.6k valoraciones'),
    description: copy(
      'A disillusioned transit planner discovers a parallel map of the city that reveals hidden routes through unresolved histories. Each passage rewrites the streets above, forcing him to decide whether to restore what was buried or protect the present from its ghosts.',
      'Un planificador de transporte desencantado descubre un mapa paralelo de la ciudad que revela rutas ocultas a traves de historias no resueltas. Cada pasaje reescribe las calles de la superficie y lo obliga a decidir entre restaurar lo enterrado o proteger el presente de sus fantasmas.',
    ),
    shortDescription: copy(
      'An atmospheric speculative mystery about hidden maps, impossible streets, and second chances.',
      'Un misterio especulativo y atmosferico sobre mapas ocultos, calles imposibles y segundas oportunidades.',
    ),
    quote: copy(
      'The city kept two versions of itself, and midnight was the hour they briefly aligned.',
      'La ciudad conservaba dos versiones de si misma, y la medianoche era la hora en que por fin se alineaban.',
    ),
    cover:
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80',
    genres: ['Speculative', 'Mystery', 'Urban Fiction'],
    mood: copy('Nocturnal and cerebral', 'Nocturna y cerebral'),
    accent: '#7f9eb8',
    shelves: copy('221k shelved', '221k en estantes'),
    friendsReading: 91,
    featured: true,
    trending: true,
  },
  {
    id: 'book-theory-of-lanterns',
    slug: 'a-theory-of-lanterns',
    title: copy('A Theory of Lanterns', 'Una teoria de los faroles'),
    subtitle: copy(
      'An embroidered history of devotion and dissent',
      'Una historia bordada de devocion y disidencia',
    ),
    authorId: 'author-linh-duvall',
    year: 2023,
    pageCount: 526,
    format: copy('Collector Hardcover', 'Tapa dura de coleccion'),
    rating: 4.9,
    ratingCount: copy('28.4k ratings', '28.4k valoraciones'),
    description: copy(
      'Set across three generations of women who maintain a ceremonial lantern atelier, this sweeping historical novel explores the politics of craftsmanship, the intimacy of inherited labor, and the fragile beauty of art made under pressure.',
      'Ambientada a lo largo de tres generaciones de mujeres que mantienen un atelier ceremonial de faroles, esta amplia novela historica explora la politica del oficio, la intimidad del trabajo heredado y la belleza fragil del arte hecho bajo presion.',
    ),
    shortDescription: copy(
      'A sweeping historical epic woven around ritual, craft, and intergenerational inheritance.',
      'Una epopeya historica tejida alrededor del ritual, el oficio y la herencia entre generaciones.',
    ),
    quote: copy(
      'Light was never the point. It was the careful making of a vessel that could hold it.',
      'La luz nunca fue el objetivo. Lo era la cuidadosa construccion del recipiente capaz de contenerla.',
    ),
    cover:
      'https://images.unsplash.com/photo-1455885666463-9dbc9f48ee41?auto=format&fit=crop&w=900&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=1600&q=80',
    genres: ['Historical Fiction', 'Literary Fiction', 'Feminist'],
    mood: copy('Rich and ceremonial', 'Rica y ceremonial'),
    accent: '#efb782',
    shelves: copy('452k shelved', '452k en estantes'),
    friendsReading: 173,
    featured: true,
    editorPick: true,
  },
  {
    id: 'book-salt-between-chapters',
    slug: 'salt-between-chapters',
    title: copy('Salt Between Chapters', 'Sal entre capitulos'),
    subtitle: copy(
      'Recipes, romance, and the language of return',
      'Recetas, romance y el lenguaje del regreso',
    ),
    authorId: 'author-iris-navarro',
    year: 2025,
    pageCount: 304,
    format: copy('Trade Paperback', 'Rustica comercial'),
    rating: 4.5,
    ratingCount: copy('9.1k ratings', '9.1k valoraciones'),
    description: copy(
      'After a public creative collapse, cookbook ghostwriter Alba returns to her seaside hometown and inherits an unfinished manuscript full of handwritten recipes. Restoring it means confronting an old love and the family stories she salted away years ago.',
      'Tras un colapso creativo publico, la ghostwriter de libros de cocina Alba vuelve a su pueblo costero e hereda un manuscrito inconcluso lleno de recetas escritas a mano. Restaurarlo implica enfrentar un viejo amor y las historias familiares que salo hace anos.',
    ),
    shortDescription: copy(
      'An intimate contemporary novel about food, family, and unfinished love.',
      'Una novela contemporanea e intima sobre comida, familia y amores inconclusos.',
    ),
    quote: copy(
      'Some recipes exist only to prove that grief, too, can be portioned and served warm.',
      'Algunas recetas existen solo para demostrar que el duelo tambien puede racionarse y servirse tibio.',
    ),
    cover:
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=1600&q=80',
    genres: ['Contemporary', 'Romance', 'Book Club'],
    mood: copy('Warm and intimate', 'Calida e intima'),
    accent: '#d58f7a',
    shelves: copy('188k shelved', '188k en estantes'),
    friendsReading: 67,
    trending: true,
  },
  {
    id: 'book-velvet-astronomy',
    slug: 'velvet-astronomy',
    title: copy('Velvet Astronomy', 'Astronomia de terciopelo'),
    subtitle: copy(
      'A space opera scored like chamber music',
      'Una opera espacial compuesta como musica de camara',
    ),
    authorId: 'author-niko-sol',
    year: 2024,
    pageCount: 448,
    format: copy('Hardcover', 'Tapa dura'),
    rating: 4.6,
    ratingCount: copy('21.3k ratings', '21.3k valoraciones'),
    description: copy(
      'When a diplomat aboard a generation ship receives transmissions from a dead civilization, she must broker peace among factions that disagree about whether the messages are prophecy, trap, or invitation. The result is intimate science fiction with operatic emotional scale.',
      'Cuando una diplomatica a bordo de una nave generacional recibe transmisiones de una civilizacion extinta, debe negociar la paz entre facciones que no se ponen de acuerdo sobre si los mensajes son profecia, trampa o invitacion. El resultado es ciencia ficcion intima con escala emocional operatica.',
    ),
    shortDescription: copy(
      'A cinematic science fiction epic about diplomacy, longing, and signal from the deep dark.',
      'Una epopeya cinematografica de ciencia ficcion sobre diplomacia, anhelo y una senal desde la oscuridad profunda.',
    ),
    quote: copy(
      'Space was not silent. It only required the patience to hear its velvet frequencies.',
      'El espacio no era silencioso. Solo exigia la paciencia necesaria para escuchar sus frecuencias de terciopelo.',
    ),
    cover:
      'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=80',
    genres: ['Science Fiction', 'Space Opera', 'Adventure'],
    mood: copy('Cinematic and expansive', 'Cinematografica y expansiva'),
    accent: '#7b8fff',
    shelves: copy('259k shelved', '259k en estantes'),
    friendsReading: 112,
    featured: true,
    trending: true,
  },
  {
    id: 'book-ink-and-winter',
    slug: 'ink-and-winter',
    title: copy('Ink & Winter', 'Tinta e invierno'),
    subtitle: copy(
      'A story bound by snowfall and forbidden scripts',
      'Una historia unida por la nieve y escrituras prohibidas',
    ),
    authorId: 'author-marianne-caul',
    year: 2022,
    pageCount: 390,
    format: copy('Illustrated Edition', 'Edicion ilustrada'),
    rating: 4.7,
    ratingCount: copy('33.5k ratings', '33.5k valoraciones'),
    description: copy(
      'In a mountain monastery where scribes transcribe the weather into living manuscripts, apprentice Juniper breaks the rules by writing a future she was never meant to see. The storm that follows forces her into a dangerous alliance with the very winter she awakened.',
      'En un monasterio de montana donde los escribas transcriben el clima en manuscritos vivos, la aprendiz Juniper rompe las reglas al escribir un futuro que nunca debio ver. La tormenta que sigue la obliga a sellar una peligrosa alianza con el mismo invierno que desperto.',
    ),
    shortDescription: copy(
      'A lyrical fantasy novel about snowfall, living books, and the cost of rewriting destiny.',
      'Una novela fantastica y lirica sobre nieve, libros vivos y el precio de reescribir el destino.',
    ),
    quote: copy(
      'She dipped her pen into snowmelt and found the ink already waiting for her.',
      'Mojo la pluma en agua de deshielo y encontro la tinta esperandola.',
    ),
    cover:
      'https://images.unsplash.com/photo-1516972810927-80185027ca84?auto=format&fit=crop&w=900&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=1600&q=80',
    genres: ['Fantasy', 'Literary Fiction', 'Cozy'],
    mood: copy('Mythic and hushed', 'Mitica y silenciosa'),
    accent: '#9db2d2',
    shelves: copy('519k shelved', '519k en estantes'),
    friendsReading: 154,
    editorPick: true,
  },
  {
    id: 'book-quiet-index',
    slug: 'the-quiet-index',
    title: copy('The Quiet Index', 'El indice silencioso'),
    subtitle: copy(
      'An archive mystery told in absences',
      'Un misterio de archivo contado en ausencias',
    ),
    authorId: 'author-casper-holloway',
    year: 2025,
    pageCount: 336,
    format: copy('Hardcover', 'Tapa dura'),
    rating: 4.4,
    ratingCount: copy('7.9k ratings', '7.9k valoraciones'),
    description: copy(
      'A library receives a shipment of index cards cataloguing books that have never existed. As archivist Lena Chase traces the entries, she uncovers a secret society that has spent decades editing public memory through omission rather than censorship.',
      'Una biblioteca recibe un envio de fichas catalograficas que indexan libros que nunca existieron. Mientras la archivista Lena Chase sigue el rastro de las entradas, descubre una sociedad secreta que ha pasado decadas editando la memoria publica a traves de la omision en vez de la censura.',
    ),
    shortDescription: copy(
      'A literary mystery about missing books, secret catalogues, and silence as power.',
      'Un misterio literario sobre libros faltantes, catalogos secretos y el silencio como poder.',
    ),
    quote: copy(
      'Absence has a filing system. Most people simply never learn how to read it.',
      'La ausencia tiene un sistema de archivo. La mayoria simplemente nunca aprende a leerlo.',
    ),
    cover:
      'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=900&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=1600&q=80',
    genres: ['Mystery', 'Thriller', 'Literary Fiction'],
    mood: copy('Tense and intelligent', 'Tensa e inteligente'),
    accent: '#7ea49b',
    shelves: copy('132k shelved', '132k en estantes'),
    friendsReading: 59,
    trending: true,
  },
  {
    id: 'book-orchard-of-hours',
    slug: 'the-orchard-of-hours',
    title: copy('The Orchard of Hours', 'El huerto de las horas'),
    subtitle: copy(
      'A family saga ripening across borrowed time',
      'Una saga familiar que madura a traves del tiempo prestado',
    ),
    authorId: 'author-celeste-yoon',
    year: 2023,
    pageCount: 472,
    format: copy('Hardcover', 'Tapa dura'),
    rating: 4.8,
    ratingCount: copy('19.7k ratings', '19.7k valoraciones'),
    description: copy(
      'On a hillside orchard where fruit can hold a single recovered hour, a family wrestles with the temptation to relive the moments that shaped them. Celeste Yoon turns magical realism into an intimate portrait of ambition, motherhood, and mercy.',
      'En un huerto en la ladera donde la fruta puede contener una hora recuperada, una familia lucha contra la tentacion de revivir los momentos que la formaron. Celeste Yoon convierte el realismo magico en un retrato intimo sobre ambicion, maternidad y misericordia.',
    ),
    shortDescription: copy(
      'A spellbinding family saga where time grows on trees and memory turns harvestable.',
      'Una saga familiar hipnotica donde el tiempo crece en los arboles y la memoria puede cosecharse.',
    ),
    quote: copy(
      'They ate the afternoon like fruit and still found its sweetness impossible to keep.',
      'Se comieron la tarde como fruta y aun asi encontraron imposible conservar su dulzura.',
    ),
    cover:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80&sat=-40',
    backdrop:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    genres: ['Magical Realism', 'Literary Fiction', 'Family Saga'],
    mood: copy('Lush and expansive', 'Exuberante y expansiva'),
    accent: '#b7a36a',
    shelves: copy('284k shelved', '284k en estantes'),
    friendsReading: 103,
    editorPick: true,
  },
  {
    id: 'book-atlas-of-soft-fires',
    slug: 'an-atlas-of-soft-fires',
    title: copy('An Atlas of Soft Fires', 'Un atlas de fuegos suaves'),
    subtitle: copy(
      'Travel essays from the brink of reinvention',
      'Ensayos de viaje desde el borde de la reinvencion',
    ),
    authorId: 'author-elia-marrow',
    year: 2021,
    pageCount: 256,
    format: copy('Paperback Original', 'Edicion original en rustica'),
    rating: 4.3,
    ratingCount: copy('5.4k ratings', '5.4k valoraciones'),
    description: copy(
      'Part memoir, part travelogue, this hybrid work follows an essayist documenting cities in transition while rebuilding her own sense of self after profound burnout. Elegant, observant, and unexpectedly tender.',
      'En parte memorias y en parte cuaderno de viaje, esta obra hibrida sigue a una ensayista que documenta ciudades en transicion mientras reconstruye su propia identidad despues de un agotamiento profundo. Elegante, observadora e inesperadamente tierna.',
    ),
    shortDescription: copy(
      'A hybrid literary memoir tracing cities, healing, and small acts of personal reconstruction.',
      'Unas memorias literarias hibridas que recorren ciudades, sanacion y pequenos actos de reconstruccion personal.',
    ),
    quote: copy(
      'I traveled not to be changed, but to notice how quietly I already had been.',
      'Viaje no para cambiar, sino para notar lo silenciosamente que ya lo habia hecho.',
    ),
    cover:
      'https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=900&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1600&q=80',
    genres: ['Memoir', 'Essays', 'Travel'],
    mood: copy('Airy and introspective', 'Ligera e introspectiva'),
    accent: '#8eb0b4',
    shelves: copy('64k shelved', '64k en estantes'),
    friendsReading: 34,
  },
  {
    id: 'book-paper-moons',
    slug: 'paper-moons-on-canal-street',
    title: copy('Paper Moons on Canal Street', 'Lunas de papel en Canal Street'),
    subtitle: copy(
      'A jazz-age love story with hidden seams',
      'Una historia de amor de la era del jazz con costuras ocultas',
    ),
    authorId: 'author-linh-duvall',
    year: 2022,
    pageCount: 388,
    format: copy('Paperback', 'Rustica'),
    rating: 4.5,
    ratingCount: copy('11.8k ratings', '11.8k valoraciones'),
    description: copy(
      'When a costume maker and an investigative reporter cross paths in 1920s New Orleans, glamour becomes cover for labor unrest, political intrigue, and a romance conducted under electric light. Stylish, sensual, and deeply humane.',
      'Cuando una creadora de vestuario y un reportero de investigacion se cruzan en la Nueva Orleans de los anos veinte, el glamour se convierte en cobertura para conflicto laboral, intriga politica y un romance vivido bajo luz electrica. Elegante, sensual y profundamente humana.',
    ),
    shortDescription: copy(
      'A romantic historical novel shimmering with jazz-age glamour and social tension.',
      'Una novela historica romantica que brilla con glamour de la era del jazz y tension social.',
    ),
    quote: copy(
      'The city made paper stars of everyone, but only some learned how not to burn.',
      'La ciudad hacia estrellas de papel con todos, pero solo algunos aprendieron a no arder.',
    ),
    cover:
      'https://images.unsplash.com/photo-1511105043137-7e66f28270e3?auto=format&fit=crop&w=900&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
    genres: ['Historical Fiction', 'Romance', 'Drama'],
    mood: copy('Velvet and electric', 'Aterciopelada y electrica'),
    accent: '#c98569',
    shelves: copy('171k shelved', '171k en estantes'),
    friendsReading: 74,
  },
  {
    id: 'book-rooms-for-starlight',
    slug: 'rooms-for-starlight',
    title: copy('Rooms for Starlight', 'Habitaciones para la luz de estrellas'),
    subtitle: copy(
      'An interior design of hope after collapse',
      'Un diseno interior de esperanza despues del colapso',
    ),
    authorId: 'author-iris-navarro',
    year: 2024,
    pageCount: 320,
    format: copy('Hardcover', 'Tapa dura'),
    rating: 4.6,
    ratingCount: copy('8.7k ratings', '8.7k valoraciones'),
    description: copy(
      'A designer returns to a half-finished hotel abandoned on a coastal cliff and finds a community of artists quietly reviving it room by room. Each space becomes a study in repair, not perfection.',
      'Una disenadora vuelve a un hotel a medio terminar abandonado en un acantilado costero y encuentra una comunidad de artistas reviviendolo en silencio habitacion por habitacion. Cada espacio se convierte en un estudio sobre reparacion, no sobre perfeccion.',
    ),
    shortDescription: copy(
      'A luminous contemporary novel about restoration, found family, and beautiful spaces built slowly.',
      'Una novela contemporanea luminosa sobre restauracion, familia elegida y espacios hermosos construidos con calma.',
    ),
    quote: copy(
      'The room did not need saving. It only needed someone willing to light it gently.',
      'La habitacion no necesitaba ser salvada. Solo necesitaba a alguien dispuesto a iluminarla con suavidad.',
    ),
    cover:
      'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=900&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=80',
    genres: ['Contemporary', 'Feel-Good', 'Book Club'],
    mood: copy('Atmospheric and hopeful', 'Atmosferica y esperanzadora'),
    accent: '#9ab3a9',
    shelves: copy('98k shelved', '98k en estantes'),
    friendsReading: 49,
  },
  {
    id: 'book-ninth-season',
    slug: 'the-ninth-season-of-rain',
    title: copy('The Ninth Season of Rain', 'La novena estacion de la lluvia'),
    subtitle: copy(
      'A climate opera of water, power, and exile',
      'Una opera climatica de agua, poder y exilio',
    ),
    authorId: 'author-niko-sol',
    year: 2025,
    pageCount: 501,
    format: copy('Signed Edition', 'Edicion firmada'),
    rating: 4.7,
    ratingCount: copy('15.9k ratings', '15.9k valoraciones'),
    description: copy(
      'In a federation where weather rights are traded like currency, an exiled hydrologist returns to negotiate peace during a season that should not exist. It is epic in scale but startlingly intimate in its emotional precision.',
      'En una federacion donde los derechos sobre el clima se comercian como moneda, una hidrologa exiliada regresa para negociar la paz durante una estacion que no deberia existir. Es epica en escala pero sorprendentemente intima en su precision emocional.',
    ),
    shortDescription: copy(
      'An ambitious climate fiction epic with political stakes and emotional depth.',
      'Una ambiciosa epopeya de ficcion climatica con apuestas politicas y profundidad emocional.',
    ),
    quote: copy(
      'Rain had become a luxury, and luxury had become another word for obedience.',
      'La lluvia se habia convertido en un lujo, y el lujo en otra forma de nombrar la obediencia.',
    ),
    cover:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80',
    genres: ['Science Fiction', 'Climate Fiction', 'Political'],
    mood: copy('Grand and urgent', 'Grande y urgente'),
    accent: '#73a7d0',
    shelves: copy('247k shelved', '247k en estantes'),
    friendsReading: 117,
    featured: true,
    trending: true,
  },
];

export const books: Book[] = seededBooks.map((book) => ({
  ...book,
  ...(realBookOverrides[book.id] ?? {}),
}));
