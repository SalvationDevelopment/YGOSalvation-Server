"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ManagementPageShell from "@/components/management/management-page-shell";
import PaginationControls from "@/components/management/pagination-controls";

const PAGE_SIZE = 10;

/**
 * Formats date used by the contact messages management page module.
 * @param {string} value The value value provides an input used by the contact messages management page module.
 * @returns {string} Returns the value produced by the contact messages management page module.
 */
function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

/**
 * Renders the Contact Messages Management Page component and returns the UI used by the contact messages management page view.
 * @returns {React.ReactNode} Returns the rendered UI used by the contact messages management page view.
 */
export default function ContactMessagesManagementPage() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [searchField, setSearchField] = useState("classification");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);

      /**
   * Executes the request helper used by the contact messages management page module.
   * @param {string} path The path value provides an input used by the contact messages management page module.
   * @param {Object} options The options value provides an input used by the contact messages management page module.
   * @returns {Promise<Object>} Resolves with the value produced by the contact messages management page module.
   */
  async function request(path, options = {}) {
    const response = await fetch(path, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Request failed.");
    }

    return data;
  }

  const loadMessages = useCallback(async () => {
    try {
      const data = await request("/api/contact-messages");
      setError("");
      setMessages(data.messages || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadMessages();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [loadMessages]);

      /**
   * Updates status used by the contact messages management page module.
   * @param {string} id The id value provides an input used by the contact messages management page module.
   * @param {string} status The status value provides an input used by the contact messages management page module.
   * @returns {Promise<void>} Resolves when the contact messages management page operation completes.
   */
  async function updateStatus(id, status) {
    try {
      setError("");
      await request(`/api/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      await loadMessages();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const filteredMessages = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return messages;
    return messages.filter((message) => String(message[searchField] || "").toLowerCase().includes(query));
  }, [messages, searchField, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleMessages = filteredMessages.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <ManagementPageShell
      title="Contact"
      description="Incoming contact form messages from the public site."
      searchField={searchField}
      onSearchFieldChange={(value) => {
        setSearchField(value);
        setPage(1);
      }}
      searchFieldOptions={[
        { value: "classification", label: "Type" },
        { value: "name", label: "Name" },
        { value: "email", label: "Email" },
        { value: "status", label: "Status" }
      ]}
      searchValue={searchValue}
      onSearchValueChange={(value) => {
        setSearchValue(value);
        setPage(1);
      }}
    >
      {error ? <p className="error">{error}</p> : null}
      <article className="panel soft-panel">
        <h2>Messages ({filteredMessages.length})</h2>
        <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        <ul className="simple-list">
          {visibleMessages.map((message) => (
            <li key={message.id} className="stack-row">
              <div>
                <strong>{message.subject || "(No subject)"} </strong>
                <span> [{message.classification}]</span>
                <p>{message.name} ({message.email})</p>
                {message.username ? <p>User: {message.username}</p> : null}
                <p>Status: {message.status}</p>
                <p>{formatDate(message.createdAt)}</p>
                <p>{message.message}</p>
              </div>
              <div className="inline-actions">
                <button className="btn" onClick={() => updateStatus(message.id, "new")}>Mark New</button>
                <button className="btn" onClick={() => updateStatus(message.id, "reviewed")}>Reviewed</button>
                <button className="btn" onClick={() => updateStatus(message.id, "closed")}>Closed</button>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </ManagementPageShell>
  );
}
