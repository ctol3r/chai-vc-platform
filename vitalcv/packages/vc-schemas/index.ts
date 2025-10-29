export type NpiLookup = {
  npi: string;
  type: "INDIVIDUAL" | "ORGANIZATION";
  basic: { first_name?: string; last_name?: string; credential?: string };
  addresses: any[];
  taxonomies: any[];
};
