import { Router } from "express";
import { store } from "../services/credential_store";

export function practitionerRouter() {
  const r = Router();
  
  r.get("/fhir/Practitioner/:id", async (req, res) => {
    const id = req.params.id;
    const vcs = await store.findBySubject(id);
    
    const qualification = (vcs || []).map((vc: any) => ({
      identifier: [
        { 
          system: "urn:vitalcv:credentialId", 
          value: vc.credentialId 
        }
      ],
      code: { 
        text: vc?.credential?.type?.join(",") || "VerifiableCredential" 
      },
      issuer: { 
        display: vc?.credential?.issuer || "VitalCV Issuer" 
      },
      period: { 
        start: vc?.issuedAt,
        end: vc?.credential?.expirationDate
      }
    }));
    
    res.json({ 
      resourceType: "Practitioner", 
      id, 
      qualification 
    });
  });
  
  return r;
}
