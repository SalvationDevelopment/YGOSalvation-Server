import { Schema, model, models } from "mongoose";

const newsPostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 200
    },
    body: {
      type: String,
      required: true,
      trim: true
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280
    }
  },
  { timestamps: true }
);

export const NewsPost = models.NewsPost || model("NewsPost", newsPostSchema);
