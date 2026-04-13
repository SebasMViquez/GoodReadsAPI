-- GoodReadsAPI Supabase bootstrap (Phase 7: extra authors bulk seed)
-- Run this before 008_books_bulk_seed_extra.sql

with authors_payload as (
    select
    $$
    [
      {
        "id": "author-ines-valeri",
        "name": "Ines Valeri",
        "portrait": "https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&w=600&q=80",
        "location": "Montevideo, Uruguay",
        "shortBio": {
          "en": "Ines writes intimate literary fiction about migration, inherited silence, and chosen families.",
          "es": "Ines escribe ficcion literaria intima sobre migracion, silencios heredados y familias elegidas."
        },
        "notableWork": {
          "en": "Lanterns for the Absent",
          "es": "Faroles para los ausentes"
        }
      },
      {
        "id": "author-caleb-thorne",
        "name": "Caleb Thorne",
        "portrait": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
        "location": "Bristol, United Kingdom",
        "shortBio": {
          "en": "Caleb blends near-future suspense with moral dilemmas about surveillance and public memory.",
          "es": "Caleb mezcla suspenso de futuro cercano con dilemas morales sobre vigilancia y memoria publica."
        },
        "notableWork": {
          "en": "City of Quiet Signals",
          "es": "Ciudad de senales quietas"
        }
      },
      {
        "id": "author-violeta-rios",
        "name": "Violeta Rios",
        "portrait": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
        "location": "Puebla, Mexico",
        "shortBio": {
          "en": "Violeta writes lyrical dramas rooted in rural landscapes, food rituals, and family repair.",
          "es": "Violeta escribe dramas liricos anclados en paisajes rurales, rituales de comida y reparacion familiar."
        },
        "notableWork": {
          "en": "Stone Orchard",
          "es": "Huerto de piedra"
        }
      },
      {
        "id": "author-darian-kade",
        "name": "Darian Kade",
        "portrait": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
        "location": "Cape Town, South Africa",
        "shortBio": {
          "en": "Darian crafts oceanic adventures with political intrigue, old maps, and high-stakes expeditions.",
          "es": "Darian crea aventuras oceanicas con intriga politica, mapas antiguos y expediciones de alto riesgo."
        },
        "notableWork": {
          "en": "The Ninth Harbor",
          "es": "El noveno puerto"
        }
      },
      {
        "id": "author-yara-monten",
        "name": "Yara Monten",
        "portrait": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
        "location": "San Jose, Costa Rica",
        "shortBio": {
          "en": "Yara writes hopeful science fiction about climate adaptation, youth leadership, and community science.",
          "es": "Yara escribe ciencia ficcion esperanzadora sobre adaptacion climatica, liderazgo joven y ciencia comunitaria."
        },
        "notableWork": {
          "en": "Borrowed Constellations",
          "es": "Constelaciones prestadas"
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
