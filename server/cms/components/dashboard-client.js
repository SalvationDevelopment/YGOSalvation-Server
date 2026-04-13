"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Formats date used by the dashboard client module.
 * @param {string} value The value value provides an input used by the dashboard client module.
 * @returns {string} Returns the value produced by the dashboard client module.
 */
function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

/**
 * Parses card list used by the dashboard client module.
 * @param {string} value The value value provides an input used by the dashboard client module.
 * @returns {Array} Returns the value produced by the dashboard client module.
 */
function parseCardList(value) {
  return value
    .split(",")
    .map((entry) => Number(entry.trim()))
    .filter(Number.isFinite);
}

/**
 * Executes the contains query helper used by the dashboard client module.
 * @param {string} value The value value provides an input used by the dashboard client module.
 * @param {Object} query The query value provides an input used by the dashboard client module.
 * @returns {string} Returns the value produced by the dashboard client module.
 */
function containsQuery(value, query) {
  return String(value || "").toLowerCase().includes(query);
}

/**
 * Renders the Dashboard Client component and returns the UI used by the dashboard client view.
 * @param {Object} props The props object supplies the structured input used by the dashboard client module, including the `session` property.
 * @param {Object} props.session The `session` property supplies structured input used by the dashboard client module.
 * @param {string} props.session.email The `session.email` property supplies structured input used by the dashboard client module.
 * @param {string} props.session.username The `session.username` property supplies structured input used by the dashboard client module.
 * @returns {React.ReactNode} Returns the rendered UI used by the dashboard client view.
 */
export default function DashboardClient({ session }) {
  const router = useRouter();

  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [covers, setCovers] = useState([]);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchType, setSearchType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [backgroundName, setBackgroundName] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");

  const [coverName, setCoverName] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const [deckName, setDeckName] = useState("");
  const [deckOwner, setDeckOwner] = useState("");
  const [deckMain, setDeckMain] = useState("");
  const [deckExtra, setDeckExtra] = useState("");
  const [deckSide, setDeckSide] = useState("");

          /**
   * Fetches json used by the dashboard client module.
   * @param {string} path The path value provides an input used by the dashboard client module.
   * @param {Object} options The options value provides an input used by the dashboard client module.
   * @returns {Promise<Object>} Resolves with the value produced by the dashboard client module.
   */
  async function fetchJson(path, options = {}) {
    const response = await fetch(path, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(data.error || `Request failed: ${path}`);
    }

    return data;
  }

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [usersData, backgroundsData, coversData, decksData] = await Promise.all([
        fetchJson("/api/users"),
        fetchJson("/api/backgrounds"),
        fetchJson("/api/covers"),
        fetchJson("/api/decks")
      ]);

      setUsers(usersData.users || []);
      setBackgrounds(backgroundsData.backgrounds || []);
      setCovers(coversData.covers || []);
      setDecks(decksData.decks || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

          /**
   * Creates user used by the dashboard client module.
   * @param {Object} event The event event provides the browser event data used by the dashboard client module.
   * @returns {Promise<void>} Resolves when the dashboard client operation completes.
   */
  async function createUser(event) {
    event.preventDefault();

    try {
      await fetchJson("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      setUsername("");
      setEmail("");
      setPassword("");
      await loadAll();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

          /**
   * Creates background used by the dashboard client module.
   * @param {Object} event The event event provides the browser event data used by the dashboard client module.
   * @returns {Promise<void>} Resolves when the dashboard client operation completes.
   */
  async function createBackground(event) {
    event.preventDefault();

    try {
      await fetchJson("/api/backgrounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: backgroundName, imageUrl: backgroundImageUrl })
      });
      setBackgroundName("");
      setBackgroundImageUrl("");
      await loadAll();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

          /**
   * Creates cover used by the dashboard client module.
   * @param {Object} event The event event provides the browser event data used by the dashboard client module.
   * @returns {Promise<void>} Resolves when the dashboard client operation completes.
   */
  async function createCover(event) {
    event.preventDefault();

    try {
      await fetchJson("/api/covers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: coverName, imageUrl: coverImageUrl })
      });
      setCoverName("");
      setCoverImageUrl("");
      await loadAll();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

          /**
   * Creates deck used by the dashboard client module.
   * @param {Object} event The event event provides the browser event data used by the dashboard client module.
   * @returns {Promise<void>} Resolves when the dashboard client operation completes.
   */
  async function createDeck(event) {
    event.preventDefault();

    try {
      await fetchJson("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: deckName,
          owner: deckOwner,
          main: parseCardList(deckMain),
          extra: parseCardList(deckExtra),
          side: parseCardList(deckSide)
        })
      });

      setDeckName("");
      setDeckOwner("");
      setDeckMain("");
      setDeckExtra("");
      setDeckSide("");
      await loadAll();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

          /**
   * Removes item used by the dashboard client module.
   * @param {string} path The path value provides an input used by the dashboard client module.
   * @returns {Promise<void>} Resolves when the dashboard client operation completes.
   */
  async function removeItem(path) {
    try {
      await fetchJson(path, { method: "DELETE" });
      await loadAll();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

          /**
   * Handles logout used by the dashboard client module.
   * @returns {Promise<void>} Resolves when the dashboard client operation completes.
   */
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const showUsers = searchType === "all" || searchType === "users";
  const showBackgrounds = searchType === "all" || searchType === "backgrounds";
  const showCovers = searchType === "all" || searchType === "covers";
  const showDecks = searchType === "all" || searchType === "decks";

  const filteredUsers = useMemo(() => {
    if (!showUsers) {
      return [];
    }

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) => {
      return containsQuery(user.username, normalizedQuery) || containsQuery(user.email, normalizedQuery);
    });
  }, [users, normalizedQuery, showUsers]);

  const filteredBackgrounds = useMemo(() => {
    if (!showBackgrounds) {
      return [];
    }

    if (!normalizedQuery) {
      return backgrounds;
    }

    return backgrounds.filter((item) => {
      return containsQuery(item.name, normalizedQuery) || containsQuery(item.imageUrl, normalizedQuery);
    });
  }, [backgrounds, normalizedQuery, showBackgrounds]);

  const filteredCovers = useMemo(() => {
    if (!showCovers) {
      return [];
    }

    if (!normalizedQuery) {
      return covers;
    }

    return covers.filter((item) => {
      return containsQuery(item.name, normalizedQuery) || containsQuery(item.imageUrl, normalizedQuery);
    });
  }, [covers, normalizedQuery, showCovers]);

  const filteredDecks = useMemo(() => {
    if (!showDecks) {
      return [];
    }

    if (!normalizedQuery) {
      return decks;
    }

    return decks.filter((deck) => {
      return (
        containsQuery(deck.name, normalizedQuery) ||
        containsQuery(deck.owner, normalizedQuery) ||
        containsQuery(deck.main.join(","), normalizedQuery) ||
        containsQuery(deck.extra.join(","), normalizedQuery) ||
        containsQuery(deck.side.join(","), normalizedQuery)
      );
    });
  }, [decks, normalizedQuery, showDecks]);

  return (
    <section className="dashboard-shell">
      <aside className="panel glass sidebar-nav">
        <h2>CMS</h2>
        <p className="muted">{session.username}</p>
        <nav>
          <a href="#users">Users</a>
          <a href="#backgrounds">Backgrounds</a>
          <a href="#covers">Covers</a>
          <a href="#decks">Decks</a>
        </nav>
      </aside>

      <div className="dashboard-main">
        <header className="panel glass dashboard-header">
          <div>
            <h1>Admin Console</h1>
            <p className="muted">Signed in as {session.username} ({session.email})</p>
          </div>
          <div className="search-controls">
            <select value={searchType} onChange={(event) => setSearchType(event.target.value)}>
              <option value="all">All Content</option>
              <option value="users">Users</option>
              <option value="backgrounds">Backgrounds</option>
              <option value="covers">Covers</option>
              <option value="decks">Decks</option>
            </select>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search content"
            />
            <button className="btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        {error ? <p className="error">{error}</p> : null}
        {loading ? <p className="muted">Loading...</p> : null}

        <section className="dashboard-grid stacked">
          <article id="users" className="panel glass">
            <h2>Users ({filteredUsers.length})</h2>
            <form className="form-stack" onSubmit={createUser}>
              <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button className="btn primary" type="submit">Create User</button>
            </form>
            <ul className="simple-list">
              {filteredUsers.map((user) => (
                <li key={user.id}>{user.username} ({user.email}) - {user.role}</li>
              ))}
            </ul>
          </article>

          <article id="backgrounds" className="panel glass">
            <h2>Backgrounds (Public) ({filteredBackgrounds.length})</h2>
            <form className="form-stack" onSubmit={createBackground}>
              <input placeholder="Name" value={backgroundName} onChange={(e) => setBackgroundName(e.target.value)} required />
              <input placeholder="Image URL" value={backgroundImageUrl} onChange={(e) => setBackgroundImageUrl(e.target.value)} required />
              <button className="btn primary" type="submit">Create Background</button>
            </form>
            <ul className="simple-list">
              {filteredBackgrounds.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <a href={item.imageUrl} target="_blank" rel="noreferrer">image</a>
                  <button className="btn" onClick={() => removeItem(`/api/backgrounds/${item.id}`)}>Delete</button>
                </li>
              ))}
            </ul>
          </article>

          <article id="covers" className="panel glass">
            <h2>Covers (Public) ({filteredCovers.length})</h2>
            <form className="form-stack" onSubmit={createCover}>
              <input placeholder="Name" value={coverName} onChange={(e) => setCoverName(e.target.value)} required />
              <input placeholder="Image URL" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} required />
              <button className="btn primary" type="submit">Create Cover</button>
            </form>
            <ul className="simple-list">
              {filteredCovers.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <a href={item.imageUrl} target="_blank" rel="noreferrer">image</a>
                  <button className="btn" onClick={() => removeItem(`/api/covers/${item.id}`)}>Delete</button>
                </li>
              ))}
            </ul>
          </article>

          <article id="decks" className="panel glass">
            <h2>Decks ({filteredDecks.length})</h2>
            <form className="form-stack" onSubmit={createDeck}>
              <input placeholder="Deck name" value={deckName} onChange={(e) => setDeckName(e.target.value)} required />
              <input placeholder="Owner username" value={deckOwner} onChange={(e) => setDeckOwner(e.target.value)} required />
              <input placeholder="Main card IDs (comma separated)" value={deckMain} onChange={(e) => setDeckMain(e.target.value)} />
              <input placeholder="Extra card IDs (comma separated)" value={deckExtra} onChange={(e) => setDeckExtra(e.target.value)} />
              <input placeholder="Side card IDs (comma separated)" value={deckSide} onChange={(e) => setDeckSide(e.target.value)} />
              <button className="btn primary" type="submit">Create Deck</button>
            </form>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Owner</th>
                    <th>Main</th>
                    <th>Extra</th>
                    <th>Side</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDecks.map((deck) => (
                    <tr key={deck.id}>
                      <td>{deck.name}</td>
                      <td>{deck.owner}</td>
                      <td>{deck.main.length}</td>
                      <td>{deck.extra.length}</td>
                      <td>{deck.side.length}</td>
                      <td>{formatDate(deck.createdAt)}</td>
                      <td>
                        <button className="btn" onClick={() => removeItem(`/api/decks/${deck.id}`)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </section>
  );
}
