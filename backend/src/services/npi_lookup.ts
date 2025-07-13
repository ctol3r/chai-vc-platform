export interface NpiProvider {
  number: string;
  enumeration_type: string;
  basic: Record<string, any>;
}

export async function lookupNpi(number: string): Promise<NpiProvider | null> {
  const url = `https://npiregistry.cms.hhs.gov/api/?number=${encodeURIComponent(number)}&version=2.1`;
  return new Promise((resolve, reject) => {
    const https = require('https');
    https
      .get(url, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.results && json.results.length > 0) {
              resolve(json.results[0] as NpiProvider);
            } else {
              resolve(null);
            }
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', (err: any) => reject(err));
  });
}
