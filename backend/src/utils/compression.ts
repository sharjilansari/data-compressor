import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export async function compressFile(buffer: Buffer): Promise<{ compressedBuffer: Buffer; algorithm: string }> {
  try {
    const compressedBuffer = await gzipAsync(buffer);
    return {
      compressedBuffer,
      algorithm: 'gzip',
    };
  } catch (error) {
    console.error('Compression error:', error);
    throw new Error('Failed to compress file');
  }
} 