import { Schema, model, models } from "mongoose";

const tournamentReminderSchema = new Schema(
  {
    tournamentId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    tournamentSlug: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    offsetLabel: {
      type: String,
      required: true,
      trim: true
    },
    offsetMinutes: {
      type: Number,
      required: true
    },
    scheduledFor: {
      type: Date,
      required: true,
      index: true
    },
    channel: {
      type: String,
      enum: ["email", "in_app"],
      default: "email"
    },
    status: {
      type: String,
      enum: ["pending", "sent", "cancelled", "failed"],
      default: "pending",
      index: true
    },
    sentAt: {
      type: Date,
      default: null
    },
    error: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export const TournamentReminder = models.TournamentReminder || model("TournamentReminder", tournamentReminderSchema);
