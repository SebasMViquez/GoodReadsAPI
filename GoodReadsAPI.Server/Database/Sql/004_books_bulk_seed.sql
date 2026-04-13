-- GoodReadsAPI Supabase bootstrap (Phase 3: books bulk seed)
-- Usage:
-- 1) Run in Supabase SQL Editor.
-- 2) The script upserts by book id.

with books_payload as (
  select
  $$
  [
    {
      "id": "book-glass-archive",
      "slug": "the-glass-archive",
      "title": { "en": "The Glass Archive", "es": "El archivo de cristal" },
      "subtitle": { "en": "A novel about memory and illuminated cities", "es": "Una novela sobre memoria y ciudades iluminadas" },
      "authorId": "author-elia-marrow",
      "year": 2025,
      "pageCount": 412,
      "format": { "en": "Hardcover", "es": "Tapa dura" },
      "rating": 4.8,
      "ratingCount": { "en": "18.2k ratings", "es": "18.2k valoraciones" },
      "description": {
        "en": "In a city where discarded memories are transformed into translucent buildings, an archivist discovers that one forgotten room contains the key to her own vanished childhood.",
        "es": "En una ciudad donde los recuerdos descartados se transforman en edificios translucidos, una archivista descubre que una habitacion olvidada contiene la clave de su propia infancia desaparecida."
      },
      "shortDescription": {
        "en": "A luminous literary sci-fi novel about memory, grief, and reinvention.",
        "es": "Una novela luminosa de ciencia ficcion literaria sobre memoria, duelo y reinvencion."
      },
      "quote": {
        "en": "Every room remembers the people who once believed it could save them.",
        "es": "Cada habitacion recuerda a las personas que alguna vez creyeron que podia salvarlas."
      },
      "cover": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Literary Fiction", "Speculative", "Book Club"],
      "mood": { "en": "Luminous and reflective", "es": "Luminosa y reflexiva" },
      "accent": "#d0a46c",
      "shelves": { "en": "341k shelved", "es": "341k en estantes" },
      "friendsReading": 128,
      "featured": true,
      "trending": true,
      "editorPick": true
    },
    {
      "id": "book-midnight-botanist",
      "slug": "the-midnight-botanist",
      "title": { "en": "The Midnight Botanist", "es": "La botanica de medianoche" },
      "subtitle": { "en": "Secrets bloom after dark", "es": "Los secretos florecen despues del anochecer" },
      "authorId": "author-nora-vale",
      "year": 2024,
      "pageCount": 368,
      "format": { "en": "Paperback", "es": "Tapa blanda" },
      "rating": 4.6,
      "ratingCount": { "en": "9.7k ratings", "es": "9.7k valoraciones" },
      "description": {
        "en": "A reclusive botanist cultivates a hidden rooftop garden of impossible flowers, only to learn that each bloom reveals a secret someone in the city would rather keep buried.",
        "es": "Una botanica reclusa cultiva un jardin oculto en la azotea con flores imposibles, solo para descubrir que cada flor revela un secreto que alguien en la ciudad preferiria mantener enterrado."
      },
      "shortDescription": {
        "en": "A tender mystery wrapped in petals, silence, and moonlight.",
        "es": "Un misterio delicado envuelto en petalos, silencio y luz de luna."
      },
      "quote": {
        "en": "Some gardens are planted for beauty. Others for forgiveness.",
        "es": "Algunos jardines se siembran por belleza. Otros por perdon."
      },
      "cover": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Mystery", "Contemporary Fiction", "Magical Realism"],
      "mood": { "en": "Gentle and mysterious", "es": "Suave y misteriosa" },
      "accent": "#5e8b7e",
      "shelves": { "en": "204k shelved", "es": "204k en estantes" },
      "friendsReading": 76,
      "featured": true,
      "trending": false,
      "editorPick": true
    },
    {
      "id": "book-ember-harbor",
      "slug": "ember-harbor",
      "title": { "en": "Ember Harbor", "es": "Puerto de brasas" },
      "subtitle": { "en": "Where the sea keeps old promises", "es": "Donde el mar guarda viejas promesas" },
      "authorId": "author-mateo-rhine",
      "year": 2023,
      "pageCount": 441,
      "format": { "en": "Hardcover", "es": "Tapa dura" },
      "rating": 4.7,
      "ratingCount": { "en": "27.4k ratings", "es": "27.4k valoraciones" },
      "description": {
        "en": "When a disgraced cartographer returns to his storm-battered hometown, he uncovers a map etched into the harbor floor and a family betrayal that shaped the coast for generations.",
        "es": "Cuando un cartografo caido en desgracia regresa a su pueblo costero azotado por tormentas, descubre un mapa grabado en el fondo del puerto y una traicion familiar que dio forma a la costa durante generaciones."
      },
      "shortDescription": {
        "en": "An atmospheric coastal drama with secrets, tides, and reconciliation.",
        "es": "Un drama costero atmosferico con secretos, mareas y reconciliacion."
      },
      "quote": {
        "en": "The sea never forgets the names we whisper into it.",
        "es": "El mar nunca olvida los nombres que le susurramos."
      },
      "cover": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Historical Fiction", "Drama", "Book Club"],
      "mood": { "en": "Atmospheric and emotional", "es": "Atmosferica y emotiva" },
      "accent": "#c46a3a",
      "shelves": { "en": "418k shelved", "es": "418k en estantes" },
      "friendsReading": 143,
      "featured": true,
      "trending": true,
      "editorPick": false
    },
    {
      "id": "book-silent-orbit",
      "slug": "silent-orbit",
      "title": { "en": "Silent Orbit", "es": "Orbita silenciosa" },
      "subtitle": { "en": "No signal lasts forever", "es": "Ninguna senal dura para siempre" },
      "authorId": "author-irene-kestrel",
      "year": 2026,
      "pageCount": 390,
      "format": { "en": "eBook", "es": "Libro digital" },
      "rating": 4.5,
      "ratingCount": { "en": "6.1k ratings", "es": "6.1k valoraciones" },
      "description": {
        "en": "A lone engineer aboard a failing communications station begins receiving messages from a planet humanity has never officially visited.",
        "es": "Una ingeniera solitaria a bordo de una estacion de comunicaciones en ruinas comienza a recibir mensajes de un planeta que la humanidad nunca ha visitado oficialmente."
      },
      "shortDescription": {
        "en": "A tense and intimate sci-fi story about loneliness and truth.",
        "es": "Una historia de ciencia ficcion tensa e intima sobre soledad y verdad."
      },
      "quote": {
        "en": "Silence is only empty until something answers back.",
        "es": "El silencio solo esta vacio hasta que algo responde."
      },
      "cover": "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Science Fiction", "Space", "Thriller"],
      "mood": { "en": "Tense and introspective", "es": "Tensa e introspectiva" },
      "accent": "#6474c2",
      "shelves": { "en": "97k shelved", "es": "97k en estantes" },
      "friendsReading": 59,
      "featured": false,
      "trending": true,
      "editorPick": true
    },
    {
      "id": "book-rainkeepers-daughter",
      "slug": "the-rainkeepers-daughter",
      "title": { "en": "The Rainkeeper's Daughter", "es": "La hija del guardian de la lluvia" },
      "subtitle": { "en": "A family legend written in storms", "es": "Una leyenda familiar escrita en tormentas" },
      "authorId": "author-lina-corbet",
      "year": 2022,
      "pageCount": 336,
      "format": { "en": "Paperback", "es": "Tapa blanda" },
      "rating": 4.4,
      "ratingCount": { "en": "14.9k ratings", "es": "14.9k valoraciones" },
      "description": {
        "en": "In a drought-stricken valley, a young woman inherits her grandmother's journal and the unsettling belief that their family once bargained with the weather itself.",
        "es": "En un valle golpeado por la sequia, una joven hereda el diario de su abuela y la inquietante creencia de que su familia alguna vez negocio con el clima mismo."
      },
      "shortDescription": {
        "en": "A sweeping generational tale with myth, memory, and resilience.",
        "es": "Un relato generacional amplio con mito, memoria y resiliencia."
      },
      "quote": {
        "en": "We prayed for rain, but what arrived was inheritance.",
        "es": "Rezamos por lluvia, pero lo que llego fue herencia."
      },
      "cover": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Magical Realism", "Family Saga", "Drama"],
      "mood": { "en": "Melancholic and hopeful", "es": "Melancolica y esperanzadora" },
      "accent": "#7a9e7e",
      "shelves": { "en": "188k shelved", "es": "188k en estantes" },
      "friendsReading": 88,
      "featured": false,
      "trending": false,
      "editorPick": true
    },
    {
      "id": "book-ashes-of-june",
      "slug": "ashes-of-june",
      "title": { "en": "Ashes of June", "es": "Las cenizas de junio" },
      "subtitle": { "en": "Summer remembers everything", "es": "El verano lo recuerda todo" },
      "authorId": "author-clara-west",
      "year": 2021,
      "pageCount": 352,
      "format": { "en": "Paperback", "es": "Tapa blanda" },
      "rating": 4.3,
      "ratingCount": { "en": "11.3k ratings", "es": "11.3k valoraciones" },
      "description": {
        "en": "Returning home after a decade away, June finds her family house half-burned, half-preserved, and full of letters that reveal what really happened the summer she left.",
        "es": "Al volver a casa despues de una decada lejos, June encuentra la casa familiar medio quemada, medio intacta, y llena de cartas que revelan lo que realmente ocurrio el verano en que se fue."
      },
      "shortDescription": {
        "en": "A reflective family drama about loss, memory, and return.",
        "es": "Un drama familiar reflexivo sobre perdida, memoria y regreso."
      },
      "quote": {
        "en": "Some fires end a story. Others force it to be told.",
        "es": "Algunos incendios terminan una historia. Otros la obligan a ser contada."
      },
      "cover": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Contemporary Fiction", "Family Drama", "Book Club"],
      "mood": { "en": "Reflective and bittersweet", "es": "Reflexiva y agridulce" },
      "accent": "#b86b52",
      "shelves": { "en": "156k shelved", "es": "156k en estantes" },
      "friendsReading": 67,
      "featured": false,
      "trending": false,
      "editorPick": true
    },
    {
      "id": "book-cartographers-tide",
      "slug": "the-cartographers-tide",
      "title": { "en": "The Cartographer's Tide", "es": "La marea del cartografo" },
      "subtitle": { "en": "Maps fail where the ocean begins", "es": "Los mapas fallan donde comienza el oceano" },
      "authorId": "author-soren-hale",
      "year": 2024,
      "pageCount": 428,
      "format": { "en": "Hardcover", "es": "Tapa dura" },
      "rating": 4.7,
      "ratingCount": { "en": "22.8k ratings", "es": "22.8k valoraciones" },
      "description": {
        "en": "A royal navigator is sent to chart a forbidden sea, only to discover islands that appear on no map and a history the empire erased long ago.",
        "es": "Un navegante real es enviado a cartografiar un mar prohibido, solo para descubrir islas que no aparecen en ningun mapa y una historia que el imperio borro hace mucho tiempo."
      },
      "shortDescription": {
        "en": "An epic maritime fantasy of maps, myth, and rebellion.",
        "es": "Una fantasia maritima epica de mapas, mito y rebelion."
      },
      "quote": {
        "en": "A blank map is never empty. It is only waiting to resist you.",
        "es": "Un mapa en blanco nunca esta vacio. Solo esta esperando resistirse."
      },
      "cover": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Fantasy", "Adventure", "Epic"],
      "mood": { "en": "Adventurous and sweeping", "es": "Aventurera y expansiva" },
      "accent": "#3f6e8a",
      "shelves": { "en": "289k shelved", "es": "289k en estantes" },
      "friendsReading": 115,
      "featured": true,
      "trending": true,
      "editorPick": true
    },
    {
      "id": "book-winter-after-mars",
      "slug": "winter-after-mars",
      "title": { "en": "Winter After Mars", "es": "Invierno despues de Marte" },
      "subtitle": { "en": "Home is stranger on the way back", "es": "El hogar es mas extrano en el regreso" },
      "authorId": "author-naomi-quill",
      "year": 2026,
      "pageCount": 376,
      "format": { "en": "eBook", "es": "Libro digital" },
      "rating": 4.5,
      "ratingCount": { "en": "7.4k ratings", "es": "7.4k valoraciones" },
      "description": {
        "en": "After twenty years in an off-world colony, a pilot returns to Earth and finds a colder planet, a fractured family, and a son who knows her only through delayed transmissions.",
        "es": "Despues de veinte anos en una colonia fuera del planeta, una piloto regresa a la Tierra y encuentra un mundo mas frio, una familia fracturada y un hijo que solo la conoce a traves de transmisiones retrasadas."
      },
      "shortDescription": {
        "en": "A human sci-fi novel about distance, climate, and reunion.",
        "es": "Una novela de ciencia ficcion humana sobre distancia, clima y reencuentro."
      },
      "quote": {
        "en": "You can cross planets faster than you can repair a family.",
        "es": "Puedes cruzar planetas mas rapido de lo que puedes reparar una familia."
      },
      "cover": "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Science Fiction", "Drama", "Literary Fiction"],
      "mood": { "en": "Melancholic and intimate", "es": "Melancolica e intima" },
      "accent": "#7f88b5",
      "shelves": { "en": "121k shelved", "es": "121k en estantes" },
      "friendsReading": 71,
      "featured": true,
      "trending": true,
      "editorPick": false
    },
    {
      "id": "book-house-of-paper-stars",
      "slug": "house-of-paper-stars",
      "title": { "en": "House of Paper Stars", "es": "Casa de estrellas de papel" },
      "subtitle": { "en": "Every folded wish has a cost", "es": "Cada deseo doblado tiene un costo" },
      "authorId": "author-mira-fen",
      "year": 2023,
      "pageCount": 318,
      "format": { "en": "Hardcover", "es": "Tapa dura" },
      "rating": 4.6,
      "ratingCount": { "en": "16.5k ratings", "es": "16.5k valoraciones" },
      "description": {
        "en": "A young caretaker of a forgotten shrine learns that the paper stars left by visitors can alter fate, but only by unraveling someone else's future.",
        "es": "Una joven cuidadora de un santuario olvidado descubre que las estrellas de papel dejadas por los visitantes pueden alterar el destino, pero solo deshaciendo el futuro de otra persona."
      },
      "shortDescription": {
        "en": "A magical and emotional story about sacrifice and destiny.",
        "es": "Una historia magica y emotiva sobre sacrificio y destino."
      },
      "quote": {
        "en": "Wishes are only light until someone has to carry them.",
        "es": "Los deseos solo son luz hasta que alguien tiene que cargarlos."
      },
      "cover": "https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Fantasy", "Magical Realism", "Young Adult"],
      "mood": { "en": "Tender and magical", "es": "Tierna y magica" },
      "accent": "#d49ac2",
      "shelves": { "en": "233k shelved", "es": "233k en estantes" },
      "friendsReading": 94,
      "featured": false,
      "trending": true,
      "editorPick": true
    },
    {
      "id": "book-beneath-the-red-tram",
      "slug": "beneath-the-red-tram",
      "title": { "en": "Beneath the Red Tram", "es": "Bajo el tranvia rojo" },
      "subtitle": { "en": "The city moves, even when grief does not", "es": "La ciudad avanza, aunque el duelo no" },
      "authorId": "author-julian-foret",
      "year": 2022,
      "pageCount": 340,
      "format": { "en": "Paperback", "es": "Tapa blanda" },
      "rating": 4.4,
      "ratingCount": { "en": "13.2k ratings", "es": "13.2k valoraciones" },
      "description": {
        "en": "A tram conductor in a rain-drenched capital begins noticing the same silent passenger every night, leading him into an urban mystery tied to the city's vanished neighborhoods.",
        "es": "Un conductor de tranvia en una capital empapada por la lluvia comienza a notar al mismo pasajero silencioso cada noche, lo que lo conduce a un misterio urbano ligado a los barrios desaparecidos de la ciudad."
      },
      "shortDescription": {
        "en": "A moody literary mystery set in a city of rain and remembrance.",
        "es": "Un misterio literario melancolico ambientado en una ciudad de lluvia y recuerdos."
      },
      "quote": {
        "en": "Some cities bury their past in concrete. Ours lets it ride beside us.",
        "es": "Algunas ciudades entierran su pasado en concreto. La nuestra deja que viaje a nuestro lado."
      },
      "cover": "https://images.unsplash.com/photo-1516972810927-80185027ca84?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Literary Fiction", "Mystery", "Urban Drama"],
      "mood": { "en": "Moody and nostalgic", "es": "Melancolica y nostalgica" },
      "accent": "#a94442",
      "shelves": { "en": "167k shelved", "es": "167k en estantes" },
      "friendsReading": 62,
      "featured": false,
      "trending": false,
      "editorPick": true
    }
  ]
  $$::jsonb as payload
),
rows as (
  select jsonb_array_elements(payload) as item
  from books_payload
)
insert into public.books (
  id,
  slug,
  title,
  subtitle,
  author_id,
  year,
  page_count,
  format,
  rating,
  rating_count,
  description,
  short_description,
  quote,
  cover,
  backdrop,
  genres,
  mood,
  accent,
  shelves,
  friends_reading,
  featured,
  trending,
  editor_pick
)
select
  item ->> 'id',
  item ->> 'slug',
  item -> 'title',
  item -> 'subtitle',
  item ->> 'authorId',
  (item ->> 'year')::integer,
  (item ->> 'pageCount')::integer,
  item -> 'format',
  (item ->> 'rating')::numeric,
  item -> 'ratingCount',
  item -> 'description',
  item -> 'shortDescription',
  item -> 'quote',
  item ->> 'cover',
  item ->> 'backdrop',
  coalesce(
    array(select jsonb_array_elements_text(item -> 'genres')),
    '{}'
  )::text[],
  item -> 'mood',
  item ->> 'accent',
  item -> 'shelves',
  coalesce((item ->> 'friendsReading')::integer, 0),
  coalesce((item ->> 'featured')::boolean, false),
  coalesce((item ->> 'trending')::boolean, false),
  coalesce((item ->> 'editorPick')::boolean, false)
from rows
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  subtitle = excluded.subtitle,
  author_id = excluded.author_id,
  year = excluded.year,
  page_count = excluded.page_count,
  format = excluded.format,
  rating = excluded.rating,
  rating_count = excluded.rating_count,
  description = excluded.description,
  short_description = excluded.short_description,
  quote = excluded.quote,
  cover = excluded.cover,
  backdrop = excluded.backdrop,
  genres = excluded.genres,
  mood = excluded.mood,
  accent = excluded.accent,
  shelves = excluded.shelves,
  friends_reading = excluded.friends_reading,
  featured = excluded.featured,
  trending = excluded.trending,
  editor_pick = excluded.editor_pick,
  updated_at = now();

select count(*) as total_books
from public.books;
