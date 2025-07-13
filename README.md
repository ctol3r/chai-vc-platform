# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## GraphQL Talent API

A simple Apollo GraphQL server is provided for querying available talent. Run it with:

```bash
node backend/src/graphql/talent_api.js
```

Example query:

```graphql
query {
  talents(specialty: "Cardiology", radiusKm: 10, from: {lat: 37.77, lon: -122.42}, availability: "MON") {
    id
    name
    specialty
  }
}
```
