import { Schema, model, models } from "mongoose";

const tournamentEntrantSchema = new Schema(
  {
    userId: {
      type: String,
      default: ""
    },
    username: {
      type: String,
      required: true,
      trim: true
    },
    registrationState: {
      type: String,
      enum: ["registered", "checked_in", "dropped", "eliminated", "disqualified"],
      default: "registered"
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    checkedInAt: {
      type: Date,
      default: null
    },
    droppedAt: {
      type: Date,
      default: null
    },
    receivedByeCount: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const tournamentRoundOverviewSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const tournamentStandingSchema = new Schema(
  {
    place: Number,
    player: String,
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    },
    draws: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const tournamentPairingSchema = new Schema(
  {
    round: String,
    table: Number,
    playerA: String,
    playerB: String,
    status: {
      type: String,
      default: "Pending"
    },
    result: {
      type: String,
      default: "pending"
    },
    winner: {
      type: String,
      default: ""
    },
    matchId: {
      type: String,
      default: ""
    },
    playerAJoinedAt: {
      type: Date,
      default: null
    },
    playerBJoinedAt: {
      type: Date,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    roomPort: {
      type: Number,
      default: null
    },
    roomPass: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const tournamentBracketEditSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true
    },
    actorUserId: {
      type: String,
      default: ""
    },
    actorUsername: {
      type: String,
      default: ""
    },
    reason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 280
    },
    details: {
      type: Schema.Types.Mixed,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const tournamentSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 160
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2400
    },
    ownerUserId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    ownerUsername: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    leagueId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    leagueName: {
      type: String,
      required: true,
      trim: true
    },
    format: {
      type: String,
      enum: ["Swiss", "Single Elimination"],
      required: true
    },
    status: {
      type: String,
      enum: ["Registration Open", "Registration Grace", "Round In Progress", "Between Rounds", "Completed", "Cancelled"],
      default: "Registration Open",
      index: true
    },
    visibility: {
      type: String,
      enum: ["public", "unlisted"],
      default: "public"
    },
    capacity: {
      type: Number,
      required: true,
      min: 4,
      max: 64
    },
    scheduledStartAt: {
      type: Date,
      required: true,
      index: true
    },
    checkInRequired: {
      type: Boolean,
      default: true
    },
    gracePeriodMinutes: {
      type: Number,
      default: 10
    },
    configuredRoundCount: {
      type: Number,
      default: 4
    },
    currentRoundNumber: {
      type: Number,
      default: 0
    },
    ranked: {
      type: Boolean,
      default: true
    },
    platformManaged: {
      type: Boolean,
      default: false
    },
    reminderOffsets: {
      type: [String],
      default: ["24h", "4h", "30m"]
    },
    roomRules: {
      ruleset: {
        type: String,
        default: "TCG Modern"
      },
      duelMode: {
        type: String,
        default: "Match"
      },
      banlist: {
        type: String,
        default: "Modern"
      },
      automation: {
        type: String,
        default: "Automatic"
      }
    },
    entrants: {
      type: [tournamentEntrantSchema],
      default: []
    },
    roundsOverview: {
      type: [tournamentRoundOverviewSchema],
      default: []
    },
    standings: {
      type: [tournamentStandingSchema],
      default: []
    },
    pairings: {
      type: [tournamentPairingSchema],
      default: []
    },
    bracketEdits: {
      type: [tournamentBracketEditSchema],
      default: []
    }
  },
  { timestamps: true }
);

export const Tournament = models.Tournament || model("Tournament", tournamentSchema);
