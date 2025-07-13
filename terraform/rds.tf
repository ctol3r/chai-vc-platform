provider "aws" {
  region = var.aws_region
}

resource "aws_db_instance" "default" {
  identifier = var.db_identifier
  engine = "postgres"
  instance_class = var.db_instance_class
  allocated_storage = var.db_allocated_storage

  # Enforce AES-256 encryption
  storage_encrypted = true
  kms_key_id        = var.kms_key_id
}
