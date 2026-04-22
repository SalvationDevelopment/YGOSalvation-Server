"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ManagementPageShell from "@/components/management/management-page-shell";
import PaginationControls from "@/components/management/pagination-controls";

const PAGE_SIZE = 10;

/**
 * Renders the News Add Form component and returns the UI used by the news management page view.
 * @param {Object} props The props object supplies the structured input used by the news management page module, including the `onCreate` property.
 * @param {Function} props.onCreate The `onCreate` property supplies structured input used by the news management page module.
 * @returns {React.ReactNode} Returns the rendered UI used by the news management page view.
 */
function NewsAddForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");

      /**
   * Executes the submit helper used by the news management page module.
   * @param {Object} event The event event provides the browser event data used by the news management page module.
   * @returns {Promise<void>} Resolves when the news management page operation completes.
   */
  async function submit(event) {
    event.preventDefault();
    await onCreate({ title, slug, body });
    setTitle("");
    setSlug("");
    setBody("");
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <h2>Add News Post</h2>
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" required />
      <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="slug-value" required />
      <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Body" rows={10} required />
      <button className="btn primary" type="submit">Create Post</button>
    </form>
  );
}

/**
 * Renders the News Edit Form component and returns the UI used by the news management page view.
 * @param {Object} props The props object supplies the structured input used by the news management page module, including the `item`, `onCancel`, and `onSave` properties.
 * @param {Object} props.item The `item` property supplies structured input used by the news management page module.
 * @param {Object} props.item.body The `item.body` property supplies structured input used by the news management page module.
 * @param {string} props.item.id The `item.id` property supplies structured input used by the news management page module.
 * @param {string} props.item.slug The `item.slug` property supplies structured input used by the news management page module.
 * @param {string} props.item.title The `item.title` property supplies structured input used by the news management page module.
 * @param {Function} props.onCancel The `onCancel` property supplies structured input used by the news management page module.
 * @param {Function} props.onSave The `onSave` property supplies structured input used by the news management page module.
 * @returns {React.ReactNode} Returns the rendered UI used by the news management page view.
 */
function NewsEditForm({ item, onSave, onCancel }) {
  const [title, setTitle] = useState(item.title);
  const [slug, setSlug] = useState(item.slug);
  const [body, setBody] = useState(item.body);

      /**
   * Executes the submit helper used by the news management page module.
   * @param {Object} event The event event provides the browser event data used by the news management page module.
   * @returns {Promise<void>} Resolves when the news management page operation completes.
   */
  async function submit(event) {
    event.preventDefault();
    await onSave(item.id, { title, slug, body });
  }

  return (
    <form className="inline-edit form-stack" onSubmit={submit}>
      <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      <input value={slug} onChange={(event) => setSlug(event.target.value)} required />
      <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={8} required />
      <div className="inline-actions">
        <button className="btn primary" type="submit">Save</button>
        <button className="btn" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

/**
 * Renders the News Management Page component and returns the UI used by the news management page view.
 * @returns {React.ReactNode} Returns the rendered UI used by the news management page view.
 */
export default function NewsManagementPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [searchField, setSearchField] = useState("title");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState("");

      /**
   * Executes the request helper used by the news management page module.
   * @param {string} path The path value provides an input used by the news management page module.
   * @param {Object} options The options value provides an input used by the news management page module.
   * @returns {Promise<Object>} Resolves with the value produced by the news management page module.
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
      const data = await request("/api/news?page=1&pageSize=200");
      setError("");
      setItems(data.posts || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadItems();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [loadItems]);

  const filtered = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return items;
    }

    return items.filter((item) => String(item[searchField] || "").toLowerCase().includes(query));
  }, [items, searchField, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

      /**
   * Creates item used by the news management page module.
   * @param {Object} payload The payload value provides an input used by the news management page module.
   * @returns {Promise<void>} Resolves when the news management page operation completes.
   */
  async function createItem(payload) {
    try {
      await request("/api/news", {
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
   * Saves item used by the news management page module.
   * @param {string} id The id value provides an input used by the news management page module.
   * @param {Object} payload The payload value provides an input used by the news management page module.
   * @returns {Promise<void>} Resolves when the news management page operation completes.
   */
  async function saveItem(id, payload) {
    try {
      await request(`/api/news/${id}`, {
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
   * Deletes item used by the news management page module.
   * @param {string} id The id value provides an input used by the news management page module.
   * @returns {Promise<void>} Resolves when the news management page operation completes.
   */
  async function deleteItem(id) {
    try {
      await request(`/api/news/${id}`, { method: "DELETE" });
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <ManagementPageShell
      title="News"
      description="Simple blog posts for the public news page."
      searchField={searchField}
      onSearchFieldChange={(value) => {
        setSearchField(value);
        setPage(1);
      }}
      searchFieldOptions={[
        { value: "title", label: "Title" },
        { value: "slug", label: "Slug" },
        { value: "body", label: "Body" }
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
          <NewsAddForm onCreate={createItem} />
        </article>

        <article className="panel soft-panel">
          <h2>All Posts ({filtered.length})</h2>
          <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          <ul className="simple-list">
            {visibleItems.map((item) => (
              <li key={item.id}>
                {editingId === item.id ? (
                  <NewsEditForm item={item} onSave={saveItem} onCancel={() => setEditingId("")} />
                ) : (
                  <>
                    <span>
                      <strong>{item.title}</strong>
                      <br />
                      <small>{item.slug}</small>
                    </span>
                    <div className="inline-actions">
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
