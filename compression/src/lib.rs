use std::io::{Read, Write};
use flate2::Compression;
use flate2::write::GzEncoder;
use flate2::read::GzDecoder;
use brotli::enc::BrotliEncoderParams;
use lz4::block::{compress, decompress};
use sha2::{Sha256, Digest};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct CompressionResult {
    pub compressed_data: Vec<u8>,
    pub original_size: usize,
    pub compressed_size: usize,
    pub hash: String,
}

#[no_mangle]
pub extern "C" fn compress_data(data: &[u8], algorithm: &str) -> String {
    let result = match algorithm {
        "gzip" => compress_gzip(data),
        "brotli" => compress_brotli(data),
        "lz4" => compress_lz4(data),
        _ => compress_gzip(data), // Default to gzip
    };

    serde_json::to_string(&result).unwrap()
}

fn compress_gzip(data: &[u8]) -> CompressionResult {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(data).unwrap();
    let compressed_data = encoder.finish().unwrap();
    
    let mut hasher = Sha256::new();
    hasher.update(data);
    let hash = hex::encode(hasher.finalize());

    CompressionResult {
        compressed_data,
        original_size: data.len(),
        compressed_size: compressed_data.len(),
        hash,
    }
}

fn compress_brotli(data: &[u8]) -> CompressionResult {
    let mut params = BrotliEncoderParams::default();
    params.quality = 11;
    let mut compressed_data = Vec::new();
    brotli::BrotliCompress(&mut &data[..], &mut compressed_data, &params).unwrap();

    let mut hasher = Sha256::new();
    hasher.update(data);
    let hash = hex::encode(hasher.finalize());

    CompressionResult {
        compressed_data,
        original_size: data.len(),
        compressed_size: compressed_data.len(),
        hash,
    }
}

fn compress_lz4(data: &[u8]) -> CompressionResult {
    let compressed_data = compress(data, None, true).unwrap();

    let mut hasher = Sha256::new();
    hasher.update(data);
    let hash = hex::encode(hasher.finalize());

    CompressionResult {
        compressed_data,
        original_size: data.len(),
        compressed_size: compressed_data.len(),
        hash,
    }
}

#[no_mangle]
pub extern "C" fn decompress_data(compressed_data: &[u8], algorithm: &str) -> Vec<u8> {
    match algorithm {
        "gzip" => decompress_gzip(compressed_data),
        "brotli" => decompress_brotli(compressed_data),
        "lz4" => decompress_lz4(compressed_data),
        _ => decompress_gzip(compressed_data), // Default to gzip
    }
}

fn decompress_gzip(data: &[u8]) -> Vec<u8> {
    let mut decoder = GzDecoder::new(data);
    let mut decompressed = Vec::new();
    decoder.read_to_end(&mut decompressed).unwrap();
    decompressed
}

fn decompress_brotli(data: &[u8]) -> Vec<u8> {
    let mut decompressed = Vec::new();
    brotli::BrotliDecompress(&mut &data[..], &mut decompressed).unwrap();
    decompressed
}

fn decompress_lz4(data: &[u8]) -> Vec<u8> {
    decompress(data, None).unwrap()
} 