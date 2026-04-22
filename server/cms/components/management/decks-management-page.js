"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ManagementPageShell from "@/components/management/management-page-shell";
import PaginationControls from "@/components/management/pagination-controls";

const PAGE_SIZE = 10;

/**
 * Parses card list used by the decks management page module.
 * @param {string} value The value value provides an input used by the decks management page module.
 * @returns {Array} Returns the value produced by the decks management page module.
 */
function parseCardList(value) {
  return value
    .split(",")
    .map((entry) => Number(entry.trim()))
    .filter(Number.isFinite);
}

/**
 * Renders the Deck Add Form component and returns the UI used by the decks management page view.
 * @param {Object} props The props object supplies the structured input used by the decks management page module, including the `onCreate` property.
 * @param {Function} props.onCreate The `onCreate` property supplies structured input used by the decks management page module.
 * @returns {React.ReactNode} Returns the rendered UI used by the decks management page view.
 */
function DeckAddForm({ onCreate }) {
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [main, setMain] = useState("");
  const [extra, setExtra] = useState("");
  const [side, setSide] = useState("");

      /**
   * Executes the submit helper used by the decks management page module.
   * @param {Object} event The event event provides the browser event data used by the decks management page module.
   * @returns {Promise<void>} Resolves when the decks management page operation completes.
   */
  async function submit(event) {
    event.preventDefault();
    await onCreate({
      name,
      owner,
      main: parseCardList(main),
      extra: parseCardList(extra),
      side: parseCardList(side)
    });
    setName("");
    setOwner("");
    setMain("");
    setExtra("");
    setSide("");
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <h2>Add Deck</h2>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Deck Name" required />
      <input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Owner Username" required />
      <input value={main} onChange={(event) => setMain(event.target.value)} placeholder="Main card IDs (comma separated)" />
      <input value={extra} onChange={(event) => setExtra(event.target.value)} placeholder="Extra card IDs (comma separated)" />
      <input value={side} onChange={(event) => setSide(event.target.value)} placeholder="Side card IDs (comma separated)" />
      <button className="btn primary" type="submit">Create Deck</button>
    </form>
  );
}

/**
 * Renders the Deck Edit Form component and returns the UI used by the decks management page view.
 * @param {Object} props The props object supplies the structured input used by the decks management page module, including the `deck`, `onCancel`, and `onSave` properties.
 * @param {Object} props.deck The `deck` property supplies structured input used by the decks management page module.
 * @param {Array} props.deck.extra The `deck.extra` property supplies structured input used by the decks management page module.
 * @param {string} props.deck.id The `deck.id` property supplies structured input used by the decks management page module.
 * @param {Array} props.deck.main The `deck.main` property supplies structured input used by the decks management page module.
 * @param {string} props.deck.name The `deck.name` property supplies structured input used by the decks management page module.
 * @param {string} props.deck.owner The `deck.owner` property supplies structured input used by the decks management page module.
 * @param {(number|Array)} props.deck.side The `deck.side` property supplies structured input used by the decks management page module.
 * @param {Function} props.onCancel The `onCancel` property supplies structured input used by the decks management page module.
 * @param {Function} props.onSave The `onSave` property supplies structured input used by the decks management page module.
 * @returns {React.ReactNode} Returns the rendered UI used by the decks management page view.
 */
function DeckEditForm({ deck, onSave, onCancel }) {
  const [name, setName] = useState(deck.name);
  const [owner, setOwner] = useState(deck.owner);
  const [main, setMain] = useState(deck.main.join(","));
  const [extra, setExtra] = useState(deck.extra.join(","));
  const [side, setSide] = useState(deck.side.join(","));

      /**
   * Executes the submit helper used by the decks management page module.
   * @param {Object} event The event event provides the browser event data used by the decks management page module.
   * @returns {Promise<void>} Resolves when the decks management page operation completes.
   */
  async function submit(event) {
    event.preventDefault();
    await onSave(deck.id, {
      name,
      owner,
      main: parseCardList(main),
      extra: parseCardList(extra),
      side: parseCardList(side)
    });
  }

  return (
    <form className="inline-edit" onSubmit={submit}>
      <input value={name} onChange={(event) => setName(event.target.value)} required />
      <input value={owner} onChange={(event) => setOwner(event.target.value)} required />
      <input value={main} onChange={(event) => setMain(event.target.value)} />
      <input value={extra} onChange={(event) => setExtra(event.target.value)} />
      <input value={side} onChange={(event) => setSide(event.target.value)} />
      <div className="inline-actions">
        <button className="btn primary" type="submit">Save</button>
        <button className="btn" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

/**
 * Renders the Decks Management Page component and returns the UI used by the decks management page view.
 * @returns {React.ReactNode} Returns the rendered UI used by the decks management page view.
 */
export default function DecksManagementPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState("");

      /**
   * Executes the request helper used by the decks management page module.
   * @param {string} path The path value provides an input used by the decks management page module.
   * @param {Object} options The options value provides an input used by the decks management page module.
   * @returns {Promise<Object>} Resolves with the value produced by the decks management page module.
   */
  async function request(path, options = {}) {
    const response = await fetch(path, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Request failed.");
    }

    return data;
  }

  const loadItems = useCallback(async () => {
    try {
      setError("");
      const data = await request("/api/decks");
      setItems(data.decks || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems();
  }, [loadItems]);

  const filtered = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => {
      if (["main", "extra", "side"].includes(searchField)) {
        return item[searchField].join(",").toLowerCase().includes(query);
      }
      return String(item[searchField] || "").toLowerCase().includes(query);
    });
  }, [items, searchField, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

      /**
   * Creates item used by the decks management page module.
   * @param {Object} payload The payload value provides an input used by the decks management page module.
   * @returns {Promise<void>} Resolves when the decks management page operation completes.
   */
  async function createItem(payload) {
    try {
      await request("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

      /**
   * Saves item used by the decks management page module.
   * @param {string} id The id value provides an input used by the decks management page module.
   * @param {Object} payload The payload value provides an input used by the decks management page module.
   * @returns {Promise<void>} Resolves when the decks management page operation completes.
   */
  async function saveItem(id, payload) {
    try {
      await request(`/api/decks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setEditingId("");
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

      /**
   * Deletes item used by the decks management page module.
   * @param {string} id The id value provides an input used by the decks management page module.
   * @returns {Promise<void>} Resolves when the decks management page operation completes.
   */
  async function deleteItem(id) {
    try {
      await request(`/api/decks/${id}`, { method: "DELETE" });
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <ManagementPageShell
      title="Decks"
      description="Manage deck records by owner and card ids."
      searchField={searchField}
      onSearchFieldChange={(value) => {
        setSearchField(value);
        setPage(1);
      }}
      searchFieldOptions={[
        { value: "name", label: "Deck Name" },
        { value: "owner", label: "Owner" },
        { value: "main", label: "Main" },
        { value: "extra", label: "Extra" },
        { value: "side", label: "Side" }
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
          <DeckAddForm onCreate={createItem} />
        </article>

        <article className="panel soft-panel">
          <h2>All Decks ({filtered.length})</h2>
          <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Owner</th>
                  <th>Main</th>
                  <th>Extra</th>
                  <th>Side</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((deck) => (
                  <tr key={deck.id}>
                    <td colSpan={6}>
                      {editingId === deck.id ? (
                        <DeckEditForm deck={deck} onSave={saveItem} onCancel={() => setEditingId("")} />
                      ) : (
                        <div className="deck-row">
                          <span>{deck.name}</span>
                          <span>{deck.owner}</span>
                          <span>{deck.main.length}</span>
                          <span>{deck.extra.length}</span>
                          <span>{deck.side.length}</span>
                          <div className="inline-actions">
                            <button className="btn" onClick={() => setEditingId(deck.id)}>Edit</button>
                            <button className="btn" onClick={() => deleteItem(deck.id)}>Delete</button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </ManagementPageShell>
  );
}
