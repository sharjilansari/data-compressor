import express from 'express';
import { CompressionData } from '../models/CompressionData';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get analytics data
router.get('/analytics', auth, async (req, res) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch compression data for the user
    const compressionData = await CompressionData.find({ userId })
      .sort({ timestamp: -1 })
      .limit(100); // Limit to last 100 compressions

    // Transform the data to match frontend expectations
    const transformedData = compressionData.map(data => ({
      date: data.timestamp.toISOString(),
      compressionRatio: data.compressionRatio,
      originalSize: data.originalSize,
      compressedSize: data.compressedSize
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router; 