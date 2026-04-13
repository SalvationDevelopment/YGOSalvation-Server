import { Schema, model, models } from "mongoose";

const tournamentRatingSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    leagueId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    rating: {
      type: Number,
      default: 1200
    },
    provisionalGames: {
      type: Number,
      default: 0
    },
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
    byes: {
      type: Number,
      default: 0
    },
    lastMatchAt: {
      type: Date,
      default: null
    },
    history: {
      type: [
        new Schema(
          {
            tournamentId: {
              type: String,
              default: ""
            },
            matchId: {
              type: String,
              default: ""
            },
            preRating: Number,
            postRating: Number,
            expectedScore: Number,
            actualScore: Number,
            kFactor: Number,
            happenedAt: Date
          },
          { _id: false }
        )
      ],
      default: []
    }
  },
  { timestamps: true }
);

tournamentRatingSchema.index({ userId: 1, leagueId: 1 }, { unique: true });

export const TournamentRating = models.TournamentRating || model("TournamentRating", tournamentRatingSchema);
