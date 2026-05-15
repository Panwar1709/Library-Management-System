import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import ErrorAlert from "./ErrorAlert.jsx";

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setCategories(await api.getCategories());
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
      await api.addCategory(name);
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
        <h2>Categories</h2>
        <p>Subject and shelving groups. IDs are referenced when registering books.</p>
      </div>
      <div className="panel-body">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {loading ? (
          <div className="loading-block">
            <div className="spinner" />
            <span>Loading categories…</span>
          </div>
        ) : (
          <>
            <div className="panel-section">
              <h3 className="panel-section-title">Add category</h3>
              <form className="inline-form" onSubmit={handleSubmit}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category label"
                  required
                  aria-label="Category name"
                />
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  Save category
                </button>
              </form>
            </div>

            <div className="panel-section">
              <h3 className="panel-section-title">Directory</h3>
              {categories.length === 0 ? (
                <div className="empty-state">No categories defined.</div>
              ) : (
                <ul className="entity-list">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <span className="entity-name">{c.name}</span>
                      <span className="badge badge-neutral">ID {c.id}</span>
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
