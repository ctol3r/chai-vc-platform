/**
 * Defensive Ocean SDK wrapper — handles different SDK shapes across versions.
 */
let OceanSDK: any;
try {
  OceanSDK = require('@oceanprotocol/lib');
} catch (err) {
  OceanSDK = (global as any).Ocean || {};
}

export async function buyDatatoken(did: string, buyer: any, price: number) {
  const ocean: any = OceanSDK?.Ocean ? new OceanSDK.Ocean() : (OceanSDK.default ? new OceanSDK.default() : null);
  if (!ocean) throw new Error('Ocean SDK not available — check dependency version');

  const dt: any = await (ocean.datatokens?.get?.(did) || ocean.getDatatoken?.(did) || ocean.getDatatoken);
  if (!dt) throw new Error('Datatoken not found in Ocean SDK');

  if (typeof dt.buy === 'function') {
    return await dt.buy(buyer?.getId?.() || buyer, price);
  }
  if (typeof dt.order === 'function') {
    return await dt.order(buyer, price);
  }
  throw new Error('Datatoken buy API not recognized for this Ocean SDK version');
}
