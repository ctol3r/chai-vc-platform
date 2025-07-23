import PDFDocument from 'pdfkit';
import crypto from 'crypto';

export interface Credential {
  id: string;
  name: string;
  issued: string;
}

/**
 * Generate a PDF dossier for a credential and embed a tamper-evident hash
 * of the credential JSON data at the end of the document.
 */
export function generateCredentialDossier(credential: Credential): PDFKit.PDFDocument {
  const doc = new PDFDocument();
  doc.fontSize(20).text('Credential Dossier', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`ID: ${credential.id}`);
  doc.text(`Name: ${credential.name}`);
  doc.text(`Issued: ${credential.issued}`);

  doc.moveDown();
  const credentialJson = JSON.stringify(credential);
  const hash = crypto.createHash('sha256').update(credentialJson).digest('hex');
  doc.fontSize(10).text(`Credential Hash: ${hash}`);

  return doc;
}
