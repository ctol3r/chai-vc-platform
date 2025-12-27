import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const uri =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  "/api/graphql"; // change if your API lives elsewhere

const link = createHttpLink({ uri, fetch });

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  ssrMode: typeof window === "undefined",
});
