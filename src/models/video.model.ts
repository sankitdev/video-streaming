import mongoose, { Schema, Types } from "mongoose";

export interface IVideo {
  title: string;
  description: string;
  isFlagged: boolean;
  user: Types.ObjectId;
  orgId: Types.ObjectId;
  duration: number;
  thumbnail: string;
  storagePath: string;
}

const videoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization reference is required"],
    },
    duration: {
      type: Number,
      required: [true, "Video duration is required"],
      min: [0, "Duration must be positive"],
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail path is required"],
    },
    storagePath: {
      type: String,
      required: [true, "Storage path is required"],
    },
  },
  { timestamps: true }
);

// Index for faster queries
videoSchema.index({ user: 1, orgId: 1 });
videoSchema.index({ isFlagged: 1 });

export const Video = mongoose.model<IVideo>("Video", videoSchema);
