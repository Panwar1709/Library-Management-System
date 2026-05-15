import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import ErrorAlert from "./ErrorAlert.jsx";

export default function AuthorsSection() {
  const [authors, setAuthors] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setAuthors(await api.getAuthors());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.addAuthor(name);
      setName("");
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
        <h2>Authors</h2>
        <p>Maintain the list of writers linked to catalogue records.</p>
      </div>
      <div className="panel-body">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {loading ? (
          <div className="loading-block">
            <div className="spinner" />
            <span>Loading authors…</span>
          </div>
        ) : (
          <>
            <div className="panel-section">
              <h3 className="panel-section-title">Add author</h3>
              <form className="inline-form" onSubmit={handleSubmit}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  aria-label="Author name"
                />
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  Save author
                </button>
              </form>
            </div>

            <div className="panel-section">
              <h3 className="panel-section-title">Directory</h3>
              {authors.length === 0 ? (
                <div className="empty-state">No authors on file.</div>
              ) : (
                <ul className="entity-list">
                  {authors.map((a) => (
                    <li key={a.id}>
                      <span className="entity-name">{a.name}</span>
                      <span className="badge badge-neutral">ID {a.id}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
