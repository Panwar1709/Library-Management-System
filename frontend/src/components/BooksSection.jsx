import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import ErrorAlert from "./ErrorAlert.jsx";

export default function BooksSection() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [isbn, setIsbn] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [categoryIds, setCategoryIds] = useState("");

  const [borrowBook, setBorrowBook] = useState(null);
  const [borrowUserId, setBorrowUserId] = useState("");

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [b, a, c] = await Promise.all([
        api.getBooks(),
        api.getAuthors(),
        api.getCategories(),
      ]);
      setBooks(b);
      setAuthors(a);
      setCategories(c);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!borrowBook) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) setBorrowBook(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [borrowBook, busy]);

  async function handleAddBook(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const ids = categoryIds
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number);
      await api.addBook({
        title,
        isbn,
        authorId: Number(authorId),
        categoryIds: ids,
      });
      setTitle("");
      setIsbn("");
      setAuthorId("");
      setCategoryIds("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function openBorrow(book) {
    setBorrowUserId("");
    setBorrowBook(book);
  }

  async function confirmBorrow() {
    if (!borrowBook) return;
    const uid = Number(borrowUserId);
    if (!Number.isFinite(uid) || uid < 1) {
      setError("Enter a valid numeric member ID.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.borrowBook(borrowBook.id, uid);
      setBorrowBook(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function returnB(bookId) {
    setBusy(true);
    setError(null);
    try {
      await api.returnBook(bookId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Books & circulation</h2>
        <p>Add titles to the catalogue, assign categories, and process loans and returns.</p>
      </div>
      <div className="panel-body">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {loading ? (
          <div className="loading-block" aria-live="polite">
            <div className="spinner" />
            <span>Loading catalogue…</span>
          </div>
        ) : (
          <>
            <div className="panel-section">
              <h3 className="panel-section-title">Register new book</h3>
              <form className="form-grid" onSubmit={handleAddBook}>
                <label>
                  <span>Title</span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Pride and Prejudice"
                    required
                  />
                </label>
                <label>
                  <span>ISBN</span>
                  <input
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="International Standard Book Number"
                    required
                  />
                </label>
                <label>
                  <span>Author</span>
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    required
                  >
                    <option value="">Select author…</option>
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="field">
                  <span>
                    Category IDs{" "}
                    <span className="field-hint">— comma-separated database IDs</span>
                  </span>
                  <input
                    value={categoryIds}
                    onChange={(e) => setCategoryIds(e.target.value)}
                    placeholder="e.g. 1 or 1, 2"
                    required
                  />
                </div>
                <div>
                  <button className="btn btn-primary" type="submit" disabled={busy}>
                    Add to catalogue
                  </button>
                </div>
              </form>

              {categories.length > 0 && (
                <div className="chip-row" aria-label="Current category IDs">
                  {categories.map((c) => (
                    <span key={c.id} className="chip" title={c.name}>
                      {c.id} · {c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="panel-section">
              <h3 className="panel-section-title">Catalogue</h3>
              {books.length === 0 ? (
                <div className="empty-state">No books registered yet.</div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>ISBN</th>
                        <th>Status</th>
                        <th style={{ width: "1%" }} aria-label="Actions">
                          &nbsp;
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((b) => (
                        <tr key={b.id}>
                          <td className="mono">{b.id}</td>
                          <td>{b.title}</td>
                          <td className="mono">{b.isbn}</td>
                          <td>
                            {b.available ? (
                              <span className="badge badge-success">Available</span>
                            ) : (
                              <span className="badge badge-neutral">On loan</span>
                            )}
                          </td>
                          <td className="actions">
                            {b.available ? (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={busy}
                                onClick={() => openBorrow(b)}
                              >
                                Borrow
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={busy}
                                onClick={() => returnB(b.id)}
                              >
                                Return
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {borrowBook && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !busy && setBorrowBook(null)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="borrow-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="borrow-title">Check out book</h3>
            <p className="modal-book">
              <strong>{borrowBook.title}</strong>
              <span className="muted"> — ISBN {borrowBook.isbn}</span>
            </p>
            <label>
              <span>Member user ID</span>
              <input
                type="number"
                min={1}
                value={borrowUserId}
                onChange={(e) => setBorrowUserId(e.target.value)}
                placeholder="From Members tab"
                autoFocus
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => setBorrowBook(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={confirmBorrow}
              >
                Confirm loan
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
