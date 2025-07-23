import express from 'express';
import { json } from 'body-parser';
import { apiKeyRouter } from './api_keys/api_key_routes';

const app = express();
app.use(json());

app.use('/api/keys', apiKeyRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
