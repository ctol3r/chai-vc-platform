import { Router } from 'express';
import { getStore } from '../services/store';

export const fhirRoutes = Router();

fhirRoutes.get('/fhir/Practitioner/:id', async (req, res) => {
  const id = String(req.params.id || '').trim();
  const store = getStore();
  const creds = await store.findBySubject(id);

  const qualification = creds.map((c) => ({
    identifier: [
      {
        system: 'https://vitalcv.example/credential-id',
        value: c.credentialId,
      },
    ],
    code: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v2-0136',
          code: c.status,
          display: c.status,
        },
      ],
    },
  }));

  const resource = {
    resourceType: 'Practitioner',
    id,
    qualification,
  };

  return res.status(200).json(resource);
});
