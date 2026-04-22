import { Schema, model, models } from "mongoose";

const leagueSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 120
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
      maxlength: 1200
    },
    active: {
      type: Boolean,
      default: true
    },
    ranked: {
      type: Boolean,
      default: true
    },
    visibility: {
      type: String,
      enum: ["public", "unlisted"],
      default: "public"
    },
    supportedFormats: {
      type: [String],
      default: ["Swiss", "Single Elimination"]
    },
    roomConfiguration: {
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
    }
  },
  { timestamps: true }
);

export const League = models.League || model("League", leagueSchema);
