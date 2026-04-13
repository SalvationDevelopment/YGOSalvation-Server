import assert from "node:assert/strict";
import test from "node:test";
import TournamentsManagementPage from "../../../server/cms/components/management/tournaments-management-page";
import { click, render, setupDom, textContent, waitFor } from "./dom-test-utils";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("TournamentsManagementPage loads tournaments and exposes tournament admin actions", async () => {
  const dom = setupDom();
  const originalFetch = globalThis.fetch;
  const requests = [];
  const startedAt = new Date("2026-03-25T15:00:00.000Z");
  const tournaments = [
    {
      id: "tour-1",
      name: "Spring Cup",
      ownerUsername: "admin",
      league: "Ranked League",
      format: "Swiss",
      status: "Registration Open",
      preregistered: 8,
      capacity: 16,
      description: "A test event",
      leagueId: "league-1",
      ranked: true,
      visibility: "public",
      rounds: 4,
      graceMinutes: 15,
      checkInRequired: true,
      reminderOffsets: ["24h"],
      startAt: startedAt,
      currentRoundNumber: 1,
      currentRoundLabel: "Round 1",
      pairings: [
        {
          pairingId: "m1",
          round: "Round 1",
          table: 1,
          playerA: "Alice",
          playerB: "Bob",
          result: "pending",
          playerAJoinedAt: null,
          playerBJoinedAt: null
        },
        {
          pairingId: "m2",
          round: "Round 1",
          table: 2,
          playerA: "Charlie",
          playerB: "Dana",
          result: "playerA",
          playerAJoinedAt: null,
          playerBJoinedAt: null
        }
      ],
      bracketEdits: []
    }
  ];

  globalThis.fetch = async (path, options = {}) => {
    const method = options.method || "GET";
    requests.push({ path, method, body: options.body || null });

    if (path === "/api/tournaments" && method === "GET") {
      return jsonResponse({ success: true, tournaments: tournaments.map((item) => ({ ...item })) });
    }

    if (path === "/api/leagues" && method === "GET") {
      return jsonResponse({ success: true, leagues: [{ id: "league-1", slug: "ranked-league", name: "Ranked League" }] });
    }

    if (String(path).startsWith("/api/tournaments/") && method === "PATCH") {
      const id = String(path).split("/")[3];
      const payload = JSON.parse(options.body);
      const index = tournaments.findIndex((item) => item.id === id);
      tournaments[index] = { ...tournaments[index], ...payload };
      return jsonResponse({ success: true });
    }

    if (String(path).endsWith("/open-registration") || String(path).endsWith("/close-registration") || String(path).endsWith("/force-start") || String(path).endsWith("/next-round") || String(path).endsWith("/cancel")) {
      return jsonResponse({ success: true });
    }

    if (String(path).includes("/pairings/swap") || String(path).includes("/matches/") && String(path).endsWith("/reopen")) {
      return jsonResponse({ success: true });
    }

    throw new Error(`Unexpected request: ${method} ${path}`);
  };

  try {
    const container = await render(<TournamentsManagementPage />);

    await waitFor(() => {
      assert.match(textContent(container), /All Tournaments \(1\)/);
      assert.match(textContent(container), /Spring Cup/);
    });

    const editButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Edit");
    assert.ok(editButton);
    await click(editButton);

    await waitFor(() => {
      assert.ok(container.querySelector(".inline-edit"));
    });

    const actionButtons = Array.from(container.querySelectorAll(".inline-edit button")).map((button) => button.textContent);
    assert.ok(actionButtons.includes("Open Registration"));
    assert.ok(actionButtons.includes("Close Registration"));
    assert.ok(actionButtons.includes("Force Start"));
    assert.ok(actionButtons.includes("Next Round"));
    assert.ok(actionButtons.includes("Cancel Tournament"));

    const cancelButton = Array.from(container.querySelectorAll(".inline-edit button")).find((button) => button.textContent === "Cancel");
    assert.ok(cancelButton);
    await click(cancelButton);

    await waitFor(() => {
      assert.doesNotMatch(textContent(container), /No untouched current-round pairing slots are available for staff swap edits\./);
    });

    assert.ok(requests.some((request) => request.path === "/api/tournaments" && request.method === "GET"));
    assert.ok(requests.some((request) => request.path === "/api/leagues" && request.method === "GET"));
  } finally {
    globalThis.fetch = originalFetch;
    await dom.cleanup();
  }
});
// Run with: npm run test:component
