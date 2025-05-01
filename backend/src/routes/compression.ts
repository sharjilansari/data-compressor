import express from "express";
import { auth } from "../middleware/auth";
import { CompressionData } from "../models/CompressionData";
import fileUpload from "express-fileupload";
import { createGzip, createDeflate, createBrotliCompress } from "zlib";
import { pipeline } from "stream/promises";
import { createReadStream, createWriteStream } from "fs";
import { join } from "path";
import { mkdir } from "fs/promises";
import logger from "../utils/logger";  // Importing the logger

const router = express.Router();

// Compress file
router.post("/compress", auth, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      logger.error("No file uploaded");  // Log error if no file uploaded
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file as fileUpload.UploadedFile;
    const userId = req.user?.uid;
    const algorithm = req.body.algorithm || "gzip";

    if (!userId) {
      logger.error("Unauthorized user attempt");  // Log if user is unauthorized
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads", userId);
    await mkdir(uploadsDir, { recursive: true });

    const originalFilePath = join(uploadsDir, file.name);
    const compressedFilePath = join(uploadsDir, `${file.name}.${algorithm}`);

    // Save original file
    await file.mv(originalFilePath);
    logger.info(`File uploaded: ${file.name} by user: ${userId}`);  // Log successful file upload

    // Create appropriate compression stream
    let compressionStream;
    switch (algorithm) {
      case "gzip":
        compressionStream = createGzip();
        break;
      case "deflate":
        compressionStream = createDeflate();
        break;
      case "brotli":
        compressionStream = createBrotliCompress();
        break;
      default:
        logger.error("Invalid compression algorithm");  // Log error for invalid algorithm
        return res.status(400).json({ error: "Invalid compression algorithm" });
    }

    // Compress file
    await pipeline(
      createReadStream(originalFilePath),
      compressionStream,
      createWriteStream(compressedFilePath)
    );
    logger.info(`File compressed: ${file.name} with ${algorithm}`);  // Log successful compression

    // Get compressed file size
    const stats = await import("fs/promises").then((fs) =>
      fs.stat(compressedFilePath)
    );
    const originalStats = await import("fs/promises").then((fs) =>
      fs.stat(originalFilePath)
    );
    const originalSize = originalStats.size;
    const compressionRatio = (stats.size / originalSize) * 100;

    // Save compression data
    const compressionData = new CompressionData({
      userId,
      filename: file.name,
      originalSize: originalSize,
      compressedSize: stats.size,
      compressionRatio,
      algorithm,
    });

    await compressionData.save();
    logger.info(`Compression data saved for file: ${file.name}`);  // Log when compression data is saved

    // Log compression information as per the specified format
    logger.info({
      message: "Compression completed",
      level: "info",
      algorithm,
      filename: file.name,
      originalSize: originalSize,
      compressedSize: stats.size,
      ratio: compressionRatio,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: {
        originalSize: originalSize,
        compressedSize: stats.size,
        compressionRatio,
        algorithm,
        downloadUrl: `/uploads/${userId}/${file.name}.${algorithm}`,
      },
    });
  } catch (error) {
    logger.error(`Compression error: ${error}`);  // Log any compression error
    res.status(500).json({ error: "Failed to compress file" });
  }
});

// Separate endpoint for getting compression metadata
router.get("/metadata/:filename", auth, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      // logger.error("Unauthorized user attempt to fetch metadata");  // Log unauthorized metadata access
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { filename } = req.params;
    // Remove 'compressed_' prefix if present
    const originalFilename = filename.startsWith("compressed_")
      ? filename.substring("compressed_".length)
      : filename;

    // logger.info(`Fetching metadata for file: ${originalFilename} by user: ${userId}`);  // Log metadata fetch request

    // First, try to find by exact filename match
    let compressionData = await CompressionData.findOne({
      userId,
      filename: { $regex: originalFilename.replace(/\s+/g, ""), $options: "i" },
    }).sort({ timestamp: -1 });

    // If not found, try to find by filename containing the original name
    if (!compressionData) {
      // logger.info(`No exact match found for filename: ${originalFilename}. Trying partial match.`);
      compressionData = await CompressionData.findOne({
        userId,
        filename: { $regex: originalFilename, $options: "i" },
      }).sort({ timestamp: -1 });
    }

    if (!compressionData) {
      // logger.error(`No compression data found for file: ${originalFilename} by user: ${userId}`);  // Log no data found
      return res.status(404).json({
        error: "Compression data not found",
        details: {
          searchedFilename: originalFilename,
          userId: userId,
        },
      });
    }

    logger.info(`Found compression data for file: ${originalFilename}`);  // Log when compression data is found

    res.json({
      success: true,
      data: {
        filename: compressionData.filename,
        originalSize: compressionData.originalSize,
        compressedSize: compressionData.compressedSize,
        compressionRatio: compressionData.compressionRatio,
        algorithm: compressionData.algorithm,
        timestamp: compressionData.timestamp,
      },
    });
  } catch (error) {
    // logger.error(`Metadata error: ${error}`);  // Log any error during metadata fetch
    res.status(500).json({ error: "Failed to fetch compression metadata" });
  }
});

export default router;
