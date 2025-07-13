const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');

const app = express();
app.use(express.json());

const spec = yaml.load(fs.readFileSync(__dirname + '/docs/openapi.yaml', 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/credentials', (req, res) => {
  res.json([]); // placeholder
});

app.post('/credentials', (req, res) => {
  res.status(201).json(req.body); // echo back
});

app.get('/credentials/:id', (req, res) => {
  const id = req.params.id;
  res.json({ id, name: 'Example', issued: new Date().toISOString() });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
