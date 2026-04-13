"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ManagementPageShell from "@/components/management/management-page-shell";
import PaginationControls from "@/components/management/pagination-controls";

const PAGE_SIZE = 10;

/**
 * Renders the Cover Add Form component and returns the UI used by the covers management page view.
 * @param {Object} props The props object supplies the structured input used by the covers management page module, including the `onCreate` property.
 * @param {Function} props.onCreate The `onCreate` property supplies structured input used by the covers management page module.
 * @returns {React.ReactNode} Returns the rendered UI used by the covers management page view.
 */
function CoverAddForm({ onCreate }) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

      /**
   * Executes the submit helper used by the covers management page module.
   * @param {Object} event The event event provides the browser event data used by the covers management page module.
   * @returns {Promise<void>} Resolves when the covers management page operation completes.
   */
  async function submit(event) {
    event.preventDefault();
    await onCreate({ name, imageUrl });
    setName("");
    setImageUrl("");
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <h2>Add Cover</h2>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" required />
      <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Image URL" required />
      <button className="btn primary" type="submit">Create Cover</button>
    </form>
  );
}

/**
 * Renders the Cover Edit Form component and returns the UI used by the covers management page view.
 * @param {Object} props The props object supplies the structured input used by the covers management page module, including the `item`, `onCancel`, and `onSave` properties.
 * @param {Object} props.item The `item` property supplies structured input used by the covers management page module.
 * @param {string} props.item.id The `item.id` property supplies structured input used by the covers management page module.
 * @param {string} props.item.imageUrl The `item.imageUrl` property supplies structured input used by the covers management page module.
 * @param {string} props.item.name The `item.name` property supplies structured input used by the covers management page module.
 * @param {Function} props.onCancel The `onCancel` property supplies structured input used by the covers management page module.
 * @param {Function} props.onSave The `onSave` property supplies structured input used by the covers management page module.
 * @returns {React.ReactNode} Returns the rendered UI used by the covers management page view.
 */
function CoverEditForm({ item, onSave, onCancel }) {
  const [name, setName] = useState(item.name);
  const [imageUrl, setImageUrl] = useState(item.imageUrl);

      /**
   * Executes the submit helper used by the covers management page module.
   * @param {Object} event The event event provides the browser event data used by the covers management page module.
   * @returns {Promise<void>} Resolves when the covers management page operation completes.
   */
  async function submit(event) {
    event.preventDefault();
    await onSave(item.id, { name, imageUrl });
  }

  return (
    <form className="inline-edit" onSubmit={submit}>
      <input value={name} onChange={(event) => setName(event.target.value)} required />
      <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} required />
      <div className="inline-actions">
        <button className="btn primary" type="submit">Save</button>
        <button className="btn" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

/**
 * Renders the Covers Management Page component and returns the UI used by the covers management page view.
 * @returns {React.ReactNode} Returns the rendered UI used by the covers management page view.
 */
export default function CoversManagementPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState("");

      /**
   * Executes the request helper used by the covers management page module.
   * @param {string} path The path value provides an input used by the covers management page module.
   * @param {Object} options The options value provides an input used by the covers management page module.
   * @returns {Promise<Object>} Resolves with the value produced by the covers management page module.
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
      const data = await request("/api/covers");
      setItems(data.covers || []);
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
    return items.filter((item) => String(item[searchField] || "").toLowerCase().includes(query));
  }, [items, searchField, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

      /**
   * Creates item used by the covers management page module.
   * @param {Object} payload The payload value provides an input used by the covers management page module.
   * @returns {Promise<void>} Resolves when the covers management page operation completes.
   */
  async function createItem(payload) {
    try {
      await request("/api/covers", {
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
   * Saves item used by the covers management page module.
   * @param {string} id The id value provides an input used by the covers management page module.
   * @param {Object} payload The payload value provides an input used by the covers management page module.
   * @returns {Promise<void>} Resolves when the covers management page operation completes.
   */
  async function saveItem(id, payload) {
    try {
      await request(`/api/covers/${id}`, {
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
   * Deletes item used by the covers management page module.
   * @param {string} id The id value provides an input used by the covers management page module.
   * @returns {Promise<void>} Resolves when the covers management page operation completes.
   */
  async function deleteItem(id) {
    try {
      await request(`/api/covers/${id}`, { method: "DELETE" });
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <ManagementPageShell
      title="Covers"
      description="Public cover image entries."
      searchField={searchField}
      onSearchFieldChange={(value) => {
        setSearchField(value);
        setPage(1);
      }}
      searchFieldOptions={[
        { value: "name", label: "Name" },
        { value: "imageUrl", label: "Image URL" }
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
          <CoverAddForm onCreate={createItem} />
        </article>

        <article className="panel soft-panel">
          <h2>All Covers ({filtered.length})</h2>
          <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          <ul className="simple-list">
            {visibleItems.map((item) => (
              <li key={item.id}>
                {editingId === item.id ? (
                  <CoverEditForm item={item} onSave={saveItem} onCancel={() => setEditingId("")} />
                ) : (
                  <>
                    <span>{item.name}</span>
                    <div className="inline-actions">
                      <a href={item.imageUrl} target="_blank" rel="noreferrer">image</a>
                      <button className="btn" onClick={() => setEditingId(item.id)}>Edit</button>
                      <button className="btn" onClick={() => deleteItem(item.id)}>Delete</button>
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
