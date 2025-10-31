/**
 * OCR (Optical Character Recognition) stub for pilot
 * Returns deterministic parsed text and bounding box metadata
 * 
 * In production, this would integrate with node-tesseract-ocr or similar
 */

import * as fs from 'fs';
import * as path from 'path';

export interface OCRField {
  key: string;
  value: string;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export interface OCRResult {
  text: string;
  fields: OCRField[];
  confidence: number;
  processedAt: Date;
}

/**
 * Parse an image file and return OCR results (pilot stub)
 * 
 * @param filePath - Path to the image file to parse
 * @returns OCR result with text, fields, and bounding boxes
 */
export async function parseImagePilot(filePath: string): Promise<OCRResult> {
  // Check if file exists
  const stat = await fs.promises.stat(filePath).catch(() => null);
  
  if (!stat) {
    throw new Error(`File not found: ${filePath}`);
  }

  const filename = path.basename(filePath);
  
  // Pilot stub: return deterministic OCR results
  // In production, replace with actual Tesseract OCR:
  // const tesseract = require('node-tesseract-ocr');
  // const text = await tesseract.recognize(filePath, { ...options });
  
  return {
    text: `PILOT_OCR_TEXT for ${filename}\n\nThis is simulated OCR output for pilot demonstrations.`,
    fields: [
      {
        key: 'licenseNumber',
        value: 'LIC-123456',
        bbox: [10, 20, 100, 40] // [x, y, width, height]
      },
      {
        key: 'name',
        value: 'Dr. Pilot Example',
        bbox: [10, 60, 200, 90]
      },
      {
        key: 'issuingAuthority',
        value: 'State Medical Board',
        bbox: [10, 100, 250, 130]
      },
      {
        key: 'expirationDate',
        value: '2025-12-31',
        bbox: [10, 140, 150, 170]
      }
    ],
    confidence: 0.99,
    processedAt: new Date()
  };
}

/**
 * Parse OCR from a Buffer (for in-memory file handling)
 * 
 * @param buffer - File buffer
 * @param filename - Original filename (for metadata)
 * @returns OCR result
 */
export async function parseImageBufferPilot(buffer: Buffer, filename: string): Promise<OCRResult> {
  // For pilot, we can use the same deterministic logic
  // In production, write buffer to temp file and process with Tesseract
  
  return {
    text: `PILOT_OCR_TEXT for ${filename}\n\nThis is simulated OCR output for pilot demonstrations.`,
    fields: [
      {
        key: 'licenseNumber',
        value: 'LIC-123456',
        bbox: [10, 20, 100, 40]
      },
      {
        key: 'name',
        value: 'Dr. Pilot Example',
        bbox: [10, 60, 200, 90]
      },
      {
        key: 'issuingAuthority',
        value: 'State Medical Board',
        bbox: [10, 100, 250, 130]
      },
      {
        key: 'expirationDate',
        value: '2025-12-31',
        bbox: [10, 140, 150, 170]
      }
    ],
    confidence: 0.99,
    processedAt: new Date()
  };
}
