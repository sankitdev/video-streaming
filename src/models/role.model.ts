import mongoose, { Schema } from "mongoose";

export interface IRole {
  name: string;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
      enum: {
        values: ["admin", "user", "moderator", "viewer"],
        message: "{VALUE} is not a valid role",
      },
    },
  },
  { timestamps: true }
);

export const Role = mongoose.model<IRole>("Role", roleSchema);
