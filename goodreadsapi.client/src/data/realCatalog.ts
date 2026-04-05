import type { Author, Book } from '@/types';

const copy = (en: string, es: string) => ({ en, es });
const cover = (olid: string) => `https://covers.openlibrary.org/b/olid/${olid}-L.jpg`;

type AuthorOverride = Pick<Author, 'name' | 'location' | 'shortBio' | 'notableWork'>;
type BookOverride = Pick<
  Book,
  | 'slug'
  | 'title'
  | 'subtitle'
  | 'authorId'
  | 'year'
  | 'cover'
  | 'description'
  | 'shortDescription'
  | 'quote'
  | 'genres'
  | 'mood'
>;

export const realAuthorOverrides: Record<string, AuthorOverride> = {
  'author-elia-marrow': {
    name: 'Kazuo Ishiguro',
    location: 'Nagasaki, Japan / United Kingdom',
    shortBio: copy(
      'British novelist and Nobel laureate known for reflective fiction about memory, identity, technology, and emotional restraint.',
      'Novelista britanico y Nobel de Literatura, conocido por ficcion reflexiva sobre memoria, identidad, tecnologia y contencion emocional.',
    ),
    notableWork: copy('Never Let Me Go', 'Nunca me abandones'),
  },
  'author-soren-vale': {
    name: 'Susanna Clarke',
    location: 'Nottingham, England',
    shortBio: copy(
      'English author of immersive, puzzle-like fantasy that blends myth, scholarship, and uncanny spaces.',
      'Autora inglesa de fantasia inmersiva y enigmatica que mezcla mito, erudicion y espacios inquietantes.',
    ),
    notableWork: copy('Piranesi', 'Piranesi'),
  },
  'author-linh-duvall': {
    name: 'Toni Morrison',
    location: 'Ohio, United States',
    shortBio: copy(
      'Pulitzer and Nobel Prize-winning American novelist whose work confronts memory, history, and the afterlives of slavery.',
      'Novelista estadounidense ganadora del Pulitzer y el Nobel, cuya obra confronta memoria, historia y las huellas de la esclavitud.',
    ),
    notableWork: copy('Beloved', 'Beloved'),
  },
  'author-iris-navarro': {
    name: 'Erin Morgenstern',
    location: 'Massachusetts, United States',
    shortBio: copy(
      'American novelist celebrated for ornate, dreamlike fiction built around secret worlds, stories, and theatrical atmosphere.',
      'Novelista estadounidense celebrada por ficcion onirica y ornamental construida alrededor de mundos secretos, historias y atmosfera teatral.',
    ),
    notableWork: copy('The Night Circus', 'El circo de la noche'),
  },
  'author-niko-sol': {
    name: 'Emily St. John Mandel',
    location: 'British Columbia, Canada',
    shortBio: copy(
      'Canadian novelist whose books move between literary fiction and speculative frameworks with elegant, interconnected structures.',
      'Novelista canadiense cuyos libros se mueven entre la ficcion literaria y lo especulativo con estructuras elegantes e interconectadas.',
    ),
    notableWork: copy('Station Eleven', 'Estacion Once'),
  },
  'author-marianne-caul': {
    name: 'Ursula K. Le Guin',
    location: 'California, United States',
    shortBio: copy(
      'One of the defining voices of modern speculative fiction, known for anthropological worldbuilding and philosophical depth.',
      'Una de las voces decisivas de la ficcion especulativa moderna, conocida por su worldbuilding antropologico y profundidad filosofica.',
    ),
    notableWork: copy('The Left Hand of Darkness', 'La mano izquierda de la oscuridad'),
  },
  'author-casper-holloway': {
    name: 'Donna Tartt',
    location: 'Mississippi, United States',
    shortBio: copy(
      'American novelist associated with dark academia, psychological tension, and lush, obsessive prose.',
      'Novelista estadounidense asociada al dark academia, la tension psicologica y una prosa exuberante y obsesiva.',
    ),
    notableWork: copy('The Secret History', 'La historia secreta'),
  },
  'author-celeste-yoon': {
    name: 'Octavia E. Butler',
    location: 'California, United States',
    shortBio: copy(
      'Groundbreaking American writer whose speculative fiction explores power, survival, hierarchy, and social collapse.',
      'Escritora estadounidense fundamental cuya ficcion especulativa explora poder, supervivencia, jerarquia y colapso social.',
    ),
    notableWork: copy('Parable of the Sower', 'La parabola del sembrador'),
  },
};

export const realBookOverrides: Record<string, BookOverride> = {
  'book-glass-archive': {
    slug: 'never-let-me-go',
    title: copy('Never Let Me Go', 'Nunca me abandones'),
    subtitle: copy(
      'A quiet, devastating novel about friendship, memory, and manufactured lives',
      'Una novela silenciosa y devastadora sobre amistad, memoria y vidas fabricadas',
    ),
    authorId: 'author-elia-marrow',
    year: 2005,
    cover: cover('OL46062298M'),
    description: copy(
      'Kazuo Ishiguro follows a group of students as they slowly understand the system that shaped their lives, turning a restrained coming-of-age story into one of contemporary fiction’s most unsettling moral dramas.',
      'Kazuo Ishiguro sigue a un grupo de estudiantes que poco a poco entiende el sistema que dio forma a sus vidas, convirtiendo un coming-of-age contenido en uno de los dramas morales mas inquietantes de la ficcion contemporanea.',
    ),
    shortDescription: copy(
      'Literary speculative fiction about friendship, loss, and the value assigned to a human life.',
      'Ficcion literaria especulativa sobre amistad, perdida y el valor que se le asigna a una vida humana.',
    ),
    quote: copy(
      'Tender on the surface, devastating underneath.',
      'Tierna en la superficie, devastadora por debajo.',
    ),
    genres: ['Literary Fiction', 'Speculative', 'Book Club'],
    mood: copy('Quiet and aching', 'Silenciosa y dolorosa'),
  },
  'book-midnight-cartography': {
    slug: 'piranesi',
    title: copy('Piranesi', 'Piranesi'),
    subtitle: copy(
      'A labyrinth, an ocean, and a mind learning what world it inhabits',
      'Un laberinto, un oceano y una mente que aprende en que mundo habita',
    ),
    authorId: 'author-soren-vale',
    year: 2020,
    cover: cover('OL31833301M'),
    description: copy(
      'Set inside an endless House of statues, tides, and halls, Susanna Clarke’s novel begins as a mystery of place and becomes a strange, elegant meditation on memory, identity, and trust.',
      'Ambientada dentro de una Casa infinita de estatuas, mareas y salones, la novela de Susanna Clarke empieza como un misterio espacial y se convierte en una meditacion extrana y elegante sobre memoria, identidad y confianza.',
    ),
    shortDescription: copy(
      'A dreamlike literary fantasy built around space, solitude, and revelation.',
      'Una fantasia literaria y onirica construida alrededor del espacio, la soledad y la revelacion.',
    ),
    quote: copy('A puzzle-box novel with cathedral-scale atmosphere.', 'Una novela enigma con atmosfera de catedral.'),
    genres: ['Fantasy', 'Mystery', 'Literary Fiction'],
    mood: copy('Hypnotic and otherworldly', 'Hipnotica y de otro mundo'),
  },
  'book-theory-of-lanterns': {
    slug: 'beloved',
    title: copy('Beloved', 'Beloved'),
    subtitle: copy(
      'A haunted masterpiece about memory, motherhood, and survival after slavery',
      'Una obra maestra espectral sobre memoria, maternidad y supervivencia despues de la esclavitud',
    ),
    authorId: 'author-linh-duvall',
    year: 1987,
    cover: cover('OL22920001M'),
    description: copy(
      'Toni Morrison transforms the ghost story into a profound reckoning with trauma and love, centering a formerly enslaved woman whose past refuses to stay buried.',
      'Toni Morrison transforma la historia de fantasmas en un ajuste de cuentas profundo con el trauma y el amor, centrando a una mujer antes esclavizada cuyo pasado se niega a permanecer enterrado.',
    ),
    shortDescription: copy(
      'A landmark American novel where haunting and history become inseparable.',
      'Una novela fundamental de Estados Unidos donde lo espectral y la historia se vuelven inseparables.',
    ),
    quote: copy('History returns here with a pulse and a voice.', 'La historia vuelve aqui con pulso y voz.'),
    genres: ['Historical Fiction', 'Literary Fiction', 'Classic'],
    mood: copy('Haunting and monumental', 'Espectral y monumental'),
  },
  'book-salt-between-chapters': {
    slug: 'the-night-circus',
    title: copy('The Night Circus', 'El circo de la noche'),
    subtitle: copy(
      'A competition in magic staged inside a black-and-white circus',
      'Una competencia magica puesta en escena dentro de un circo en blanco y negro',
    ),
    authorId: 'author-iris-navarro',
    year: 2011,
    cover: cover('OL40385372M'),
    description: copy(
      'Erin Morgenstern builds an ornate fantasy around rival magicians, impossible tents, and a romance bound to spectacle, craft, and destiny.',
      'Erin Morgenstern construye una fantasia ornamental alrededor de magos rivales, carpas imposibles y un romance atado al espectaculo, el oficio y el destino.',
    ),
    shortDescription: copy(
      'An atmospheric fantasy of illusion, longing, and theatrical wonder.',
      'Una fantasia atmosferica de ilusion, anhelo y asombro teatral.',
    ),
    quote: copy('Pure enchantment, staged after dark.', 'Encantamiento puro, montado despues del anochecer.'),
    genres: ['Fantasy', 'Romance', 'Book Club'],
    mood: copy('Velvet and immersive', 'Aterciopelada e inmersiva'),
  },
  'book-velvet-astronomy': {
    slug: 'sea-of-tranquility',
    title: copy('Sea of Tranquility', 'Mar de la tranquilidad'),
    subtitle: copy(
      'A time-crossed literary puzzle about art, pandemics, and echoes in history',
      'Un rompecabezas literario a traves del tiempo sobre arte, pandemias y ecos en la historia',
    ),
    authorId: 'author-niko-sol',
    year: 2022,
    cover: cover('OL32997936M'),
    description: copy(
      'Emily St. John Mandel threads together moon colonies, violin notes, and fractured timelines into a compact novel about recurrence, consciousness, and the instability of reality.',
      'Emily St. John Mandel enlaza colonias lunares, notas de violin y lineas temporales fracturadas en una novela breve sobre recurrencia, conciencia e inestabilidad de la realidad.',
    ),
    shortDescription: copy(
      'A literary science fiction novel about time, pattern, and human continuity.',
      'Una novela de ciencia ficcion literaria sobre tiempo, patron y continuidad humana.',
    ),
    quote: copy('A small novel with very large echoes.', 'Una novela pequena con ecos enormes.'),
    genres: ['Science Fiction', 'Literary Fiction', 'Speculative'],
    mood: copy('Elegant and uncanny', 'Elegante e inquietante'),
  },
  'book-ink-and-winter': {
    slug: 'the-left-hand-of-darkness',
    title: copy('The Left Hand of Darkness', 'La mano izquierda de la oscuridad'),
    subtitle: copy(
      'A landmark novel of gender, politics, and survival on an icy world',
      'Una novela decisiva sobre genero, politica y supervivencia en un mundo helado',
    ),
    authorId: 'author-marianne-caul',
    year: 1969,
    cover: cover('OL58688990M'),
    description: copy(
      'Ursula K. Le Guin sends an envoy to the planet Gethen and uses first contact to ask radical questions about culture, loyalty, embodiment, and what societies take for granted.',
      'Ursula K. Le Guin envia a un emisario al planeta Gueden y usa el primer contacto para plantear preguntas radicales sobre cultura, lealtad, corporalidad y aquello que las sociedades dan por sentado.',
    ),
    shortDescription: copy(
      'A foundational science fiction novel that remains philosophically bold and emotionally resonant.',
      'Una novela fundacional de ciencia ficcion que sigue siendo filosoficamente audaz y emocionalmente resonante.',
    ),
    quote: copy('Cold, political, intimate, and still ahead of its time.', 'Fria, politica, intima y aun adelantada a su tiempo.'),
    genres: ['Science Fiction', 'Classic', 'Political'],
    mood: copy('Severe and profound', 'Severa y profunda'),
  },
  'book-quiet-index': {
    slug: 'the-secret-history',
    title: copy('The Secret History', 'La historia secreta'),
    subtitle: copy(
      'An elite college circle descends from aesthetics into violence',
      'Un circulo universitario de elite desciende de la estetica a la violencia',
    ),
    authorId: 'author-casper-holloway',
    year: 1992,
    cover: cover('OL32786104M'),
    description: copy(
      'Donna Tartt frames the novel as a murder story told backwards, then uses obsession, class performance, and intellectual vanity to create one of the defining dark academia texts.',
      'Donna Tartt plantea la novela como una historia de asesinato contada hacia atras y luego usa obsesion, performance de clase y vanidad intelectual para crear uno de los textos clave del dark academia.',
    ),
    shortDescription: copy(
      'A literary thriller about privilege, beauty, corruption, and self-invention.',
      'Un thriller literario sobre privilegio, belleza, corrupcion e invencion de uno mismo.',
    ),
    quote: copy('Seductive, cerebral, and morally rotten in the best way.', 'Seductora, cerebral y moralmente podrida de la mejor manera.'),
    genres: ['Mystery', 'Contemporary', 'Literary Fiction'],
    mood: copy('Obsessive and decadent', 'Obsesiva y decadente'),
  },
  'book-orchard-of-hours': {
    slug: 'station-eleven',
    title: copy('Station Eleven', 'Estacion Once'),
    subtitle: copy(
      'A post-pandemic novel about art, memory, and what survives collapse',
      'Una novela pospandemica sobre arte, memoria y lo que sobrevive al colapso',
    ),
    authorId: 'author-niko-sol',
    year: 2014,
    cover: cover('OL35591860M'),
    description: copy(
      'Emily St. John Mandel links pre-collapse celebrity, a traveling Shakespeare troupe, and scattered objects from the old world to ask what culture is for when systems fail.',
      'Emily St. John Mandel enlaza celebridad previa al colapso, una compania itinerante de Shakespeare y objetos dispersos del viejo mundo para preguntar para que sirve la cultura cuando fallan los sistemas.',
    ),
    shortDescription: copy(
      'A luminous literary apocalypse novel centered on performance and connection.',
      'Una novela luminosa de apocalipsis literario centrada en la interpretacion y el vinculo humano.',
    ),
    quote: copy('Art becomes infrastructure in the ruins.', 'El arte se vuelve infraestructura entre las ruinas.'),
    genres: ['Science Fiction', 'Literary Fiction', 'Book Club'],
    mood: copy('Lyrical and elegiac', 'Lirica y elegiaca'),
  },
  'book-atlas-of-soft-fires': {
    slug: 'klara-and-the-sun',
    title: copy('Klara and the Sun', 'Klara y el Sol'),
    subtitle: copy(
      'An artificial friend observes love, illness, and belief from the margins',
      'Una amiga artificial observa amor, enfermedad y creencia desde los margenes',
    ),
    authorId: 'author-elia-marrow',
    year: 2021,
    cover: cover('OL33802423M'),
    description: copy(
      'Told from the perspective of an Artificial Friend, the novel studies care, class, and hope with Ishiguro’s characteristic restraint and emotional precision.',
      'Contada desde la perspectiva de una Amiga Artificial, la novela estudia cuidado, clase y esperanza con la contencion y precision emocional caracteristicas de Ishiguro.',
    ),
    shortDescription: copy(
      'Quiet speculative fiction about consciousness, devotion, and fragile faith.',
      'Ficcion especulativa contenida sobre conciencia, devocion y una fe fragil.',
    ),
    quote: copy('Observed with innocence, sharpened by grief.', 'Observada con inocencia, afilada por el duelo.'),
    genres: ['Science Fiction', 'Literary Fiction', 'Contemporary'],
    mood: copy('Gentle and unsettling', 'Suave e inquietante'),
  },
  'book-paper-moons': {
    slug: 'the-starless-sea',
    title: copy('The Starless Sea', 'El mar sin estrellas'),
    subtitle: copy(
      'A secret subterranean library of stories, symbols, and doors',
      'Una biblioteca subterranea secreta de historias, simbolos y puertas',
    ),
    authorId: 'author-iris-navarro',
    year: 2019,
    cover: cover('OL28913648M'),
    description: copy(
      'Erin Morgenstern turns books, keys, bees, and hidden harbors into a nested fantasy about reading, myth, and the irresistible pull of another world.',
      'Erin Morgenstern convierte libros, llaves, abejas y puertos ocultos en una fantasia anidada sobre lectura, mito y la fuerza irresistible de otro mundo.',
    ),
    shortDescription: copy(
      'A story-drunk fantasy for readers who love secret archives and mythic symbolism.',
      'Una fantasia intoxicada por las historias para lectores que aman archivos secretos y simbolismo mitico.',
    ),
    quote: copy('Less plot machine, more literary dream chamber.', 'Menos maquina de trama, mas camara onirica literaria.'),
    genres: ['Fantasy', 'Literary Fiction', 'Adventure'],
    mood: copy('Mythic and ornate', 'Mitica y ornamentada'),
  },
  'book-rooms-for-starlight': {
    slug: 'the-lathe-of-heaven',
    title: copy('The Lathe of Heaven', 'El torno celeste'),
    subtitle: copy(
      'Dreams rewrite reality in this compact philosophical classic',
      'Los suenos reescriben la realidad en este clasico filosofico y compacto',
    ),
    authorId: 'author-marianne-caul',
    year: 1971,
    cover: cover('OL34699681M'),
    description: copy(
      'In one of Le Guin’s most conceptually nimble novels, a man whose dreams alter the world becomes the subject of manipulation, satire, and metaphysical dread.',
      'En una de las novelas conceptualmente mas agiles de Le Guin, un hombre cuyos suenos alteran el mundo se vuelve objeto de manipulacion, satira y desasosiego metafisico.',
    ),
    shortDescription: copy(
      'A philosophical science fiction classic about power, reality, and unintended consequences.',
      'Un clasico filosofico de ciencia ficcion sobre poder, realidad y consecuencias no previstas.',
    ),
    quote: copy('Ideas hit hard here, but the human cost lands harder.', 'Las ideas golpean fuerte aqui, pero el costo humano golpea mas.'),
    genres: ['Science Fiction', 'Classic', 'Speculative'],
    mood: copy('Conceptual and eerie', 'Conceptual y extrana'),
  },
  'book-ninth-season': {
    slug: 'parable-of-the-sower',
    title: copy('Parable of the Sower', 'La parabola del sembrador'),
    subtitle: copy(
      'A visionary survival novel about collapse, belief, and adaptation',
      'Una novela visionaria de supervivencia sobre colapso, creencia y adaptacion',
    ),
    authorId: 'author-celeste-yoon',
    year: 1993,
    cover: cover('OL48237668M'),
    description: copy(
      'Octavia E. Butler imagines a near-future California marked by scarcity and violence, then builds a fiercely intelligent coming-of-age story around leadership, vulnerability, and communal survival.',
      'Octavia E. Butler imagina una California cercana marcada por escasez y violencia, y luego construye una historia de madurez ferozmente inteligente alrededor de liderazgo, vulnerabilidad y supervivencia comunitaria.',
    ),
    shortDescription: copy(
      'A prophetic dystopian novel about social fracture, resilience, and new belief systems.',
      'Una novela distopica profetica sobre fractura social, resiliencia y nuevos sistemas de creencias.',
    ),
    quote: copy('Still feels urgent because it understands pressure, not just apocalypse.', 'Sigue sintiendose urgente porque entiende la presion, no solo el apocalipsis.'),
    genres: ['Science Fiction', 'Climate Fiction', 'Political'],
    mood: copy('Urgent and unsparing', 'Urgente e implacable'),
  },
};
