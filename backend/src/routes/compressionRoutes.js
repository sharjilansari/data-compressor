import express from 'express';
import { CompressionService } from '../services/compressionService.js';
import logger from '../utils/logger.js';
import { fileTypeFromFile } from 'file-type';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const compressionService = new CompressionService();
const uploadsDir = path.join(__dirname, '../../uploads/compressed');

// Ensure uploads directory exists
fs.mkdirSync(uploadsDir, { recursive: true });

router.post('/compress', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const file = req.files.file;
    const fileBuffer = file.data;
    const algorithm = req.body.algorithm || 'gzip';

    const { mime } = await fileTypeFromFile(fileBuffer);
    if (!mime.startsWith('image') && !mime.startsWith('application')) {
      return res.status(400).json({ success: false, error: 'Unsupported file type' });
    }

    logger.info(`Compressing file: ${file.name} using ${algorithm}`);

    const result = await compressionService.compress(fileBuffer, algorithm);

    const timestamp = Date.now();
    const originalName = path.parse(file.name).name;
    const compressedFilename = `${originalName}_${timestamp}.${algorithm}`;
    const compressedFilePath = path.join(uploadsDir, compressedFilename);

    fs.writeFileSync(compressedFilePath, result.compressedData);

    logger.info({
      message: 'Compression completed',
      filename: file.name,
      algorithm,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      ratio: compressionService.getCompressionRatio(result.originalSize, result.compressedSize),
    });

    res.json({
      success: true,
      filename: file.name,
      compressedFilename,
      algorithm,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      compressionRatio: compressionService.getCompressionRatio(result.originalSize, result.compressedSize),
      hash: result.hash,
      downloadUrl: `/api/download/${compressedFilename}`,
    });
  } catch (error) {
    logger.error('Compression error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    logger.error('Download error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
