import express from 'express';
import { auth } from '../middleware/auth';
import { CompressionData } from '../models/CompressionData';
import fileUpload from 'express-fileupload';
import { createGzip, createDeflate, createBrotliCompress } from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';

const router = express.Router();

// Compress file
router.post('/compress', auth, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file as fileUpload.UploadedFile;
    const userId = req.user?.uid;
    const algorithm = req.body.algorithm || 'gzip';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', userId);
    await mkdir(uploadsDir, { recursive: true });

    const originalFilePath = join(uploadsDir, file.name);
    const compressedFilePath = join(uploadsDir, `${file.name}.${algorithm}`);

    // Save original file
    await file.mv(originalFilePath);

    // Create appropriate compression stream
    let compressionStream;
    switch (algorithm) {
      case 'gzip':
        compressionStream = createGzip();
        break;
      case 'deflate':
        compressionStream = createDeflate();
        break;
      case 'brotli':
        compressionStream = createBrotliCompress();
        break;
      default:
        return res.status(400).json({ error: 'Invalid compression algorithm' });
    }

    // Compress file
    await pipeline(
      createReadStream(originalFilePath),
      compressionStream,
      createWriteStream(compressedFilePath)
    );

    // Get compressed file size
    const stats = await import('fs/promises').then(fs => fs.stat(compressedFilePath));
    const compressionRatio = (stats.size / file.size) * 100;

    // Save compression data
    const compressionData = new CompressionData({
      userId,
      filename: file.name,
      originalSize: file.size,
      compressedSize: stats.size,
      compressionRatio,
      algorithm,
    });

    await compressionData.save();

    res.json({
      success: true,
      data: {
        originalSize: file.size,
        compressedSize: stats.size,
        compressionRatio,
        algorithm,
        downloadUrl: `/uploads/${userId}/${file.name}.${algorithm}`,
      },
    });
  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ error: 'Failed to compress file' });
  }
});

// Fetch file metadata by filename
router.get('/metadata/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;

    // Fetch the compression metadata from the database
    const metadata = await CompressionData.findOne({ filename });

    if (!metadata) {
      return res.status(404).json({ error: 'File metadata not found' });
    }

    // Return the metadata as a response
    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

export default router;
