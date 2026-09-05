import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 24 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },

    displayName: { type: String, trim: true, maxlength: 50 },
    bio: { type: String, trim: true, maxlength: 280, default: "" },
    avatarUrl: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    interests: [{ type: String }],
    homeCity: { type: Schema.Types.ObjectId, ref: "City" },

    savedPlaces: [{ type: Schema.Types.ObjectId, ref: "Place" }],
    savedEvents: [{ type: Schema.Types.ObjectId, ref: "Event" }],

    preferences: {
      priceLevel: { type: [Number], default: [1, 2, 3, 4] },
      categories: { type: [String], default: [] },
    },

    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: {
      count: { type: Number, default: 0 },
      lastActiveDate: { type: String, default: null },
    },
    unlockedAchievements: [
      {
        key: { type: String },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],

    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },

    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.index({ username: "text", displayName: "text" });

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName || this.username,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    coverUrl: this.coverUrl,
    interests: this.interests,
    role: this.role,
    xp: this.xp,
    level: this.level,
    streak: this.streak,
    unlockedAchievements: this.unlockedAchievements,
    followersCount: this.followersCount,
    followingCount: this.followingCount,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model("User", userSchema);
