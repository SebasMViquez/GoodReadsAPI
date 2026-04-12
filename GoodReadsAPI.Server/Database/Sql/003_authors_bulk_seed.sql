-- GoodReadsAPI Supabase bootstrap (Phase 3: authors bulk seed)
-- Run this before 004_books_bulk_seed.sql

with authors_payload as (
    select
    $$
    [
      {
        "id": "author-elia-marrow",
        "name": "Elia Marrow",
        "portrait": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
        "location": "London, United Kingdom",
        "shortBio": {
          "en": "Elia writes literary speculative fiction about memory, intimacy, and the architecture of belonging.",
          "es": "Elia escribe ficcion especulativa literaria sobre memoria, intimidad y la arquitectura de la pertenencia."
        },
        "notableWork": {
          "en": "The Glass Archive",
          "es": "El archivo de cristal"
        }
      },
      {
        "id": "author-nora-vale",
        "name": "Nora Vale",
        "portrait": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
        "location": "Lisbon, Portugal",
        "shortBio": {
          "en": "Nora writes contemporary mysteries with botanical imagery and emotionally precise character work.",
          "es": "Nora escribe misterios contemporaneos con imagineria botanica y personajes emocionalmente precisos."
        },
        "notableWork": {
          "en": "The Midnight Botanist",
          "es": "La botanica de medianoche"
        }
      },
      {
        "id": "author-mateo-rhine",
        "name": "Mateo Rhine",
        "portrait": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
        "location": "Valparaiso, Chile",
        "shortBio": {
          "en": "Mateo builds coastal historical dramas where family memory and geography shape every choice.",
          "es": "Mateo construye dramas historicos costeros donde la memoria familiar y la geografia moldean cada decision."
        },
        "notableWork": {
          "en": "Ember Harbor",
          "es": "Puerto de brasas"
        }
      },
      {
        "id": "author-irene-kestrel",
        "name": "Irene Kestrel",
        "portrait": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80",
        "location": "Seattle, USA",
        "shortBio": {
          "en": "Irene writes introspective science fiction focused on communication, isolation, and ethical ambiguity.",
          "es": "Irene escribe ciencia ficcion introspectiva centrada en comunicacion, aislamiento y ambiguedad etica."
        },
        "notableWork": {
          "en": "Silent Orbit",
          "es": "Orbita silenciosa"
        }
      },
      {
        "id": "author-lina-corbet",
        "name": "Lina Corbet",
        "portrait": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
        "location": "Quito, Ecuador",
        "shortBio": {
          "en": "Lina blends family sagas and magical realism to explore inheritance, drought, and resilience.",
          "es": "Lina mezcla sagas familiares y realismo magico para explorar herencia, sequia y resiliencia."
        },
        "notableWork": {
          "en": "The Rainkeeper's Daughter",
          "es": "La hija del guardian de la lluvia"
        }
      },
      {
        "id": "author-clara-west",
        "name": "Clara West",
        "portrait": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
        "location": "Dublin, Ireland",
        "shortBio": {
          "en": "Clara writes reflective contemporary fiction about family fracture, memory, and second beginnings.",
          "es": "Clara escribe ficcion contemporanea reflexiva sobre fractura familiar, memoria y segundos comienzos."
        },
        "notableWork": {
          "en": "Ashes of June",
          "es": "Las cenizas de junio"
        }
      },
      {
        "id": "author-soren-hale",
        "name": "Soren Hale",
        "portrait": "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80",
        "location": "Reykjavik, Iceland",
        "shortBio": {
          "en": "Soren writes epic maritime fantasy where maps, myth, and empire collide.",
          "es": "Soren escribe fantasia maritima epica donde mapas, mito e imperio colisionan."
        },
        "notableWork": {
          "en": "The Cartographer's Tide",
          "es": "La marea del cartografo"
        }
      },
      {
        "id": "author-naomi-quill",
        "name": "Naomi Quill",
        "portrait": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
        "location": "Vancouver, Canada",
        "shortBio": {
          "en": "Naomi writes character-driven science fiction about return, climate, and family distance.",
          "es": "Naomi escribe ciencia ficcion centrada en personajes sobre regreso, clima y distancia familiar."
        },
        "notableWork": {
          "en": "Winter After Mars",
          "es": "Invierno despues de Marte"
        }
      },
      {
        "id": "author-mira-fen",
        "name": "Mira Fen",
        "portrait": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
        "location": "Kyoto, Japan",
        "shortBio": {
          "en": "Mira writes tender fantasy about ritual, sacrifice, and moral consequence.",
          "es": "Mira escribe fantasia tierna sobre ritual, sacrificio y consecuencia moral."
        },
        "notableWork": {
          "en": "House of Paper Stars",
          "es": "Casa de estrellas de papel"
        }
      },
      {
        "id": "author-julian-foret",
        "name": "Julian Foret",
        "portrait": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
        "location": "Brussels, Belgium",
        "shortBio": {
          "en": "Julian writes urban literary mysteries shaped by transit, grief, and disappearing neighborhoods.",
          "es": "Julian escribe misterios literarios urbanos marcados por transporte, duelo y barrios que desaparecen."
        },
        "notableWork": {
          "en": "Beneath the Red Tram",
          "es": "Bajo el tranvia rojo"
        }
      }
    ]
    $$::jsonb as payload
),
rows as (
    select jsonb_array_elements(payload) as item
    from authors_payload
)
insert into public.authors (
    id,
    name,
    portrait,
    location,
    short_bio,
    notable_work
)
select
    item ->> 'id',
    item ->> 'name',
    item ->> 'portrait',
    item ->> 'location',
    item -> 'shortBio',
    item -> 'notableWork'
from rows
on conflict (id) do update
set
    name = excluded.name,
    portrait = excluded.portrait,
    location = excluded.location,
    short_bio = excluded.short_bio,
    notable_work = excluded.notable_work,
    updated_at = now();

select count(*) as total_authors from public.authors;
