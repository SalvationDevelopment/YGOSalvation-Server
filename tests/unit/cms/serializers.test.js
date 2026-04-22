const assert = require("node:assert/strict");
const test = require("node:test");
const { loadCmsModule } = require("./load-module");

test("serializeBackground returns the public background contract", async () => {
  const { serializeBackground } = await loadCmsModule("serializers.js");
  const createdAt = new Date("2026-03-20T12:00:00.000Z");
  const value = serializeBackground({
    _id: { toString: () => "bg-1" },
    name: "Sky Temple",
    imageUrl: "https://img.example/sky.jpg",
    isPublic: true,
    createdAt
  });

  assert.deepEqual(value, {
    id: "bg-1",
    name: "Sky Temple",
    imageUrl: "https://img.example/sky.jpg",
    image: { url: "https://img.example/sky.jpg" },
    isPublic: true,
    createdAt
  });
});

test("serializeNewsPost returns the fixed author and content fields", async () => {
  const { serializeNewsPost } = await loadCmsModule("serializers.js");
  const createdAt = new Date("2026-03-18T09:30:00.000Z");
  const updatedAt = new Date("2026-03-19T10:45:00.000Z");
  const body = { blocks: [{ type: "paragraph", text: "Tournament update" }] };
  const value = serializeNewsPost({
    _id: { toString: () => "news-1" },
    title: "Spring Event Schedule",
    slug: "spring-event-schedule",
    body,
    excerpt: "Spring event details",
    createdAt,
    updatedAt
  });

  assert.deepEqual(value, {
    id: "news-1",
    title: "Spring Event Schedule",
    slug: "spring-event-schedule",
    body,
    excerpt: "Spring event details",
    author: { username: "YGOSalvation" },
    createdAt,
    updatedAt
  });
});

test("serializeCover mirrors the image contract", async () => {
  const { serializeCover } = await loadCmsModule("serializers.js");
  const createdAt = new Date("2026-03-16T14:00:00.000Z");
  const value = serializeCover({
    _id: { toString: () => "cover-1" },
    name: "Featured Banner",
    imageUrl: "https://img.example/banner.jpg",
    isPublic: false,
    createdAt
  });

  assert.deepEqual(value, {
    id: "cover-1",
    name: "Featured Banner",
    imageUrl: "https://img.example/banner.jpg",
    image: { url: "https://img.example/banner.jpg" },
    isPublic: false,
    createdAt
  });
});

test("serializeDeck preserves deck fields without reshaping arrays", async () => {
  const { serializeDeck } = await loadCmsModule("serializers.js");
  const createdAt = new Date("2026-03-15T11:00:00.000Z");
  const updatedAt = new Date("2026-03-17T11:15:00.000Z");
  const main = ["Card A", "Card B"];
  const extra = ["Fusion 1"];
  const side = ["Side 1", "Side 2"];
  const value = serializeDeck({
    _id: { toString: () => "deck-1" },
    name: "Blue-Eyes Core",
    owner: "alice",
    main,
    extra,
    side,
    notes: "Tournament-ready list",
    createdAt,
    updatedAt
  });

  assert.deepEqual(value, {
    id: "deck-1",
    name: "Blue-Eyes Core",
    owner: "alice",
    main,
    extra,
    side,
    notes: "Tournament-ready list",
    createdAt,
    updatedAt
  });
});

test("serializeLeague preserves defaults for optional arrays", async () => {
  const { serializeLeague } = await loadCmsModule("serializers.js");
  const createdAt = new Date("2026-03-20T12:00:00.000Z");
  const updatedAt = new Date("2026-03-21T12:00:00.000Z");
  const roomConfiguration = { bestOf: 3 };
  const value = serializeLeague({
    _id: { toString: () => "league-1" },
    slug: "ranked-swiss",
    name: "Ranked Swiss",
    description: "Primary ranked swiss queue",
    active: true,
    ranked: true,
    visibility: "public",
    roomConfiguration,
    createdAt,
    updatedAt
  });

  assert.deepEqual(value.supportedFormats, []);
  assert.equal(value.roomConfiguration, roomConfiguration);
  assert.equal(value.slug, "ranked-swiss");
});

test("serializeTournament derives viewer-specific and live overview fields", async () => {
  const { serializeTournament } = await loadCmsModule("serializers.js");
  const createdAt = new Date("2026-03-20T12:00:00.000Z");
  const updatedAt = new Date("2026-03-21T12:00:00.000Z");
  const scheduledStartAt = "2026-03-25T16:00:00.000Z";
  const roomRules = { bestOf: 3, format: "advanced" };
  const value = serializeTournament(
    {
      _id: { toString: () => "tour-1" },
      slug: "burning-abyss-cup",
      name: "Burning Abyss Cup",
      description: "Feature event",
      leagueId: "league-1",
      leagueName: "Ranked Swiss",
      format: "Swiss",
      ranked: true,
      capacity: 16,
      status: "Registration Open",
      platformManaged: true,
      ownerUsername: "adminUser",
      scheduledStartAt,
      configuredRoundCount: 4,
      gracePeriodMinutes: 15,
      checkInRequired: true,
      currentRoundNumber: 2,
      reminderOffsets: ["24h", "30m"],
      reminderJobCount: 2,
      pendingReminderCount: 1,
      entrants: [
        { username: "alice", registrationState: "registered" },
        { username: "bob", registrationState: "checked_in" },
        { username: "dropped", registrationState: "dropped" }
      ],
      pairings: [
        {
          round: "Round 2",
          table: 1,
          matchId: "m1",
          playerA: "alice",
          playerB: "bob",
          status: "Dueling",
          result: "pending",
          playerAJoinedAt: createdAt,
          playerBJoinedAt: null
        },
        {
          round: "Round 2",
          table: 2,
          matchId: "m2",
          playerA: "charlie",
          playerB: "dana",
          status: "Waiting For Opponent",
          result: "pending",
          playerAJoinedAt: null,
          playerBJoinedAt: null
        },
        {
          round: "Round 1",
          table: 1,
          matchId: "m0",
          playerA: "eve",
          playerB: "frank",
          status: "Complete",
          result: "playerA"
        }
      ],
      standings: [{ username: "alice", points: 3 }],
      roundsOverview: [{ round: 1, complete: true }],
      viewerAlertCount: 4,
      viewerUnreadAlertCount: 2,
      roomRules,
      visibility: "public",
      bracketEdits: [
        {
          action: "swap",
          actorUsername: "staffUser",
          reason: "Repair pairing",
          details: { from: 1, to: 2 },
          createdAt
        }
      ],
      createdAt,
      updatedAt
    },
    { username: "alice", role: "admin" }
  );

  assert.equal(value.id, "tour-1");
  assert.equal(value.registrationOpen, true);
  assert.equal(value.ownedByMe, false);
  assert.equal(value.registeredByMe, true);
  assert.equal(value.myRegistrationState, "registered");
  assert.equal(value.preregistered, 2);
  assert.equal(value.currentRoundLabel, "Round 2");
  assert.equal(value.liveOverview.liveMatchCount, 1);
  assert.equal(value.liveOverview.waitingMatchCount, 1);
  assert.equal(value.liveOverview.completedMatchCount, 0);
  assert.deepEqual(value.liveOverview.currentDuelists, ["alice", "bob"]);
  assert.equal(value.pairings[0].pairingId, "m1");
  assert.equal(value.pairings[0].playerAReady, true);
  assert.equal(value.pairings[0].playerBReady, false);
  assert.equal(value.viewerAlertCount, 4);
  assert.equal(value.viewerUnreadAlertCount, 2);
  assert.deepEqual(value.roomRules, roomRules);
  assert.equal(value.bracketEdits.length, 1);
  assert.equal(value.bracketEdits[0].actorUsername, "staffUser");
});

test("serializeTournament falls back to defaults for non-admin viewers", async () => {
  const { serializeTournament } = await loadCmsModule("serializers.js");
  const createdAt = new Date("2026-03-22T12:00:00.000Z");
  const updatedAt = new Date("2026-03-23T12:00:00.000Z");
  const value = serializeTournament(
    {
      _id: { toString: () => "tour-2" },
      slug: "casual-league-night",
      name: "Casual League Night",
      description: "Weekly casual event",
      leagueId: "league-2",
      leagueName: "Casual League",
      format: "Swiss",
      ranked: false,
      capacity: 8,
      status: "Registration Grace",
      platformManaged: false,
      ownerUsername: "hostUser",
      scheduledStartAt: "2026-03-24T18:00:00.000Z",
      configuredRoundCount: 0,
      gracePeriodMinutes: 10,
      checkInRequired: false,
      currentRoundNumber: 0,
      createdAt,
      updatedAt
    },
    { username: "visitor", role: "user" }
  );

  assert.equal(value.ownedByMe, false);
  assert.equal(value.registeredByMe, false);
  assert.equal(value.myRegistrationState, null);
  assert.equal(value.graceActive, true);
  assert.deepEqual(value.reminderSummary, {
    configuredOffsets: [],
    reminderJobCount: 0,
    pendingReminderCount: 0
  });
  assert.deepEqual(value.bracketEdits, []);
  assert.deepEqual(value.entrants, []);
  assert.deepEqual(value.roundsOverview, []);
  assert.deepEqual(value.standings, []);
  assert.equal(value.liveOverview.liveMatchCount, 0);
  assert.equal(value.currentRoundLabel, "Round 1");
});
// Run with: npm run test:unit
