import express, { Request } from 'express';
import multer from 'multer';
import { CompressionData } from '../models/CompressionData';
import { auth } from '../middleware/auth';
import { compressFile } from '../utils/compression';

// Define custom request type with multer file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Debug route to list all compression data (temporarily without auth for testing)
router.get('/debug/all', async (req, res) => {
  try {
    console.log('Debug route accessed');
    const allData = await CompressionData.find({});
    console.log('All compression data in database:', allData);
    
    // Also check the database connection
    const db = CompressionData.db;
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections);
    
    res.json({ 
      success: true, 
      data: allData,
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch debug data',
      details: error.message 
    });
  }
});

// Debug route to check MongoDB connection
router.get('/debug/connection', async (req, res) => {
  try {
    const db = CompressionData.db;
    const stats = await db.stats();
    console.log('Database stats:', stats);
    res.json({ 
      success: true, 
      stats,
      collections: await db.listCollections().toArray()
    });
  } catch (error) {
    console.error('Connection debug error:', error);
    res.status(500).json({ 
      error: 'Failed to check database connection',
      details: error.message 
    });
  }
});

router.post('/compress', auth, upload.single('file'), async (req: MulterRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { buffer, originalname: filename } = req.file;
    const originalSize = buffer.length;

    console.log('Starting compression for file:', filename, 'by user:', userId);

    // Compress the file
    const { compressedBuffer, algorithm } = await compressFile(buffer);
    const compressedSize = compressedBuffer.length;
    const compressionRatio = (compressedSize / originalSize) * 100;

    console.log('Compression completed:', {
      filename,
      originalSize,
      compressedSize,
      compressionRatio,
      algorithm
    });

    // Save compression data to MongoDB
    const compressionData = new CompressionData({
      userId,
      filename,
      originalSize,
      compressedSize,
      compressionRatio,
      algorithm,
    });

    const savedData = await compressionData.save();
    console.log('Compression data saved to MongoDB:', savedData._id);

    // Send the compressed file back to the client
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=compressed_${filename}`);
    res.setHeader('Content-Length', compressedSize);
    res.send(compressedBuffer);
  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ error: 'Compression failed' });
  }
});

// Separate endpoint for getting compression metadata
router.get('/metadata/:filename', auth, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { filename } = req.params;
    // Remove 'compressed_' prefix if present
    const originalFilename = filename.startsWith('compressed_') 
      ? filename.substring('compressed_'.length)
      : filename;

    console.log('Fetching metadata for file:', originalFilename, 'by user:', userId);

    // First, try to find by exact filename match
    let compressionData = await CompressionData.findOne({ 
      userId, 
      filename: originalFilename 
    }).sort({ timestamp: -1 });

    // If not found, try to find by filename containing the original name
    if (!compressionData) {
      console.log('No exact match found, trying partial match');
      compressionData = await CompressionData.findOne({ 
        userId, 
        filename: { $regex: originalFilename, $options: 'i' }
      }).sort({ timestamp: -1 });
    }

    if (!compressionData) {
      console.log('No compression data found for file:', originalFilename);
      return res.status(404).json({ 
        error: 'Compression data not found',
        details: {
          searchedFilename: originalFilename,
          userId: userId
        }
      });
    }

    console.log('Found compression data:', compressionData._id);

    res.json({
      success: true,
      data: {
        filename: compressionData.filename,
        originalSize: compressionData.originalSize,
        compressedSize: compressionData.compressedSize,
        compressionRatio: compressionData.compressionRatio,
        algorithm: compressionData.algorithm,
        timestamp: compressionData.timestamp
      }
    });
  } catch (error) {
    console.error('Metadata error:', error);
    res.status(500).json({ error: 'Failed to fetch compression metadata' });
  }
});

export default router; 