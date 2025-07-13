import { tracer } from '../tracing';
import { submitToChain } from './polkadot_service';

export async function storeCredential(data: string): Promise<{ block: number }> {
  const span = tracer.startSpan('storeCredential');
  try {
    return await submitToChain(data);
  } finally {
    span.end();
  }
}
