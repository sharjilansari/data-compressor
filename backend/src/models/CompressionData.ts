import mongoose from 'mongoose';

const compressionDataSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalSize: {
    type: Number,
    required: true
  },
  compressedSize: {
    type: Number,
    required: true
  },
  compressionRatio: {
    type: Number,
    required: true
  },
  algorithm: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const CompressionData = mongoose.model('CompressionData', compressionDataSchema); 