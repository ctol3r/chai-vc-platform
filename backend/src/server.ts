import express from 'express';
import { buildSchema } from 'graphql';
import { graphqlHTTP } from 'express-graphql';

// Basic GraphQL schema and resolver
const schema = buildSchema(`
  type Query {
    status: String
  }
`);

const root = {
  status: () => 'ok',
};

const app = express();
app.use(express.json());

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}));

// REST webhook endpoints
app.post('/webhook/workday', (req, res) => {
  console.log('Received Workday webhook:', req.body);
  // handle Workday payload
  res.status(200).json({ message: 'Workday webhook received' });
});

app.post('/webhook/sap', (req, res) => {
  console.log('Received SAP webhook:', req.body);
  // handle SAP payload
  res.status(200).json({ message: 'SAP webhook received' });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
