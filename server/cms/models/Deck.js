import { Schema, model, models } from "mongoose";

const deckSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    owner: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    main: {
      type: [Number],
      default: []
    },
    extra: {
      type: [Number],
      default: []
    },
    side: {
      type: [Number],
      default: []
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

deckSchema.index({ owner: 1, name: 1 }, { unique: true });

export const Deck = models.Deck || model("Deck", deckSchema);
