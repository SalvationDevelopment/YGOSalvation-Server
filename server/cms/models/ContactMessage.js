import { Schema, model, models } from "mongoose";

const contactMessageSchema = new Schema(
  {
    classification: {
      type: String,
      enum: ["bugs", "business", "suggestions", "tournaments", "other"],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200
    },
    username: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80
    },
    subject: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000
    },
    status: {
      type: String,
      enum: ["new", "reviewed", "closed"],
      default: "new"
    }
  },
  {
    timestamps: true
  }
);

export const ContactMessage = models.ContactMessage || model("ContactMessage", contactMessageSchema);
