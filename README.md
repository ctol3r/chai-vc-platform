# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## Istio mTLS

The Kubernetes configuration now includes an `istio-mtls.yaml` manifest. This
manifest configures a cluster-wide `PeerAuthentication` policy in `STRICT` mode
and a `DestinationRule` that forces `ISTIO_MUTUAL` TLS for service-to-service
traffic. Apply this file after deploying the services to ensure mutual TLS is
enforced between microservices.
