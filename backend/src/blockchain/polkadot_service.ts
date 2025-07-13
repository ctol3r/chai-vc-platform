import { tracer } from '../tracing';

export async function submitToChain(data: string): Promise<{ block: number }> {
  const span = tracer.startSpan('submitToChain');
  try {
    // blockchain interaction placeholder
    return { block: 1 };
  } finally {
    span.end();
  }
}
