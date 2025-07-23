# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## SBOM Generation

Container images for each service are built via GitHub Actions. During the build process, [CycloneDX](https://cyclonedx.org/) SBOM files are generated using `anchore/sbom-action` and published as workflow artifacts.
