import express from 'express';
import fs from 'fs';
import path from 'path';
import { CredentialAdapter } from './types.js';

async function loadAdapters(): Promise<Map<string, CredentialAdapter>> {
  const adapters = new Map<string, CredentialAdapter>();
  const dir = path.join(__dirname, 'adapters');
  const files = fs.readdirSync(dir).filter(f => f.endsWith("Adapter.js") || f.endsWith("Adapter.ts"));
  for (const file of files) {
    const modPath = path.join(dir, file);
    const mod = await import(modPath);
    const adapter: CredentialAdapter = mod.default;
    adapters.set(adapter.network, adapter);
  }
  return adapters;
}

export async function createServer() {
  const app = express();
  app.use(express.json());
  const adapters = await loadAdapters();

  app.post('/adapt', async (req, res) => {
    const { network, credential } = req.body;
    if (!network || !credential) {
      return res.status(400).json({ error: 'network and credential required' });
    }
    const adapter = adapters.get(network);
    if (!adapter) {
      return res.status(404).json({ error: 'adapter not found' });
    }
    const adapted = await adapter.adapt(credential);
    res.json({ adapted });
  });

  return app;
}

if (require.main === module) {
  createServer().then(app => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Adapter hub listening on ${port}`));
  });
}
