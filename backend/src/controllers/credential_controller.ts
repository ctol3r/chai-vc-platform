import { checkOigExclusion, checkNpdbRecords, Provider } from '../psv/npdb_oig_checks';

/**
 * Run the primary source verification workflow for a provider.
 * This currently checks the NPDB and OIG lists.
 */
export async function runPsvWorkflow(provider: Provider) {
  const oigExcluded = await checkOigExclusion(provider.name);
  const npdbFlagged = await checkNpdbRecords(provider.npi);
  return {
    oigExcluded,
    npdbFlagged,
  };
}
