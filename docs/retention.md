# Pipeline Artifact Retention

Pipeline build artifacts are stored in an S3 bucket. Artifacts older than 30 days are automatically archived to Amazon S3 Glacier for cost-effective long term storage.

To apply the lifecycle policy manually or to a new bucket, run:

```bash
./scripts/archive_old_pipeline_artifacts.sh <bucket-name>
```

This command configures the bucket to transition artifacts to Glacier after 30 days.
