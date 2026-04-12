import { useEffect, useMemo, useState } from 'react';
import type { Book } from '@/types';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');
const useMockApi = (import.meta.env.VITE_USE_MOCK_API ?? 'true').toLowerCase() === 'true';

const createPayload = (titleInput: string): Book => {
  const normalized = titleInput.trim() || `Test Book ${Date.now()}`;
  const safeSlug = normalized
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60) || `test-book-${Date.now()}`;

  const id = `book-${Date.now()}`;

  return {
    id,
    slug: safeSlug,
    title: { en: normalized, es: `${normalized} (ES)` },
    subtitle: { en: 'Created from frontend lab', es: 'Creado desde laboratorio frontend' },
    authorId: 'author-lab',
    year: new Date().getFullYear(),
    pageCount: 320,
    format: { en: 'Paperback', es: 'Tapa blanda' },
    rating: 4.2,
    ratingCount: { en: '120 ratings', es: '120 valoraciones' },
    description: {
      en: 'This record was created from the frontend integration lab to verify Supabase persistence.',
      es: 'Este registro fue creado desde el laboratorio de integracion frontend para validar persistencia en Supabase.',
    },
    shortDescription: {
      en: 'Frontend persistence test.',
      es: 'Prueba de persistencia desde frontend.',
    },
    quote: {
      en: 'Data is only real when it persists.',
      es: 'Los datos solo son reales cuando persisten.',
    },
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=60',
    backdrop: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&auto=format&fit=crop&q=60',
    genres: ['Fiction', 'Technology'],
    mood: { en: 'Curious', es: 'Curioso' },
    accent: '#4A6FA5',
    shelves: { en: 'General', es: 'General' },
    friendsReading: 0,
    featured: false,
    trending: false,
    editorPick: false,
  };
};

async function fetchBooks(): Promise<Book[]> {
  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }

  const response = await fetch(`${apiBaseUrl}/api/books`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`GET /api/books failed (${response.status}).`);
  }

  return (await response.json()) as Book[];
}

async function createBook(payload: Book): Promise<Book> {
  const response = await fetch(`${apiBaseUrl}/api/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`POST /api/books failed (${response.status}): ${details}`);
  }

  return (await response.json()) as Book;
}

async function deleteBook(bookId: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/books/${encodeURIComponent(bookId)}`, {
    method: 'DELETE',
  });

  if (response.status === 404) {
    return;
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`DELETE /api/books/{id} failed (${response.status}): ${details}`);
  }
}

export function BooksLabPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [titleInput, setTitleInput] = useState('Test Book From Frontend');
  const [status, setStatus] = useState('Loading books...');
  const [busy, setBusy] = useState(false);

  const canUseApi = useMemo(() => !useMockApi && Boolean(apiBaseUrl), []);

  const reload = async () => {
    setBusy(true);

    try {
      const next = await fetchBooks();
      setBooks(next);
      setStatus(`Loaded ${next.length} books from backend.`);
    } catch (caughtError) {
      setStatus(caughtError instanceof Error ? caughtError.message : 'Failed to load books.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const handleCreate = async () => {
    setBusy(true);

    try {
      const payload = createPayload(titleInput);
      const created = await createBook(payload);
      setStatus(`Created ${created.id} and saved in Supabase.`);
      await reload();
    } catch (caughtError) {
      setStatus(caughtError instanceof Error ? caughtError.message : 'Create failed.');
      setBusy(false);
    }
  };

  const handleDelete = async (bookId: string) => {
    setBusy(true);

    try {
      await deleteBook(bookId);
      setStatus(`Deleted ${bookId}.`);
      await reload();
    } catch (caughtError) {
      setStatus(caughtError instanceof Error ? caughtError.message : 'Delete failed.');
      setBusy(false);
    }
  };

  if (!import.meta.env.DEV) {
    return (
      <section className="section page-top-spacing">
        <div className="container">
          <h1>Books Lab is available only in development.</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="section page-top-spacing">
      <div className="container" style={{ display: 'grid', gap: '1rem' }}>
        <header>
          <h1>Books Lab (Dev)</h1>
          <p>Use this screen to validate create/read/delete persistence against Supabase through backend APIs.</p>
          <p><strong>API Base:</strong> {apiBaseUrl || '(not configured)'}</p>
          <p><strong>Mock mode:</strong> {String(useMockApi)}</p>
          {!canUseApi ? (
            <p style={{ color: '#b91c1c' }}>
              Set VITE_USE_MOCK_API=false and VITE_API_BASE_URL to use backend persistence.
            </p>
          ) : null}
        </header>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={titleInput}
            onChange={(event) => setTitleInput(event.target.value)}
            placeholder="Book title"
            style={{ minWidth: '20rem', padding: '0.5rem' }}
          />
          <button type="button" className="button button--primary" onClick={handleCreate} disabled={busy || !canUseApi}>
            Create Test Book
          </button>
          <button type="button" className="button button--ghost" onClick={() => void reload()} disabled={busy || !canUseApi}>
            Reload
          </button>
        </div>

        <p>{status}</p>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {books.map((book) => (
            <article key={book.id} className="card" style={{ padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                <div>
                  <strong>{book.title.en}</strong>
                  <p style={{ margin: '0.25rem 0' }}>id: {book.id} | slug: {book.slug}</p>
                </div>
                <button type="button" className="button button--ghost" onClick={() => void handleDelete(book.id)} disabled={busy || !canUseApi}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {books.length === 0 ? <p>No books found in backend catalog.</p> : null}
        </div>
      </div>
    </section>
  );
}

export default BooksLabPage;
