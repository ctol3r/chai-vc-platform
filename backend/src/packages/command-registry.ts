import { z } from "zod";

export interface Command {
  id: string;
  title: string;
  description?: string;
  rolesAllowed?: string[];
  paramsSchema?: z.ZodSchema<any>;
}

// Basic command registry - can be extended later
export const COMMANDS: Command[] = [
  {
    id: "npi.validate",
    title: "Validate NPI",
    description: "Validate a National Provider Identifier",
    rolesAllowed: ["clinician", "admin"],
    paramsSchema: z.object({
      npi: z.string().regex(/^[12]\d{9}$/),
    }),
  },
  {
    id: "claim.new",
    title: "New Claim",
    description: "Create a new claim",
    rolesAllowed: ["clinician", "admin"],
    paramsSchema: z.object({}),
  },
  {
    id: "ai.explain",
    title: "AI Explain",
    description: "Get AI explanation for a subject",
    rolesAllowed: ["clinician", "admin"],
    paramsSchema: z.object({
      subjectType: z.string().optional(),
      subjectId: z.string().optional(),
    }),
  },
];
