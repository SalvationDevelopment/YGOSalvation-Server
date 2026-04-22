"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ManagementPageShell from "@/components/management/management-page-shell";
import PaginationControls from "@/components/management/pagination-controls";

const PAGE_SIZE = 10;

/**
 * Renders the User Add Form component and returns the UI used by the users management page view.
 * @param {Object} props The props object supplies the structured input used by the users management page module, including the `onCreate` property.
 * @param {Function} props.onCreate The `onCreate` property supplies structured input used by the users management page module.
 * @returns {React.ReactNode} Returns the rendered UI used by the users management page view.
 */
function UserAddForm({ onCreate }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

      /**
   * Executes the submit helper used by the users management page module.
   * @param {Object} event The event event provides the browser event data used by the users management page module.
   * @returns {Promise<void>} Resolves when the users management page operation completes.
   */
  async function submit(event) {
    event.preventDefault();
    await onCreate({ username, email, password });
    setUsername("");
    setEmail("");
    setPassword("");
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <h2>Add User</h2>
      <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" required />
      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required />
      <button className="btn primary" type="submit">Create User</button>
    </form>
  );
}

/**
 * Renders the User Edit Form component and returns the UI used by the users management page view.
 * @param {Object} props The props object supplies the structured input used by the users management page module, including the `onCancel`, `onSave`, and `user` properties.
 * @param {Function} props.onCancel The `onCancel` property supplies structured input used by the users management page module.
 * @param {Function} props.onSave The `onSave` property supplies structured input used by the users management page module.
 * @param {Object} props.user The `user` property supplies structured input used by the users management page module.
 * @param {string} props.user.email The `user.email` property supplies structured input used by the users management page module.
 * @param {string} props.user.id The `user.id` property supplies structured input used by the users management page module.
 * @param {string} props.user.role The `user.role` property supplies structured input used by the users management page module.
 * @param {string} props.user.username The `user.username` property supplies structured input used by the users management page module.
 * @returns {React.ReactNode} Returns the rendered UI used by the users management page view.
 */
function UserEditForm({ user, onSave, onCancel }) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState("");

      /**
   * Executes the submit helper used by the users management page module.
   * @param {Object} event The event event provides the browser event data used by the users management page module.
   * @returns {Promise<void>} Resolves when the users management page operation completes.
   */
  async function submit(event) {
    event.preventDefault();
    const payload = { username, email, role };
    if (password) payload.password = password;
    await onSave(user.id, payload);
  }

  return (
    <form className="inline-edit" onSubmit={submit}>
      <input value={username} onChange={(event) => setUsername(event.target.value)} required />
      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <select value={role} onChange={(event) => setRole(event.target.value)}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password (optional)" />
      <div className="inline-actions">
        <button className="btn primary" type="submit">Save</button>
        <button className="btn" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

/**
 * Renders the Users Management Page component and returns the UI used by the users management page view.
 * @returns {React.ReactNode} Returns the rendered UI used by the users management page view.
 */
export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [searchField, setSearchField] = useState("username");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState("");

      /**
   * Executes the request helper used by the users management page module.
   * @param {string} path The path value provides an input used by the users management page module.
   * @param {Object} options The options value provides an input used by the users management page module.
   * @returns {Promise<Object>} Resolves with the value produced by the users management page module.
   */
  async function request(path, options = {}) {
    const response = await fetch(path, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Request failed.");
    }

    return data;
  }

  const loadUsers = useCallback(async () => {
    try {
      setError("");
      const data = await request("/api/users");
      setUsers(data.users || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => String(user[searchField] || "").toLowerCase().includes(query));
  }, [users, searchField, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

      /**
   * Creates user used by the users management page module.
   * @param {Object} payload The payload value provides an input used by the users management page module.
   * @returns {Promise<void>} Resolves when the users management page operation completes.
   */
  async function createUser(payload) {
    try {
      setError("");
      await request("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

      /**
   * Saves user used by the users management page module.
   * @param {string} id The id value provides an input used by the users management page module.
   * @param {Object} payload The payload value provides an input used by the users management page module.
   * @returns {Promise<void>} Resolves when the users management page operation completes.
   */
  async function saveUser(id, payload) {
    try {
      setError("");
      await request(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setEditingId("");
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

      /**
   * Deletes user used by the users management page module.
   * @param {string} id The id value provides an input used by the users management page module.
   * @returns {Promise<void>} Resolves when the users management page operation completes.
   */
  async function deleteUser(id) {
    try {
      setError("");
      await request(`/api/users/${id}`, { method: "DELETE" });
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <ManagementPageShell
      title="Users"
      description="Create, edit, and delete users."
      searchField={searchField}
      onSearchFieldChange={(value) => {
        setSearchField(value);
        setPage(1);
      }}
      searchFieldOptions={[
        { value: "username", label: "Username" },
        { value: "email", label: "Email" },
        { value: "role", label: "Role" }
      ]}
      searchValue={searchValue}
      onSearchValueChange={(value) => {
        setSearchValue(value);
        setPage(1);
      }}
    >
      {error ? <p className="error">{error}</p> : null}
      <div className="management-grid">
        <article className="panel soft-panel">
          <UserAddForm onCreate={createUser} />
        </article>

        <article className="panel soft-panel">
          <h2>All Users ({filteredUsers.length})</h2>
          <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          <ul className="simple-list">
            {visibleUsers.map((user) => (
              <li key={user.id}>
                {editingId === user.id ? (
                  <UserEditForm user={user} onSave={saveUser} onCancel={() => setEditingId("")} />
                ) : (
                  <>
                    <span>{user.username} ({user.email}) - {user.role}</span>
                    <div className="inline-actions">
                      <button className="btn" onClick={() => setEditingId(user.id)}>Edit</button>
                      <button className="btn" onClick={() => deleteUser(user.id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </ManagementPageShell>
  );
}
