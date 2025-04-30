import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';
import { fileTypeFromFile } from 'file-type';
import { CacheService } from './cacheService.js';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);
const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);
const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);

export class CompressionService {
  constructor() {
    this.cacheService = new CacheService();
  }

  async compress(data, algorithm = 'gzip') {
    // Generate cache key
    const cacheKey = this.generateCacheKey(data, algorithm);
    
    // Check cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const originalSize = data.length;
    let compressedData;

    switch (algorithm.toLowerCase()) {
      case 'gzip':
        compressedData = await gzip(data);
        break;
      case 'deflate':
        compressedData = await deflate(data);
        break;
      case 'brotli':
        compressedData = await brotliCompress(data);
        break;
      default:
        throw new Error(`Unsupported compression algorithm: ${algorithm}`);
    }

    const compressedSize = compressedData.length;
    const hash = this.generateHash(data);

    const result = {
      compressedData,
      originalSize,
      compressedSize,
      hash,
      algorithm
    };

    // Cache the result
    await this.cacheService.set(cacheKey, result);

    return result;
  }

  async decompress(compressedData, algorithm) {
    // Generate cache key for decompression
    const cacheKey = this.generateCacheKey(compressedData, `${algorithm}_decompressed`);
    
    // Check cache first
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    let decompressedData;
    switch (algorithm.toLowerCase()) {
      case 'gzip':
        decompressedData = await gunzip(compressedData);
        break;
      case 'deflate':
        decompressedData = await inflate(compressedData);
        break;
      case 'brotli':
        decompressedData = await brotliDecompress(compressedData);
        break;
      default:
        throw new Error(`Unsupported compression algorithm: ${algorithm}`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, decompressedData);

    return decompressedData;
  }

  generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  generateCacheKey(data, algorithm) {
    const hash = this.generateHash(data);
    return `${algorithm}_${hash}`;
  }

  getCompressionRatio(originalSize, compressedSize) {
    return ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
  }
} 