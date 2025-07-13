const { ApolloServer, gql } = require('apollo-server');

// Sample in-memory data for talents
const talents = [
  {
    id: '1',
    name: 'Alice',
    specialty: 'Cardiology',
    location: { lat: 37.7749, lon: -122.4194 },
    availability: ['MON', 'TUE', 'WED']
  },
  {
    id: '2',
    name: 'Bob',
    specialty: 'Radiology',
    location: { lat: 37.8044, lon: -122.2711 },
    availability: ['WED', 'THU', 'FRI']
  },
  {
    id: '3',
    name: 'Charlie',
    specialty: 'Cardiology',
    location: { lat: 37.3382, lon: -121.8863 },
    availability: ['MON', 'FRI']
  }
];

// Helper to calculate distance between two lat/lon pairs in kilometers
function distanceKm(loc1, loc2) {
  const R = 6371; // Earth radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lon - loc1.lon) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat*Math.PI/180) * Math.cos(loc2.lat*Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const typeDefs = gql`
  type Location {
    lat: Float!
    lon: Float!
  }

  type Talent {
    id: ID!
    name: String!
    specialty: String!
    location: Location!
    availability: [String!]!
  }

  input LocationInput {
    lat: Float!
    lon: Float!
  }

  type Query {
    talents(
      specialty: String,
      radiusKm: Float,
      from: LocationInput,
      availability: String
    ): [Talent!]!
  }
`;

const resolvers = {
  Query: {
    talents: (_, args) => {
      let results = talents;
      if (args.specialty) {
        results = results.filter(t => t.specialty === args.specialty);
      }
      if (args.availability) {
        results = results.filter(t => t.availability.includes(args.availability));
      }
      if (args.radiusKm && args.from) {
        results = results.filter(t => distanceKm(t.location, args.from) <= args.radiusKm);
      }
      return results;
    }
  }
};

function startServer(port = 4000) {
  const server = new ApolloServer({ typeDefs, resolvers });
  return server.listen({ port }).then(({ url }) => {
    console.log(`GraphQL ready at ${url}`);
    return server;
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer, typeDefs, resolvers, talents };
