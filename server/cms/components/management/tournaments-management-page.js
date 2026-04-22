"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ManagementPageShell from "@/components/management/management-page-shell";
import PaginationControls from "@/components/management/pagination-controls";

const PAGE_SIZE = 10;

/**
 * Executes the to date time local helper used by the tournaments management page module.
 * @param {string} value The value value provides an input used by the tournaments management page module.
 * @returns {string} Returns the value produced by the tournaments management page module.
 */
function toDateTimeLocal(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Builds swap options used by the tournaments management page module.
 * @param {Object} item The item object supplies the structured input used by the tournaments management page module, including the `currentRoundLabel`, `currentRoundNumber`, and `pairings` properties.
 * @param {string} item.currentRoundLabel The `currentRoundLabel` property supplies structured input used by the tournaments management page module.
 * @param {number} item.currentRoundNumber The `currentRoundNumber` property supplies structured input used by the tournaments management page module.
 * @param {Array} item.pairings The `pairings` property supplies structured input used by the tournaments management page module.
 * @returns {{value: string, label: string}[]} Returns the value produced by the tournaments management page module.
 */
function buildSwapOptions(item) {
  const currentRoundLabel = item.currentRoundLabel || `Round ${item.currentRoundNumber || 1}`;
  return (item.pairings || [])
    .filter((pairing) => {
      if (pairing.round !== currentRoundLabel || pairing.result !== "pending") {
        return false;
      }
      if (pairing.playerA === "BYE" || pairing.playerB === "BYE") {
        return false;
      }
      return !pairing.startedAt && !pairing.completedAt && !pairing.playerAReady && !pairing.playerBReady;
    })
    .flatMap((pairing) => ([
      {
        value: `${pairing.pairingId}::playerA`,
        label: `${pairing.round} Table ${pairing.table} - ${pairing.playerA} (A)`
      },
      {
        value: `${pairing.pairingId}::playerB`,
        label: `${pairing.round} Table ${pairing.table} - ${pairing.playerB} (B)`
      }
    ]));
}

/**
 * Parses swap selection used by the tournaments management page module.
 * @param {(string|Array)} value The value value provides an input used by the tournaments management page module.
 * @returns {{matchId: string, slot: string}} Returns the value produced by the tournaments management page module.
 */
function parseSwapSelection(value) {
  const separatorIndex = String(value || "").lastIndexOf("::");
  if (separatorIndex < 0) {
    return { matchId: "", slot: "" };
  }

  return {
    matchId: value.slice(0, separatorIndex),
    slot: value.slice(separatorIndex + 2)
  };
}

/**
 * Renders the Bracket Swap Form component and returns the UI used by the tournaments management page view.
 * @param {Object} props The props object supplies the structured input used by the tournaments management page module, including the `item` and `onSwap` properties.
 * @param {Object} props.item The `item` property supplies structured input used by the tournaments management page module.
 * @param {string} props.item.id The `item.id` property supplies structured input used by the tournaments management page module.
 * @param {(id: string, payload: {leftMatchId: string, leftSlot: string, rightMatchId: string, rightSlot: string, reason: string}) => Promise<void>} props.onSwap The `onSwap` property supplies structured input used by the tournaments management page module.
 * @returns {React.ReactNode} Returns the rendered UI used by the tournaments management page view.
 */
function BracketSwapForm({ item, onSwap }) {
  const swapOptions = useMemo(() => buildSwapOptions(item), [item]);
  const [leftSelection, setLeftSelection] = useState("");
  const [rightSelection, setRightSelection] = useState("");
  const [reason, setReason] = useState("");

  if (swapOptions.length < 2) {
    return (
      <p className="muted small">
        No untouched current-round pairing slots are available for staff swap edits.
      </p>
    );
  }

      /**
   * Executes the submit helper used by the tournaments management page module.
   * @param {Object} event The event event provides the browser event data used by the tournaments management page module.
   * @returns {Promise<void>} Resolves when the tournaments management page operation completes.
   */
  async function submit(event) {
    event.preventDefault();
    const left = parseSwapSelection(leftSelection);
    const right = parseSwapSelection(rightSelection);
    await onSwap(item.id, {
      leftMatchId: left.matchId,
      leftSlot: left.slot,
      rightMatchId: right.matchId,
      rightSlot: right.slot,
      reason
    });
    setReason("");
  }

  return (
    <form className="inline-edit form-stack" onSubmit={submit}>
      <select value={leftSelection} onChange={(event) => setLeftSelection(event.target.value)} required>
        <option value="">Select first slot</option>
        {swapOptions.map((option) => (
          <option key={`left-${option.value}`} value={option.value}>{option.label}</option>
        ))}
      </select>
      <select value={rightSelection} onChange={(event) => setRightSelection(event.target.value)} required>
        <option value="">Select second slot</option>
        {swapOptions.map((option) => (
          <option key={`right-${option.value}`} value={option.value}>{option.label}</option>
        ))}
      </select>
      <input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Reason for swap (optional)"
        maxLength={280}
      />
      <button
        className="btn"
        type="submit"
        disabled={!leftSelection || !rightSelection || leftSelection === rightSelection}
      >
        Swap Pairing Slots
      </button>
    </form>
  );
}

/**
 * Builds reopen options used by the tournaments management page module.
 * @param {Object} item The item object supplies the structured input used by the tournaments management page module, including the `currentRoundLabel`, `currentRoundNumber`, and `pairings` properties.
 * @param {string} item.currentRoundLabel The `currentRoundLabel` property supplies structured input used by the tournaments management page module.
 * @param {number} item.currentRoundNumber The `currentRoundNumber` property supplies structured input used by the tournaments management page module.
 * @param {Array} item.pairings The `pairings` property supplies structured input used by the tournaments management page module.
 * @returns {{value: string, label: string}[]} Returns the value produced by the tournaments management page module.
 */
function buildReopenOptions(item) {
  const currentRoundLabel = item.currentRoundLabel || `Round ${item.currentRoundNumber || 1}`;
  return (item.pairings || [])
    .filter((pairing) => {
      if (pairing.round !== currentRoundLabel || pairing.result === "pending") {
        return false;
      }
      return pairing.playerB !== "BYE" && pairing.result !== "bye";
    })
    .map((pairing) => ({
      value: pairing.pairingId,
      label: `${pairing.round} Table ${pairing.table} - ${pairing.playerA} vs ${pairing.playerB} (${pairing.result})`
    }));
}

/**
 * Renders the Reopen Result Form component and returns the UI used by the tournaments management page view.
 * @param {Object} props The props object supplies the structured input used by the tournaments management page module, including the `item` and `onReopen` properties.
 * @param {Object} props.item The `item` property supplies structured input used by the tournaments management page module.
 * @param {string} props.item.id The `item.id` property supplies structured input used by the tournaments management page module.
 * @param {(id: string, matchId: string, payload: {reason: string}) => Promise<void>} props.onReopen The `onReopen` property supplies structured input used by the tournaments management page module.
 * @returns {React.ReactNode} Returns the rendered UI used by the tournaments management page view.
 */
function ReopenResultForm({ item, onReopen }) {
  const reopenOptions = useMemo(() => buildReopenOptions(item), [item]);
  const [matchId, setMatchId] = useState("");
  const [reason, setReason] = useState("");

  if (!reopenOptions.length) {
    return (
      <p className="muted small">
        No resolved current-round matches are available for reopen.
      </p>
    );
  }

      /**
   * Executes the submit helper used by the tournaments management page module.
   * @param {Object} event The event event provides the browser event data used by the tournaments management page module.
   * @returns {Promise<void>} Resolves when the tournaments management page operation completes.
   */
  async function submit(event) {
    event.preventDefault();
    await onReopen(item.id, matchId, { reason });
    setReason("");
  }

  return (
    <form className="inline-edit form-stack" onSubmit={submit}>
      <select value={matchId} onChange={(event) => setMatchId(event.target.value)} required>
        <option value="">Select match</option>
        {reopenOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Reason for reopening (optional)"
        maxLength={280}
      />
      <button className="btn" type="submit" disabled={!matchId}>
        Reopen Match Result
      </button>
    </form>
  );
}

/**
 * Renders the Tournament Edit Form component and returns the UI used by the tournaments management page view.
 * @param {Object} props The props object supplies the structured input used by the tournaments management page module, including the `item`, `leagues`, `leagues[]`, `onAction`, `onCancel`, `onReopenMatch`, `onSave`, and `onSwapPairings` properties.
 * @param {Object} props.item The `item` property supplies structured input used by the tournaments management page module.
 * @param {Array} props.item.bracketEdits The `item.bracketEdits` property supplies structured input used by the tournaments management page module.
 * @param {number} props.item.bracketEdits.length The `item.bracketEdits.length` property supplies structured input used by the tournaments management page module.
 * @param {number} props.item.capacity The `item.capacity` property supplies structured input used by the tournaments management page module.
 * @param {boolean} props.item.checkInRequired The `item.checkInRequired` property supplies structured input used by the tournaments management page module.
 * @param {string} props.item.description The `item.description` property supplies structured input used by the tournaments management page module.
 * @param {string} props.item.format The `item.format` property supplies structured input used by the tournaments management page module.
 * @param {number} props.item.graceMinutes The `item.graceMinutes` property supplies structured input used by the tournaments management page module.
 * @param {string} props.item.id The `item.id` property supplies structured input used by the tournaments management page module.
 * @param {string} props.item.leagueId The `item.leagueId` property supplies structured input used by the tournaments management page module.
 * @param {string} props.item.name The `item.name` property supplies structured input used by the tournaments management page module.
 * @param {boolean} props.item.ranked The `item.ranked` property supplies structured input used by the tournaments management page module.
 * @param {Array} props.item.reminderOffsets The `item.reminderOffsets` property supplies structured input used by the tournaments management page module.
 * @param {number} props.item.rounds The `item.rounds` property supplies structured input used by the tournaments management page module.
 * @param {Date} props.item.startAt The `item.startAt` property supplies structured input used by the tournaments management page module.
 * @param {string} props.item.visibility The `item.visibility` property supplies structured input used by the tournaments management page module.
 * @param {Array} props.leagues The `leagues` property supplies structured input used by the tournaments management page module.
 * @param {string} props.leagues[].id The `leagues[].id` property supplies structured input used by the tournaments management page module.
 * @param {string} props.leagues[].name The `leagues[].name` property supplies structured input used by the tournaments management page module.
 * @param {string} props.leagues[].slug The `leagues[].slug` property supplies structured input used by the tournaments management page module.
 * @param {(id: string, action: string) => Promise<void>} props.onAction The `onAction` property supplies structured input used by the tournaments management page module.
 * @param {() => void} props.onCancel The `onCancel` property supplies structured input used by the tournaments management page module.
 * @param {(id: string, matchId: string, payload: {reason: string}) => Promise<void>} props.onReopenMatch The `onReopenMatch` property supplies structured input used by the tournaments management page module.
 * @param {(id: string, payload: {name: string, description: string, leagueId: string, format: string, visibility: string, capacity: number, scheduledStart: string, gracePeriodMinutes: number, configuredRoundCount: number, checkInRequired: boolean, ranked: boolean, reminderOffsets: string[]}) => Promise<void>} props.onSave The `onSave` property supplies structured input used by the tournaments management page module.
 * @param {(id: string, payload: {leftMatchId: string, leftSlot: string, rightMatchId: string, rightSlot: string, reason: string}) => Promise<void>} props.onSwapPairings The `onSwapPairings` property supplies structured input used by the tournaments management page module.
 * @returns {React.ReactNode} Returns the rendered UI used by the tournaments management page view.
 */
function TournamentEditForm({ item, leagues, onSave, onCancel, onAction, onSwapPairings, onReopenMatch }) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || "");
  const [leagueId, setLeagueId] = useState(item.leagueId || "");
  const [format, setFormat] = useState(item.format || "Swiss");
  const [visibility, setVisibility] = useState(item.visibility || "public");
  const [capacity, setCapacity] = useState(String(item.capacity || 4));
  const [scheduledStart, setScheduledStart] = useState(toDateTimeLocal(item.startAt));
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(String(item.graceMinutes || 10));
  const [configuredRoundCount, setConfiguredRoundCount] = useState(String(item.rounds || 4));
  const [checkInRequired, setCheckInRequired] = useState(Boolean(item.checkInRequired));
  const [ranked, setRanked] = useState(Boolean(item.ranked));
  const [reminderOffsets, setReminderOffsets] = useState((item.reminderOffsets || []).join(", "));

      /**
   * Executes the submit helper used by the tournaments management page module.
   * @param {Object} event The event event provides the browser event data used by the tournaments management page module.
   * @returns {Promise<void>} Resolves when the tournaments management page operation completes.
   */
  async function submit(event) {
    event.preventDefault();
    await onSave(item.id, {
      name,
      description,
      leagueId,
      format,
      visibility,
      capacity: Number(capacity),
      scheduledStart: new Date(scheduledStart).toISOString(),
      gracePeriodMinutes: Number(gracePeriodMinutes),
      configuredRoundCount: Number(configuredRoundCount),
      checkInRequired,
      ranked,
      reminderOffsets: reminderOffsets
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    });
  }

  return (
    <div className="inline-edit form-stack">
      <form className="form-stack" onSubmit={submit}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tournament name" required />
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} placeholder="Description" required />
        <select value={leagueId} onChange={(event) => setLeagueId(event.target.value)} required>
          <option value="">Select league</option>
          {leagues.map((league) => (
            <option key={league.id} value={league.slug}>{league.name}</option>
          ))}
        </select>
        <select value={format} onChange={(event) => setFormat(event.target.value)}>
          <option value="Swiss">Swiss</option>
          <option value="Single Elimination">Single Elimination</option>
        </select>
        <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
          <option value="public">public</option>
          <option value="unlisted">unlisted</option>
        </select>
        <input type="number" min="4" max="64" value={capacity} onChange={(event) => setCapacity(event.target.value)} placeholder="Capacity" required />
        <input type="datetime-local" value={scheduledStart} onChange={(event) => setScheduledStart(event.target.value)} required />
        <input type="number" min="0" max="30" value={gracePeriodMinutes} onChange={(event) => setGracePeriodMinutes(event.target.value)} placeholder="Grace period minutes" required />
        <input type="number" min="1" max="7" value={configuredRoundCount} onChange={(event) => setConfiguredRoundCount(event.target.value)} placeholder="Configured rounds" required />
        <input value={reminderOffsets} onChange={(event) => setReminderOffsets(event.target.value)} placeholder="24h, 4h, 30m" />
        <label>
          Check-in required
          <input type="checkbox" checked={checkInRequired} onChange={(event) => setCheckInRequired(event.target.checked)} />
        </label>
        <label>
          Ranked
          <input type="checkbox" checked={ranked} onChange={(event) => setRanked(event.target.checked)} />
        </label>
        <div className="inline-actions">
          <button className="btn primary" type="submit">Save</button>
          <button className="btn" type="button" onClick={onCancel}>Cancel</button>
        </div>
        <div className="inline-actions">
          <button className="btn" type="button" onClick={() => onAction(item.id, "open-registration")}>Open Registration</button>
          <button className="btn" type="button" onClick={() => onAction(item.id, "close-registration")}>Close Registration</button>
          <button className="btn" type="button" onClick={() => onAction(item.id, "force-start")}>Force Start</button>
          <button className="btn" type="button" onClick={() => onAction(item.id, "next-round")}>Next Round</button>
          <button className="btn" type="button" onClick={() => onAction(item.id, "cancel")}>Cancel Tournament</button>
        </div>
      </form>
      <div className="form-stack">
        <h3>Manual Pairing Swap</h3>
        <BracketSwapForm item={item} onSwap={onSwapPairings} />
        <h3>Reopen Match Result</h3>
        <ReopenResultForm item={item} onReopen={onReopenMatch} />
        {item.bracketEdits?.length ? (
          <ul className="simple-list">
            {item.bracketEdits.slice(-5).reverse().map((entry, index) => (
              <li key={`${entry.createdAt || "swap"}-${index}`}>
                <span>
                  <strong>{entry.action}</strong>
                  <br />
                  <small>
                    {entry.actorUsername || "staff"} | {entry.reason || "No reason provided"}
                  </small>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted small">No manual bracket edits recorded yet.</p>
        )}
      </div>
    </div>
  );
}

/**
 * Renders the Tournaments Management Page component and returns the UI used by the tournaments management page view.
 * @returns {React.ReactNode} Returns the rendered UI used by the tournaments management page view.
 */
export default function TournamentsManagementPage() {
  const [items, setItems] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [error, setError] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState("");

      /**
   * Executes the request helper used by the tournaments management page module.
   * @param {string} path The path value provides an input used by the tournaments management page module.
   * @param {RequestInit} options The options value provides an input used by the tournaments management page module.
   * @returns {Promise<Object>} Resolves with the value produced by the tournaments management page module.
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
      const [tournamentData, leagueData] = await Promise.all([
        request("/api/tournaments"),
        request("/api/leagues"),
      ]);
      setError("");
      setItems(tournamentData.tournaments || []);
      setLeagues(leagueData.leagues || []);
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
   * Saves item used by the tournaments management page module.
   * @param {string} id The id value provides an input used by the tournaments management page module.
   * @param {{name: string, description: string, leagueId: string, format: string, visibility: string, capacity: number, scheduledStart: string, gracePeriodMinutes: number, configuredRoundCount: number, checkInRequired: boolean, ranked: boolean, reminderOffsets: string[]}} payload The payload value provides an input used by the tournaments management page module.
   * @returns {Promise<void>} Resolves when the tournaments management page operation completes.
   */
  async function saveItem(id, payload) {
    try {
      setError("");
      await request(`/api/tournaments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setEditingId("");
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

      /**
   * Runs action used by the tournaments management page module.
   * @param {string} id The id value provides an input used by the tournaments management page module.
   * @param {string} action The action value provides an input used by the tournaments management page module.
   * @returns {Promise<void>} Resolves when the tournaments management page operation completes.
   */
  async function runAction(id, action) {
    try {
      setError("");
      await request(`/api/tournaments/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

      /**
   * Swaps pairings used by the tournaments management page module.
   * @param {string} id The id value provides an input used by the tournaments management page module.
   * @param {{leftMatchId: string, leftSlot: string, rightMatchId: string, rightSlot: string, reason: string}} payload The payload value provides an input used by the tournaments management page module.
   * @returns {Promise<void>} Resolves when the tournaments management page operation completes.
   */
  async function swapPairings(id, payload) {
    try {
      setError("");
      await request(`/api/tournaments/${id}/pairings/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

      /**
   * Reopens match used by the tournaments management page module.
   * @param {string} id The id value provides an input used by the tournaments management page module.
   * @param {string} matchId The matchId value provides an input used by the tournaments management page module.
   * @param {{reason: string}} payload The payload value provides an input used by the tournaments management page module.
   * @returns {Promise<void>} Resolves when the tournaments management page operation completes.
   */
  async function reopenMatch(id, matchId, payload) {
    try {
      setError("");
      await request(`/api/tournaments/${id}/matches/${matchId}/reopen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <ManagementPageShell
      title="Tournaments"
      description="Review and edit tournament information, then use admin controls to move events through their lifecycle."
      searchField={searchField}
      onSearchFieldChange={(value) => {
        setSearchField(value);
        setPage(1);
      }}
      searchFieldOptions={[
        { value: "name", label: "Tournament Name" },
        { value: "ownerUsername", label: "Owner" },
        { value: "league", label: "League" },
        { value: "status", label: "Status" },
        { value: "format", label: "Format" },
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
          <h2>Tournament Editing Notes</h2>
          <p className="muted small">
            Tournament edits use the existing CMS-backed tournament APIs. Information edits are subject
            to the same lifecycle restrictions as the public owner flow, while the action buttons call
            the admin or owner action routes directly.
          </p>
          <p className="muted small">
            The manual pairing swap flow is staff-only and currently supports untouched current-round
            pairings so bracket repair can begin without direct database edits.
          </p>
        </article>

        <article className="panel soft-panel">
          <h2>All Tournaments ({filtered.length})</h2>
          <PaginationControls page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          <ul className="simple-list">
            {visibleItems.map((item) => (
              <li key={item.id}>
                {editingId === item.id ? (
                  <TournamentEditForm
                    item={item}
                    leagues={leagues}
                    onSave={saveItem}
                    onCancel={() => setEditingId("")}
                    onAction={runAction}
                    onSwapPairings={swapPairings}
                    onReopenMatch={reopenMatch}
                  />
                ) : (
                  <>
                    <span>
                      <strong>{item.name}</strong>
                      <br />
                      <small>
                        {item.ownerUsername} | {item.league} | {item.format} | {item.status} | {item.preregistered}/{item.capacity}
                      </small>
                    </span>
                    <div className="inline-actions">
                      <button className="btn" onClick={() => setEditingId(item.id)}>Edit</button>
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
