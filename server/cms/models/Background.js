import { Schema, model, models } from "mongoose";

const backgroundSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Background = models.Background || model("Background", backgroundSchema);
