import fetch from 'node-fetch';
import * as fs from 'fs';

/**
 * Import credential data from a document using an OCR service.
 * This function sends the document to an external AI-powered
 * document extraction API and returns the parsed credential data.
 *
 * The OCR service URL and API key are provided via environment variables:
 * OCR_SERVICE_ENDPOINT and OCR_SERVICE_API_KEY.
 */
export async function importCredentialFromDocument(filePath: string): Promise<any> {
  const endpoint = process.env.OCR_SERVICE_ENDPOINT;
  if (!endpoint) {
    throw new Error('OCR service endpoint not configured');
  }

  const apiKey = process.env.OCR_SERVICE_API_KEY || '';
  const fileBuffer = fs.readFileSync(filePath);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    throw new Error(`OCR request failed with status ${response.status}`);
  }

  return await response.json();
}
