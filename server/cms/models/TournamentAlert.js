import { Schema, model, models } from "mongoose";

const tournamentAlertSchema = new Schema(
  {
    tournamentId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    userId: {
      type: String,
      default: "",
      index: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    readAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

export const TournamentAlert = models.TournamentAlert || model("TournamentAlert", tournamentAlertSchema);
