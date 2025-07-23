import express from 'express';
import bodyParser from 'body-parser';
import adminAssistantRoute from './routes/admin_assistant_route';

const app = express();
app.use(bodyParser.json());
app.use(adminAssistantRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
