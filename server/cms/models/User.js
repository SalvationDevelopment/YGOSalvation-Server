import { Schema, model, models } from "mongoose";

const userSettingsSchema = new Schema(
  {
    theme: {
      type: String,
      default: ""
    },
    cover: {
      type: String,
      default: ""
    },
    imageURL: {
      type: String,
      default: ""
    },
    hide_banlist: {
      type: Boolean,
      default: true
    },
    playassist: {
      type: Boolean,
      default: false
    },
    bluff: {
      type: Boolean,
      default: false
    }
  },
  {
    _id: false
  }
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 40
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user"
    },
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    elo: {
      type: Number,
      default: 1200,
      min: 0
    },
    service: {
      type: Boolean,
      default: false
    },
    avatarUrl: {
      type: String,
      default: "",
      maxlength: 500
    },
    bio: {
      type: String,
      default: "",
      maxlength: 400
    },
    settings: {
      type: userSettingsSchema,
      default: () => ({})
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    incomingFriendRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    outgoingFriendRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    resetTokenHash: {
      type: String,
      default: null
    },
    resetTokenExpiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const User = models.User || model("User", userSchema);
