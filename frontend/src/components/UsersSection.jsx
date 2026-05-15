import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import ErrorAlert from "./ErrorAlert.jsx";

export default function UsersSection() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setUsers(await api.getUsers());
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
      await api.addUser({ name, email, phone, address });
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm(`Remove member record #${id}? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      await api.deleteUser(id);
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
        <h2>Members</h2>
        <p>Patron accounts used when checking out materials. Note each member’s ID for loans.</p>
      </div>
      <div className="panel-body">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {loading ? (
          <div className="loading-block">
            <div className="spinner" />
            <span>Loading members…</span>
          </div>
        ) : (
          <>
            <div className="panel-section">
              <h3 className="panel-section-title">Register member</h3>
              <form className="form-grid" onSubmit={handleSubmit}>
                <label>
                  <span>Full name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} required />
                </label>
                <label>
                  <span>Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                  <span>Phone</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </label>
                <label>
                  <span>Address</span>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} required />
                </label>
                <div>
                  <button className="btn btn-primary" type="submit" disabled={busy}>
                    Save member
                  </button>
                </div>
              </form>
            </div>

            <div className="panel-section">
              <h3 className="panel-section-title">Roster</h3>
              {users.length === 0 ? (
                <div className="empty-state">No members registered.</div>
              ) : (
                <ul className="user-cards">
                  {users.map((u) => (
                    <li key={u.id}>
                      <div className="user-main">
                        <div className="user-name">{u.name}</div>
                        <div className="user-meta">
                          <span className="badge badge-neutral">ID {u.id}</span>
                          {u.profile?.email && (
                            <>
                              {" "}
                              <span className="muted">{u.profile.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={busy}
                        onClick={() => remove(u.id)}
                      >
                        Remove
                      </button>
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
