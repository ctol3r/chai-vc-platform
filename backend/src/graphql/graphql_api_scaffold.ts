import { startGraphQLServer } from './clinician_resolver';

// Start the GraphQL API when this module is executed directly
if (require.main === module) {
  startGraphQLServer();
}
