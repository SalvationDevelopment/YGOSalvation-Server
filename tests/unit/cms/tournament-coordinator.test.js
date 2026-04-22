const assert = require("node:assert/strict");
const test = require("node:test");
const { loadCmsModule } = require("./load-module");

test("resolvePairingId uses the match id when present", async () => {
  const { resolvePairingId } = await loadCmsModule("tournament-coordinator.js");

  assert.equal(resolvePairingId({ matchId: "m-1", round: "Round 1", table: 3 }), "m-1");
  assert.equal(resolvePairingId({ round: "Round 1", table: 3 }), "Round 1::3");
});

test("collectRoundOneEntrants filters inactive entrants and sorts names", async () => {
  const { collectRoundOneEntrants } = await loadCmsModule("tournament-coordinator.js");
  const entrants = collectRoundOneEntrants({
    checkInRequired: false,
    entrants: [
      { userId: "3", username: "Charlie", registrationState: "registered" },
      { userId: "1", username: "Alice", registrationState: "checked_in", receivedByeCount: 2 },
      { userId: "4", username: "Delta", registrationState: "dropped" },
      { userId: "2", username: "Bob", registrationState: "disqualified" }
    ]
  });

  assert.deepEqual(entrants, [
    { userId: "1", username: "Alice", receivedByeCount: 2 },
    { userId: "3", username: "Charlie", receivedByeCount: 0 }
  ]);
});

test("collectRoundOneEntrants only keeps checked-in entrants when check-in is required", async () => {
  const { collectRoundOneEntrants } = await loadCmsModule("tournament-coordinator.js");
  const entrants = collectRoundOneEntrants({
    checkInRequired: true,
    entrants: [
      { userId: "2", username: "Bob", registrationState: "registered" },
      { userId: "1", username: "Alice", registrationState: "checked_in", receivedByeCount: 1 },
      { userId: "3", username: "Charlie", registrationState: "checked_in" }
    ]
  });

  assert.deepEqual(entrants, [
    { userId: "1", username: "Alice", receivedByeCount: 1 },
    { userId: "3", username: "Charlie", receivedByeCount: 0 }
  ]);
});

test("buildInitialStandings assigns one-based places and zeroed records", async () => {
  const { buildInitialStandings } = await loadCmsModule("tournament-coordinator.js");
  assert.deepEqual(buildInitialStandings([{ username: "Alice" }, { username: "Bob" }]), [
    { place: 1, player: "Alice", wins: 0, losses: 0, draws: 0, points: 0 },
    { place: 2, player: "Bob", wins: 0, losses: 0, draws: 0, points: 0 }
  ]);
});

test("createRoundOneState builds a bye pairing and opening standings", async () => {
  const { createRoundOneState } = await loadCmsModule("tournament-coordinator.js");
  const state = createRoundOneState({
    id: "tour-1",
    roundsOverview: [{ name: "Round 1" }],
    entrants: [
      { username: "Charlie", registrationState: "registered" },
      { username: "Alice", registrationState: "registered" },
      { username: "Bob", registrationState: "registered" }
    ]
  });

  assert.equal(state.currentRoundNumber, 1);
  assert.equal(state.status, "Round In Progress");
  assert.equal(state.pairings.length, 2);
  assert.equal(state.pairings[0].playerA, "Alice");
  assert.equal(state.pairings[0].playerB, "BYE");
  assert.equal(state.pairings[0].result, "bye");
  assert.equal(state.standings[0].player, "Alice");
  assert.equal(state.standings[0].wins, 1);
  assert.equal(state.standings[0].points, 3);
});

test("createRoundOneState rejects tournaments without two active entrants", async () => {
  const { createRoundOneState } = await loadCmsModule("tournament-coordinator.js");

  assert.throws(
    () => createRoundOneState({
      id: "tour-1",
      checkInRequired: true,
      entrants: [
        { username: "Alice", registrationState: "registered" },
        { username: "Bob", registrationState: "dropped" }
      ]
    }),
    /At least two active entrants are required to start the tournament\./
  );
});

test("updatePairingJoinState transitions to waiting and then dueling", async () => {
  const { updatePairingJoinState } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    pairings: [
      {
        round: "Round 1",
        table: 1,
        matchId: "tour-1-r1-t1",
        playerA: "Alice",
        playerB: "Bob",
        result: "pending",
        status: "Pending",
        playerAJoinedAt: null,
        playerBJoinedAt: null,
        startedAt: null
      }
    ]
  };

  const afterAlice = updatePairingJoinState(tournament, "tour-1-r1-t1", "Alice");
  assert.equal(afterAlice.status, "Waiting For Opponent");
  assert.ok(afterAlice.playerAJoinedAt);

  const afterBob = updatePairingJoinState(tournament, "tour-1-r1-t1", "Bob");
  assert.equal(afterBob.status, "Dueling");
  assert.ok(afterBob.playerBJoinedAt);
  assert.ok(afterBob.startedAt);
});

test("updatePairingJoinState throws for missing pairings and ignores resolved pairings", async () => {
  const { updatePairingJoinState } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    pairings: [
      {
        round: "Round 1",
        table: 1,
        matchId: "tour-1-r1-t1",
        playerA: "Alice",
        playerB: "Bob",
        result: "playerA",
        status: "Result Recorded"
      }
    ]
  };

  assert.throws(
    () => updatePairingJoinState(tournament, "missing", "Alice"),
    /Tournament pairing not found\./
  );

  const resolvedPairing = updatePairingJoinState(tournament, "tour-1-r1-t1", "Alice");
  assert.equal(resolvedPairing.status, "Result Recorded");
  assert.equal(resolvedPairing.result, "playerA");
});

test("swapPairingPlayers swaps the requested slots and resets pairing state", async () => {
  const { swapPairingPlayers } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    currentRoundNumber: 1,
    pairings: [
      {
        round: "Round 1",
        table: 1,
        matchId: "tour-1-r1-t1",
        playerA: "Alice",
        playerB: "Bob",
        result: "pending",
        status: "Pending",
        playerAJoinedAt: null,
        playerBJoinedAt: null,
        startedAt: null,
        completedAt: null,
        winner: "",
        roomPort: 9001,
        roomPass: "abc"
      },
      {
        round: "Round 1",
        table: 2,
        matchId: "tour-1-r1-t2",
        playerA: "Charlie",
        playerB: "Delta",
        result: "pending",
        status: "Pending",
        playerAJoinedAt: null,
        playerBJoinedAt: null,
        startedAt: null,
        completedAt: null,
        winner: "",
        roomPort: 9002,
        roomPass: "def"
      }
    ]
  };

  const result = swapPairingPlayers(tournament, {
    leftMatchId: "tour-1-r1-t1",
    leftSlot: "playerA",
    rightMatchId: "tour-1-r1-t2",
    rightSlot: "playerB"
  });

  assert.equal(result.leftPairing.playerA, "Delta");
  assert.equal(result.rightPairing.playerB, "Alice");
  assert.equal(result.leftPairing.status, "Pending");
  assert.equal(result.leftPairing.roomPass, "");
  assert.equal(result.rightPairing.roomPass, "");
});

test("recalculateStandingsFromPairings aggregates wins, losses, draws, and byes", async () => {
  const { recalculateStandingsFromPairings } = await loadCmsModule("tournament-coordinator.js");
  const standings = recalculateStandingsFromPairings({
    entrants: [
      { username: "Alice", registrationState: "registered" },
      { username: "Bob", registrationState: "registered" },
      { username: "Charlie", registrationState: "registered" }
    ],
    pairings: [
      { result: "bye", playerA: "Alice", playerB: "BYE", winner: "" },
      { result: "draw", playerA: "Bob", playerB: "Charlie", winner: "" },
      { result: "playerA", playerA: "Bob", playerB: "Alice", winner: "Bob" }
    ]
  });

  assert.deepEqual(standings, [
    { place: 1, player: "Bob", wins: 1, losses: 0, draws: 1, points: 4 },
    { place: 2, player: "Alice", wins: 1, losses: 1, draws: 0, points: 3 },
    { place: 3, player: "Charlie", wins: 0, losses: 0, draws: 1, points: 1 }
  ]);
});

test("recordPairingResult updates the pairing, standings, and entrant status", async () => {
  const { recordPairingResult } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    format: "Single Elimination",
    currentRoundNumber: 1,
    configuredRoundCount: 1,
    status: "Round In Progress",
    entrants: [
      { username: "Alice", registrationState: "registered" },
      { username: "Bob", registrationState: "registered" }
    ],
    pairings: [
      {
        round: "Round 1",
        table: 1,
        matchId: "tour-1-r1-t1",
        playerA: "Alice",
        playerB: "Bob",
        result: "pending",
        status: "Pending",
        winner: ""
      }
    ],
    standings: []
  };

  const pairing = recordPairingResult(tournament, "tour-1-r1-t1", "playerA", "Alice");

  assert.equal(pairing.result, "playerA");
  assert.equal(pairing.winner, "Alice");
  assert.equal(tournament.status, "Completed");
  assert.equal(tournament.entrants[1].registrationState, "eliminated");
  assert.equal(tournament.standings[0].player, "Alice");
  assert.equal(tournament.standings[0].wins, 1);
});

test("recordPairingResult records draws without eliminating entrants", async () => {
  const { recordPairingResult } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    format: "Swiss",
    currentRoundNumber: 1,
    configuredRoundCount: 2,
    status: "Round In Progress",
    entrants: [
      { username: "Alice", registrationState: "registered" },
      { username: "Bob", registrationState: "registered" }
    ],
    pairings: [
      {
        round: "Round 1",
        table: 1,
        matchId: "tour-1-r1-t1",
        playerA: "Alice",
        playerB: "Bob",
        result: "pending",
        status: "Pending",
        winner: ""
      }
    ],
    standings: [],
    roundsOverview: [{ name: "Round 1", status: "Active" }]
  };

  const pairing = recordPairingResult(tournament, "tour-1-r1-t1", "draw", "");

  assert.equal(pairing.status, "Draw Recorded");
  assert.equal(pairing.winner, "");
  assert.equal(tournament.standings[0].points, 1);
  assert.equal(tournament.standings[1].points, 1);
  assert.equal(tournament.status, "Between Rounds");
  assert.equal(tournament.entrants[0].registrationState, "registered");
  assert.equal(tournament.entrants[1].registrationState, "registered");
});

test("syncRoundProgress marks a resolved round complete and advances status between rounds", async () => {
  const { syncRoundProgress } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    currentRoundNumber: 1,
    configuredRoundCount: 3,
    format: "Swiss",
    roundsOverview: [
      { name: "Round 1", status: "Active" },
      { name: "Round 2", status: "Pending" }
    ],
    pairings: [
      {
        round: "Round 1",
        table: 1,
        result: "playerA",
        winner: "Alice"
      }
    ]
  };

  syncRoundProgress(tournament);

  assert.equal(tournament.roundsOverview[0].status, "Complete");
  assert.equal(tournament.status, "Between Rounds");
});

test("syncRoundProgress keeps the current round active while pairings remain pending", async () => {
  const { syncRoundProgress } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    currentRoundNumber: 1,
    configuredRoundCount: 3,
    format: "Swiss",
    roundsOverview: [{ name: "Round 1", status: "Pending" }],
    pairings: [
      {
        round: "Round 1",
        table: 1,
        result: "pending",
        winner: ""
      }
    ]
  };

  syncRoundProgress(tournament);

  assert.equal(tournament.roundsOverview[0].status, "Active");
  assert.equal(tournament.status, "Round In Progress");
});

test("createNextRoundState rejects tournaments that are not between rounds", async () => {
  const { createNextRoundState } = await loadCmsModule("tournament-coordinator.js");

  assert.throws(
    () => createNextRoundState({ status: "Round In Progress", currentRoundNumber: 1 }),
    /Tournament is not ready to generate the next round\./
  );
});

test("recordPairingResult rejects pairings that already have a recorded result", async () => {
  const { recordPairingResult } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    format: "Swiss",
    pairings: [
      {
        round: "Round 1",
        table: 1,
        matchId: "tour-1-r1-t1",
        playerA: "Alice",
        playerB: "Bob",
        result: "playerA",
        status: "Result Recorded",
        winner: "Alice"
      }
    ],
    entrants: [],
    standings: []
  };

  assert.throws(
    () => recordPairingResult(tournament, "tour-1-r1-t1", "playerB", "Bob"),
    /Tournament pairing already has a recorded result\./
  );
});

test("reopenPairingResult rejects bye pairings", async () => {
  const { reopenPairingResult } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    currentRoundNumber: 1,
    pairings: [
      {
        round: "Round 1",
        table: 1,
        matchId: "tour-1-r1-t1",
        playerA: "Alice",
        playerB: "BYE",
        result: "bye",
        status: "Result Recorded",
        winner: "Alice"
      }
    ],
    standings: []
  };

  assert.throws(
    () => reopenPairingResult(tournament, "tour-1-r1-t1"),
    /Bye pairings cannot be reopened from this flow\./
  );
});

test("reopenPairingResult resets a resolved pairing and recomputes tournament state", async () => {
  const { reopenPairingResult } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    format: "Single Elimination",
    currentRoundNumber: 1,
    configuredRoundCount: 1,
    status: "Completed",
    checkInRequired: false,
    entrants: [
      { username: "Alice", registrationState: "eliminated" },
      { username: "Bob", registrationState: "registered" }
    ],
    pairings: [
      {
        round: "Round 1",
        table: 1,
        matchId: "tour-1-r1-t1",
        playerA: "Alice",
        playerB: "Bob",
        result: "playerA",
        status: "Result Recorded",
        winner: "Alice",
        playerAJoinedAt: new Date("2026-03-27T10:00:00.000Z"),
        playerBJoinedAt: new Date("2026-03-27T10:01:00.000Z"),
        startedAt: new Date("2026-03-27T10:01:00.000Z"),
        completedAt: new Date("2026-03-27T10:05:00.000Z")
      }
    ],
    standings: [
      { place: 1, player: "Alice", wins: 1, losses: 0, draws: 0, points: 3 },
      { place: 2, player: "Bob", wins: 0, losses: 1, draws: 0, points: 0 }
    ],
    roundsOverview: [{ name: "Round 1", status: "Complete" }]
  };

  const result = reopenPairingResult(tournament, "tour-1-r1-t1");

  assert.equal(result.before.result, "playerA");
  assert.equal(result.after.result, "pending");
  assert.equal(result.after.status, "Pending");
  assert.equal(tournament.status, "Round In Progress");
  assert.equal(tournament.pairings[0].playerAJoinedAt, null);
  assert.equal(tournament.entrants[0].registrationState, "registered");
  assert.equal(tournament.entrants[1].registrationState, "registered");
  assert.equal(tournament.standings[0].points, 0);
});

test("createNextRoundState builds the next round after a completed single elimination round", async () => {
  const { createNextRoundState } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    id: "tour-1",
    format: "Single Elimination",
    status: "Between Rounds",
    currentRoundNumber: 1,
    configuredRoundCount: 2,
    entrants: [
      { username: "Alice", registrationState: "registered" },
      { username: "Bob", registrationState: "registered" },
      { username: "Charlie", registrationState: "registered" },
      { username: "Delta", registrationState: "registered" }
    ],
    pairings: [
      { round: "Round 1", table: 1, playerA: "Alice", playerB: "Bob", result: "playerA", winner: "Alice" },
      { round: "Round 1", table: 2, playerA: "Charlie", playerB: "Delta", result: "playerB", winner: "Delta" }
    ],
    roundsOverview: [
      { name: "Round 1", status: "Complete" },
      { name: "Round 2", status: "Pending" }
    ],
    standings: [
      { place: 1, player: "Alice", wins: 1, losses: 0, draws: 0, points: 3 },
      { place: 2, player: "Delta", wins: 1, losses: 0, draws: 0, points: 3 },
      { place: 3, player: "Bob", wins: 0, losses: 1, draws: 0, points: 0 },
      { place: 4, player: "Charlie", wins: 0, losses: 1, draws: 0, points: 0 }
    ]
  };

  const result = createNextRoundState(tournament);

  assert.equal(result.currentRoundNumber, 2);
  assert.equal(result.status, "Round In Progress");
  assert.equal(result.pairings.length, 1);
  assert.equal(result.pairings[0].round, "Round 2");
  assert.equal(result.pairings[0].playerA, "Alice");
  assert.equal(result.pairings[0].playerB, "Delta");
  assert.equal(tournament.roundsOverview[0].status, "Complete");
  assert.equal(tournament.roundsOverview[1].status, "Active");
});

test("createNextRoundState rejects Swiss tournaments once all configured rounds are complete", async () => {
  const { createNextRoundState } = await loadCmsModule("tournament-coordinator.js");

  assert.throws(
    () => createNextRoundState({
      format: "Swiss",
      status: "Between Rounds",
      currentRoundNumber: 3,
      configuredRoundCount: 3
    }),
    /Swiss rounds are already complete for this tournament\./
  );
});

test("createNextRoundState creates a Swiss bye for the lowest eligible standing", async () => {
  const { createNextRoundState } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    id: "tour-1",
    format: "Swiss",
    status: "Between Rounds",
    currentRoundNumber: 1,
    configuredRoundCount: 3,
    entrants: [
      { username: "Alice", registrationState: "registered", receivedByeCount: 0 },
      { username: "Bob", registrationState: "registered", receivedByeCount: 0 },
      { username: "Charlie", registrationState: "registered", receivedByeCount: 0 }
    ],
    standings: [
      { place: 1, player: "Alice", wins: 1, losses: 0, draws: 0, points: 3 },
      { place: 2, player: "Bob", wins: 1, losses: 0, draws: 0, points: 3 },
      { place: 3, player: "Charlie", wins: 0, losses: 1, draws: 0, points: 0 }
    ],
    pairings: [
      {
        round: "Round 1",
        table: 1,
        playerA: "Alice",
        playerB: "Bob",
        result: "playerA",
        winner: "Alice"
      }
    ],
    roundsOverview: [
      { name: "Round 1", status: "Complete" },
      { name: "Round 2", status: "Pending" }
    ]
  };

  const result = createNextRoundState(tournament);

  assert.equal(result.currentRoundNumber, 2);
  assert.equal(result.pairings.length, 2);
  assert.equal(result.pairings[0].status, "Bye Awarded");
  assert.equal(result.pairings[0].playerA, "Charlie");
  assert.equal(result.pairings[0].playerB, "BYE");
  assert.equal(result.pairings[1].playerA, "Alice");
  assert.equal(result.pairings[1].playerB, "Bob");
  assert.equal(tournament.entrants[2].receivedByeCount, 1);
});

test("createNextRoundState avoids immediate Swiss rematches when alternatives exist", async () => {
  const { createNextRoundState } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    id: "tour-1",
    format: "Swiss",
    status: "Between Rounds",
    currentRoundNumber: 1,
    configuredRoundCount: 3,
    entrants: [
      { username: "Alice", registrationState: "registered" },
      { username: "Bob", registrationState: "registered" },
      { username: "Charlie", registrationState: "registered" },
      { username: "Dana", registrationState: "registered" }
    ],
    standings: [
      { place: 1, player: "Alice", wins: 1, losses: 0, draws: 0, points: 3 },
      { place: 2, player: "Bob", wins: 1, losses: 0, draws: 0, points: 3 },
      { place: 3, player: "Charlie", wins: 0, losses: 1, draws: 0, points: 0 },
      { place: 4, player: "Dana", wins: 0, losses: 1, draws: 0, points: 0 }
    ],
    pairings: [
      {
        round: "Round 1",
        table: 1,
        playerA: "Alice",
        playerB: "Bob",
        result: "playerA",
        winner: "Alice"
      },
      {
        round: "Round 1",
        table: 2,
        playerA: "Charlie",
        playerB: "Dana",
        result: "playerA",
        winner: "Charlie"
      }
    ],
    roundsOverview: [
      { name: "Round 1", status: "Complete" },
      { name: "Round 2", status: "Pending" }
    ]
  };

  const result = createNextRoundState(tournament);
  const pairings = result.pairings.map((pairing) => [pairing.playerA, pairing.playerB]);

  assert.deepEqual(pairings, [
    ["Alice", "Charlie"],
    ["Bob", "Dana"]
  ]);
});

test("swapPairingPlayers rejects invalid slot names", async () => {
  const { swapPairingPlayers } = await loadCmsModule("tournament-coordinator.js");

  assert.throws(
    () => swapPairingPlayers(
      {
        currentRoundNumber: 1,
        pairings: []
      },
      {
        leftMatchId: "tour-1-r1-t1",
        leftSlot: "playerC",
        rightMatchId: "tour-1-r1-t2",
        rightSlot: "playerA"
      }
    ),
    /A valid pairing slot is required\./
  );
});

test("syncRoundProgress marks the current round complete when all pairings are resolved", async () => {
  const { syncRoundProgress } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    currentRoundNumber: 2,
    configuredRoundCount: 2,
    format: "Swiss",
    roundsOverview: [
      { name: "Round 1", status: "Complete" },
      { name: "Round 2", status: "Active" }
    ],
    pairings: [
      {
        round: "Round 2",
        table: 1,
        result: "playerA",
        winner: "Alice"
      }
    ]
  };

  syncRoundProgress(tournament);

  assert.equal(tournament.roundsOverview[1].status, "Complete");
  assert.equal(tournament.status, "Completed");
});

test("swapPairingPlayers rejects swapping the same slot on the same pairing", async () => {
  const { swapPairingPlayers } = await loadCmsModule("tournament-coordinator.js");
  const tournament = {
    currentRoundNumber: 1,
    pairings: [
      {
        round: "Round 1",
        table: 1,
        matchId: "tour-1-r1-t1",
        playerA: "Alice",
        playerB: "Bob",
        result: "pending",
        status: "Pending",
        playerAJoinedAt: null,
        playerBJoinedAt: null,
        startedAt: null,
        completedAt: null,
        winner: "",
        roomPort: 9001,
        roomPass: "abc"
      }
    ]
  };

  assert.throws(
    () => swapPairingPlayers(tournament, {
      leftMatchId: "tour-1-r1-t1",
      leftSlot: "playerA",
      rightMatchId: "tour-1-r1-t1",
      rightSlot: "playerA"
    }),
    /Select two different pairing slots to swap\./
  );
});
// Run with: npm run test:unit
