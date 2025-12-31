import mongoose, { Schema, Types } from "mongoose";

export enum ProcessingEvent {
  INGEST_STARTED = "ingest_started",           // upload stream accepted
  INGEST_PROGRESS = "ingest_progress",         // bytes / duration sampled
  MEDIA_ANALYSIS = "media_analysis",           // frames + audio inspection
  CONTENT_CLASSIFICATION = "content_classification", // nsfw, violence, etc
  MEDIA_PROCESSING = "media_processing",       // encoding, packaging
  DERIVATIVE_GENERATION = "derivative_generation", // thumbnails, previews
  STREAM_READY = "stream_ready",               // playable outputs ready
  PIPELINE_COMPLETED = "pipeline_completed",
  PIPELINE_ERROR = "pipeline_error",
}


// Status enums
export enum ProcessingStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

// Content sensitivity levels
export enum SensitivityLevel {
  SAFE = "safe",
  MODERATE = "moderate",
  SENSITIVE = "sensitive",
  EXPLICIT = "explicit",
}

// Embedded log entry interface
export interface ILogEntry {
  step: ProcessingEvent;
  message?: string;
  timestamp?: Date;
  error?: string;
  progressPercentage?: number;
  metadata?: Record<string, any>;
}

// Content moderation results
export interface IContentModerationResult {
  isNSFW: boolean;
  sensitivityLevel: SensitivityLevel;
  confidenceScore: number; // 0-100
  detectedCategories: string[];
  flaggedFrames?: number[];
  analyzedAt?: Date;
}

// Processing log interface
export interface IProcessingLog {
  videoId: Types.ObjectId;
  status: ProcessingStatus;
  progress: number; // 0-100
  currentStep: ProcessingEvent;
  completedAt?: Date;
  failedAt?: Date;
  logs: ILogEntry[];
  contentModeration?: IContentModerationResult;
  metadata?: {
    duration?: number;
    fileSize?: number;
    resolution?: string;
    codec?: string;
    framesExtracted?: number;
  };
}

// Embedded log entry schema
const logEntrySchema = new Schema<ILogEntry>(
  {
    step: {
      type: String,
      required: [true, "Log step is required"],
      enum: {
        values: Object.values(ProcessingEvent),
        message: "{VALUE} is not a valid step",
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    error: {
      type: String,
      trim: true,
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: true }
);

// Content moderation result schema
const contentModerationSchema = new Schema<IContentModerationResult>(
  {
    isNSFW: {
      type: Boolean,
      required: true,
      default: false,
    },
    sensitivityLevel: {
      type: String,
      required: true,
      enum: {
        values: Object.values(SensitivityLevel),
        message: "{VALUE} is not a valid sensitivity level",
      },
      default: SensitivityLevel.SAFE,
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    detectedCategories: {
      type: [String],
      default: [],
    },
    flaggedFrames: {
      type: [Number],
      default: [],
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Processing log schema
const processingLogSchema = new Schema<IProcessingLog>(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: [true, "Video reference is required"],
      unique: true,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: Object.values(ProcessingStatus),
        message: "{VALUE} is not a valid status",
      },
      default: ProcessingStatus.PENDING,
    },
    progress: {
      type: Number,
      required: [true, "Progress is required"],
      min: [0, "Progress must be at least 0"],
      max: [100, "Progress cannot exceed 100"],
      default: 0,
    },
    currentStep: {
      type: String,
      required: [true, "Current step is required"],
      enum: {
        values: Object.values(ProcessingEvent),
        message: "{VALUE} is not a valid step",
      },
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    logs: {
      type: [logEntrySchema],
      default: [],
    },
    contentModeration: {
      type: contentModerationSchema,
    },
  },
  { timestamps: true }
);

// Index for faster queries
processingLogSchema.index({ videoId: 1 });
processingLogSchema.index({ status: 1 });
processingLogSchema.index({ currentStep: 1 });
processingLogSchema.index({ "contentModeration.isNSFW": 1 });

export const ProcessingLog = mongoose.model<IProcessingLog>(
  "ProcessingLog",
  processingLogSchema
);
