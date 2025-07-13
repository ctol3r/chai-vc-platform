const { request } = require('http');

/**
 * Send hired clinician details to the hospital HRIS webhook.
 * @param {{id: string, name: string, role: string}} clinician
 */
function sendClinicianToHRIS(clinician) {
  const url = process.env.HRIS_WEBHOOK_URL;
  if (!url) {
    return Promise.reject(new Error('HRIS_WEBHOOK_URL not set'));
  }

  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = JSON.stringify(clinician);

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = request(options, res => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
        resolve();
      } else {
        reject(new Error(`HRIS webhook responded with status ${res.statusCode}`));
      }
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = { sendClinicianToHRIS };
