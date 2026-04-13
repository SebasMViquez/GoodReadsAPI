-- GoodReadsAPI Supabase bootstrap (Phase 8: extra books bulk seed)
-- Usage:
-- 1) Run in Supabase SQL Editor.
-- 2) Run 007_authors_bulk_seed_extra.sql first.
-- 3) The script upserts by book id.

with books_payload as (
  select
  $$
  [
    {
      "id": "book-lanterns-for-the-absent",
      "slug": "lanterns-for-the-absent",
      "title": { "en": "Lanterns for the Absent", "es": "Faroles para los ausentes" },
      "subtitle": { "en": "A night market remembers what families forget", "es": "Un mercado nocturno recuerda lo que las familias olvidan" },
      "authorId": "author-ines-valeri",
      "year": 2024,
      "pageCount": 364,
      "format": { "en": "Hardcover", "es": "Tapa dura" },
      "rating": 4.6,
      "ratingCount": { "en": "12.9k ratings", "es": "12.9k valoraciones" },
      "description": {
        "en": "After her grandmother disappears during a city blackout, Lucia follows a trail of lantern messages through an old market and uncovers the hidden history that split her family in two.",
        "es": "Despues de que su abuela desaparece durante un apagon en la ciudad, Lucia sigue un rastro de mensajes en faroles por un mercado antiguo y descubre la historia oculta que partio a su familia en dos."
      },
      "shortDescription": {
        "en": "A tender literary mystery about memory, migration, and belonging.",
        "es": "Un misterio literario tierno sobre memoria, migracion y pertenencia."
      },
      "quote": {
        "en": "Light is only useful when someone is still looking for you.",
        "es": "La luz solo sirve cuando alguien todavia te esta buscando."
      },
      "cover": "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Literary Fiction", "Family Drama", "Book Club"],
      "mood": { "en": "Warm and wistful", "es": "Calida y melancolica" },
      "accent": "#c58d5a",
      "shelves": { "en": "149k shelved", "es": "149k en estantes" },
      "friendsReading": 82,
      "featured": true,
      "trending": false,
      "editorPick": true
    },
    {
      "id": "book-the-salt-letter",
      "slug": "the-salt-letter",
      "title": { "en": "The Salt Letter", "es": "La carta de sal" },
      "subtitle": { "en": "Some messages survive the sea", "es": "Algunos mensajes sobreviven al mar" },
      "authorId": "author-ines-valeri",
      "year": 2022,
      "pageCount": 328,
      "format": { "en": "Paperback", "es": "Tapa blanda" },
      "rating": 4.4,
      "ratingCount": { "en": "8.6k ratings", "es": "8.6k valoraciones" },
      "description": {
        "en": "A translator receives a water-damaged letter written by her estranged mother and is pulled into a cross-border search that reshapes everything she believed about home.",
        "es": "Una traductora recibe una carta danada por el agua escrita por su madre distanciada y queda atrapada en una busqueda transfronteriza que transforma todo lo que creia sobre el hogar."
      },
      "shortDescription": {
        "en": "A moving journey about forgiveness, language, and return.",
        "es": "Un viaje conmovedor sobre perdon, lenguaje y regreso."
      },
      "quote": {
        "en": "Salt keeps wounds open long enough for truth to arrive.",
        "es": "La sal mantiene abierta la herida el tiempo justo para que llegue la verdad."
      },
      "cover": "https://images.unsplash.com/photo-1455885666463-9b4cc1586f97?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1505765050516-f72dcac9c60b?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Contemporary Fiction", "Drama", "Book Club"],
      "mood": { "en": "Intimate and hopeful", "es": "Intima y esperanzadora" },
      "accent": "#9d6f58",
      "shelves": { "en": "102k shelved", "es": "102k en estantes" },
      "friendsReading": 54,
      "featured": false,
      "trending": false,
      "editorPick": true
    },
    {
      "id": "book-city-of-quiet-signals",
      "slug": "city-of-quiet-signals",
      "title": { "en": "City of Quiet Signals", "es": "Ciudad de senales quietas" },
      "subtitle": { "en": "The network listens to everyone", "es": "La red escucha a todos" },
      "authorId": "author-caleb-thorne",
      "year": 2026,
      "pageCount": 402,
      "format": { "en": "eBook", "es": "Libro digital" },
      "rating": 4.7,
      "ratingCount": { "en": "15.1k ratings", "es": "15.1k valoraciones" },
      "description": {
        "en": "In a hyper-connected capital, a civic engineer discovers hidden frequency bands that predict public unrest and must decide whether to expose the system or weaponize it.",
        "es": "En una capital hiperconectada, un ingeniero civico descubre bandas de frecuencia ocultas que predicen disturbios sociales y debe decidir si exponer el sistema o convertirlo en arma."
      },
      "shortDescription": {
        "en": "A sharp near-future thriller about power, surveillance, and dissent.",
        "es": "Un thriller de futuro cercano sobre poder, vigilancia y disidencia."
      },
      "quote": {
        "en": "Control is just panic with better software.",
        "es": "El control es solo panico con mejor software."
      },
      "cover": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Science Fiction", "Thriller", "Dystopian"],
      "mood": { "en": "Urgent and cerebral", "es": "Urgente y cerebral" },
      "accent": "#4e6a8f",
      "shelves": { "en": "191k shelved", "es": "191k en estantes" },
      "friendsReading": 109,
      "featured": true,
      "trending": true,
      "editorPick": true
    },
    {
      "id": "book-the-last-frequency",
      "slug": "the-last-frequency",
      "title": { "en": "The Last Frequency", "es": "La ultima frecuencia" },
      "subtitle": { "en": "One broadcast can change a nation", "es": "Una sola transmision puede cambiar una nacion" },
      "authorId": "author-caleb-thorne",
      "year": 2023,
      "pageCount": 347,
      "format": { "en": "Paperback", "es": "Tapa blanda" },
      "rating": 4.5,
      "ratingCount": { "en": "10.4k ratings", "es": "10.4k valoraciones" },
      "description": {
        "en": "A dismissed radio host finds an abandoned transmitter still reaching remote communities and begins airing testimonies that powerful actors have spent years suppressing.",
        "es": "Un locutor despedido encuentra un transmisor abandonado que aun llega a comunidades remotas y comienza a emitir testimonios que actores poderosos han ocultado durante anos."
      },
      "shortDescription": {
        "en": "A political suspense novel about truth, risk, and collective courage.",
        "es": "Una novela de suspenso politico sobre verdad, riesgo y coraje colectivo."
      },
      "quote": {
        "en": "Silence is never neutral. Someone is always paying for it.",
        "es": "El silencio nunca es neutral. Alguien siempre lo esta pagando."
      },
      "cover": "https://images.unsplash.com/photo-14729056-5e29a92e9d7d?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Thriller", "Drama", "Contemporary Fiction"],
      "mood": { "en": "Defiant and tense", "es": "Desafiante y tensa" },
      "accent": "#7b5b4f",
      "shelves": { "en": "133k shelved", "es": "133k en estantes" },
      "friendsReading": 73,
      "featured": false,
      "trending": true,
      "editorPick": false
    },
    {
      "id": "book-stone-orchard",
      "slug": "stone-orchard",
      "title": { "en": "Stone Orchard", "es": "Huerto de piedra" },
      "subtitle": { "en": "The land keeps what families hide", "es": "La tierra guarda lo que las familias esconden" },
      "authorId": "author-violeta-rios",
      "year": 2021,
      "pageCount": 358,
      "format": { "en": "Paperback", "es": "Tapa blanda" },
      "rating": 4.5,
      "ratingCount": { "en": "17.8k ratings", "es": "17.8k valoraciones" },
      "description": {
        "en": "When drought cracks the family orchard, three sisters uncover a buried ledger that reveals decades of exchanged names, debts, and promises tied to the land.",
        "es": "Cuando la sequia agrieta el huerto familiar, tres hermanas descubren un registro enterrado que revela decadas de nombres, deudas y promesas ligadas a la tierra."
      },
      "shortDescription": {
        "en": "A lyrical family saga about land, labor, and reconciliation.",
        "es": "Una saga familiar lirica sobre tierra, trabajo y reconciliacion."
      },
      "quote": {
        "en": "Roots are just memories that learned how to hold on.",
        "es": "Las raices son recuerdos que aprendieron a sostenerse."
      },
      "cover": "https://images.unsplash.com/photo-1463320898484-cdee8141c787?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Literary Fiction", "Family Saga", "Drama"],
      "mood": { "en": "Earthy and emotional", "es": "Terrenal y emotiva" },
      "accent": "#8d7a54",
      "shelves": { "en": "211k shelved", "es": "211k en estantes" },
      "friendsReading": 97,
      "featured": true,
      "trending": false,
      "editorPick": true
    },
    {
      "id": "book-when-the-river-sleeps",
      "slug": "when-the-river-sleeps",
      "title": { "en": "When the River Sleeps", "es": "Cuando el rio duerme" },
      "subtitle": { "en": "Midnight carries old voices", "es": "La medianoche trae voces antiguas" },
      "authorId": "author-violeta-rios",
      "year": 2025,
      "pageCount": 312,
      "format": { "en": "Hardcover", "es": "Tapa dura" },
      "rating": 4.3,
      "ratingCount": { "en": "6.9k ratings", "es": "6.9k valoraciones" },
      "description": {
        "en": "A young teacher returns to her flooded hometown to document oral histories, but each interview points to a vanished child no one officially remembers.",
        "es": "Una maestra joven regresa a su pueblo inundado para documentar historias orales, pero cada entrevista apunta a una nina desaparecida que nadie recuerda oficialmente."
      },
      "shortDescription": {
        "en": "A haunting rural mystery about memory and collective silence.",
        "es": "Un misterio rural inquietante sobre memoria y silencio colectivo."
      },
      "quote": {
        "en": "Water forgets quickly. People pretend to.",
        "es": "El agua olvida rapido. La gente finge hacerlo."
      },
      "cover": "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Mystery", "Literary Fiction", "Contemporary Fiction"],
      "mood": { "en": "Quiet and haunting", "es": "Callada e inquietante" },
      "accent": "#5d7c74",
      "shelves": { "en": "88k shelved", "es": "88k en estantes" },
      "friendsReading": 46,
      "featured": false,
      "trending": false,
      "editorPick": true
    },
    {
      "id": "book-the-ninth-harbor",
      "slug": "the-ninth-harbor",
      "title": { "en": "The Ninth Harbor", "es": "El noveno puerto" },
      "subtitle": { "en": "Every empire has a hidden shore", "es": "Todo imperio tiene una costa oculta" },
      "authorId": "author-darian-kade",
      "year": 2024,
      "pageCount": 436,
      "format": { "en": "Hardcover", "es": "Tapa dura" },
      "rating": 4.8,
      "ratingCount": { "en": "24.2k ratings", "es": "24.2k valoraciones" },
      "description": {
        "en": "Commissioned to map a disputed ocean route, a naval strategist discovers an undocumented harbor that could end a war or ignite one beyond repair.",
        "es": "Contratado para mapear una ruta oceanica disputada, un estratega naval descubre un puerto no documentado que podria terminar una guerra o encender otra sin retorno."
      },
      "shortDescription": {
        "en": "A sweeping maritime epic full of strategy, storms, and betrayal.",
        "es": "Una epica maritima con estrategia, tormentas y traicion."
      },
      "quote": {
        "en": "Maps are promises made by people who have never sailed there.",
        "es": "Los mapas son promesas hechas por gente que nunca navego hasta ahi."
      },
      "cover": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Fantasy", "Adventure", "Epic"],
      "mood": { "en": "Grand and stormy", "es": "Grandiosa y tormentosa" },
      "accent": "#3d6483",
      "shelves": { "en": "305k shelved", "es": "305k en estantes" },
      "friendsReading": 131,
      "featured": true,
      "trending": true,
      "editorPick": true
    },
    {
      "id": "book-atlas-of-broken-weather",
      "slug": "atlas-of-broken-weather",
      "title": { "en": "Atlas of Broken Weather", "es": "Atlas del clima roto" },
      "subtitle": { "en": "Charting storms no one can explain", "es": "Cartografiando tormentas que nadie explica" },
      "authorId": "author-darian-kade",
      "year": 2026,
      "pageCount": 389,
      "format": { "en": "eBook", "es": "Libro digital" },
      "rating": 4.6,
      "ratingCount": { "en": "11.8k ratings", "es": "11.8k valoraciones" },
      "description": {
        "en": "A climate navigator and a retired pirate captain join forces to track impossible storm corridors that erase ships from every official registry.",
        "es": "Una navegante climatica y un capitan pirata retirado unen fuerzas para rastrear corredores de tormenta imposibles que borran barcos de todo registro oficial."
      },
      "shortDescription": {
        "en": "An adventurous climate fantasy about risk, science, and survival.",
        "es": "Una fantasia climatica aventurera sobre riesgo, ciencia y supervivencia."
      },
      "quote": {
        "en": "Weather is a language. We were never taught to read it.",
        "es": "El clima es un lenguaje. Nunca nos ensenaron a leerlo."
      },
      "cover": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Fantasy", "Science Fiction", "Adventure"],
      "mood": { "en": "Dynamic and daring", "es": "Dinamica y audaz" },
      "accent": "#4e7890",
      "shelves": { "en": "174k shelved", "es": "174k en estantes" },
      "friendsReading": 83,
      "featured": true,
      "trending": true,
      "editorPick": false
    },
    {
      "id": "book-borrowed-constellations",
      "slug": "borrowed-constellations",
      "title": { "en": "Borrowed Constellations", "es": "Constelaciones prestadas" },
      "subtitle": { "en": "A city learns to share the night", "es": "Una ciudad aprende a compartir la noche" },
      "authorId": "author-yara-monten",
      "year": 2025,
      "pageCount": 344,
      "format": { "en": "Paperback", "es": "Tapa blanda" },
      "rating": 4.4,
      "ratingCount": { "en": "9.2k ratings", "es": "9.2k valoraciones" },
      "description": {
        "en": "In a heat-struck metropolis that loses power every evening, a teenage astronomy club builds low-cost sky mirrors that accidentally reveal long-buried civic corruption.",
        "es": "En una metropolis afectada por el calor que pierde energia cada noche, un club juvenil de astronomia construye espejos de cielo de bajo costo que accidentalmente revelan corrupcion civica enterrada por anos."
      },
      "shortDescription": {
        "en": "A hopeful climate novel about youth, science, and solidarity.",
        "es": "Una novela climatica esperanzadora sobre juventud, ciencia y solidaridad."
      },
      "quote": {
        "en": "We borrowed the stars because no one would lend us power.",
        "es": "Tomamos prestadas las estrellas porque nadie nos prestaba energia."
      },
      "cover": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Science Fiction", "Young Adult", "Drama"],
      "mood": { "en": "Hopeful and inventive", "es": "Esperanzadora e inventiva" },
      "accent": "#7a82c0",
      "shelves": { "en": "126k shelved", "es": "126k en estantes" },
      "friendsReading": 68,
      "featured": false,
      "trending": true,
      "editorPick": true
    },
    {
      "id": "book-a-map-for-tomorrow",
      "slug": "a-map-for-tomorrow",
      "title": { "en": "A Map for Tomorrow", "es": "Un mapa para manana" },
      "subtitle": { "en": "Planning a future in rising water", "es": "Planear el futuro con el agua en ascenso" },
      "authorId": "author-yara-monten",
      "year": 2023,
      "pageCount": 301,
      "format": { "en": "eBook", "es": "Libro digital" },
      "rating": 4.2,
      "ratingCount": { "en": "5.7k ratings", "es": "5.7k valoraciones" },
      "description": {
        "en": "A community cartographer trains coastal neighborhoods to produce their own adaptation maps, but when funding disappears, residents must choose between relocation and resistance.",
        "es": "Una cartografa comunitaria ensena a barrios costeros a crear sus propios mapas de adaptacion, pero cuando desaparece el financiamiento, los vecinos deben elegir entre reubicacion y resistencia."
      },
      "shortDescription": {
        "en": "A grounded climate drama about collective planning and dignity.",
        "es": "Un drama climatico realista sobre planificacion colectiva y dignidad."
      },
      "quote": {
        "en": "The future is not found. It is negotiated.",
        "es": "El futuro no se encuentra. Se negocia."
      },
      "cover": "https://images.unsplash.com/photo-1455885666463-9b4cc1586f97?auto=format&fit=crop&w=900&q=80",
      "backdrop": "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1600&q=80",
      "genres": ["Contemporary Fiction", "Science Fiction", "Book Club"],
      "mood": { "en": "Grounded and resilient", "es": "Realista y resiliente" },
      "accent": "#5f8ea0",
      "shelves": { "en": "74k shelved", "es": "74k en estantes" },
      "friendsReading": 39,
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
