# SOC2 Evidence Collection Automation

Automated evidence collection system for SOC2 Type II compliance for the CHAI•VITALCV Healthcare Credentialing Platform.

## Overview

This suite of scripts automates the collection of evidence required for SOC2 Trust Services Criteria (TSC) compliance across all five trust services:

- **Security (CC6.0)**: Logical and physical access controls, system operations, unauthorized access prevention
- **Availability (CC7.0)**: System availability, failures, monitoring, backup and recovery
- **Processing Integrity (CC8.0)**: System processing completeness, validity, accuracy, authorization
- **Confidentiality (CC6.7)**: Information access restrictions
- **Privacy (CC6.8)**: Personal information collection, use, retention, disposal, and disclosure

## Scripts Overview

### 1. `soc2-evidence-collector.py`
**Primary evidence collection orchestrator**

**Purpose**: Automates collection of comprehensive SOC2 evidence across all systems
**Schedule**: Daily for monitoring data, weekly for access reviews, monthly for compliance reports
**Output**: JSON evidence files organized by Trust Services Criteria

**Key Features**:
- **Security Evidence**: IAM policies, security monitoring alerts, vulnerability scans
- **Availability Evidence**: Uptime metrics, SLO compliance, incident response data
- **Processing Integrity**: Data validation logs, ZKP verification, smart contract audits
- **Confidentiality**: Encryption configurations, key management evidence
- **Privacy**: Data subject requests, consent management, retention compliance

```bash
# Run full evidence collection
python3 /path/to/soc2-evidence-collector.py

# Run with custom config
python3 /path/to/soc2-evidence-collector.py --config /custom/path/config.yaml
```

### 2. `soc2-access-review.sh`
**Quarterly access review automation**

**Purpose**: Generates comprehensive access review reports for CC6.1 compliance
**Schedule**: Quarterly (Q1, Q2, Q3, Q4)
**Output**: JSON and CSV reports for management review

**Coverage Areas**:
- **AWS IAM**: Users, roles, policies, groups with activity analysis
- **Kubernetes RBAC**: Service accounts, role bindings, cluster roles
- **Database Access**: User permissions, privilege levels, inactive accounts
- **Application Access**: User accounts with review templates

```bash
# Run quarterly access review
./soc2-access-review.sh

# Environment variables required
export DB_PASSWORD="your_db_password"
export AWS_PROFILE="chai-vc-production"
```

### 3. `soc2-config-snapshot.py`
**Point-in-time configuration capture**

**Purpose**: Captures complete system configuration snapshots for change management evidence
**Schedule**: Weekly or before major deployments
**Output**: Detailed JSON configuration files

**Configuration Categories**:
- **AWS Infrastructure**: VPCs, security groups, IAM policies, S3 policies, CloudTrail, KMS
- **Kubernetes**: Deployments, services, network policies, RBAC, resource quotas
- **Security Tools**: Prometheus rules, certificate configurations
- **Monitoring**: Target configurations, alerting rules
- **Application**: Security headers, encryption settings, API configurations

```bash
# Capture configuration snapshot
python3 /path/to/soc2-config-snapshot.py

# Custom output directory
CONFIG_OUTPUT_DIR=/custom/path python3 /path/to/soc2-config-snapshot.py
```

## Configuration

### Main Configuration File: `config/soc2-collector-config.yaml`

```yaml
# Evidence Storage
evidence_storage:
  base_path: "/var/soc2-evidence"
  retention_days: 2555  # 7 years for SOC2
  encryption_enabled: true

# System Connections
aws_profile: "chai-vc-production"
database:
  host: "chai-vc-postgres.cluster-xyz.us-west-2.rds.amazonaws.com"
  user: "audit_readonly"

prometheus:
  url: "https://prometheus.chai-vc.internal"

# Collection Schedules
collection_schedules:
  daily: [security_monitoring, availability_metrics]
  weekly: [access_reviews, configuration_snapshots]
  monthly: [compliance_reports, risk_assessments]
```

## Deployment

### 1. Prerequisites

**System Requirements**:
```bash
# Required tools
- Python 3.8+
- AWS CLI v2
- kubectl
- PostgreSQL client (psql)
- jq
- yq
```

**Python Dependencies**:
```bash
pip3 install -r requirements.txt
# boto3, kubernetes, pyyaml, requests, psycopg2-binary
```

### 2. Installation

```bash
# Create evidence collection user
sudo useradd -m -s /bin/bash soc2-collector

# Set up directories
sudo mkdir -p /var/soc2-evidence/config-snapshots
sudo mkdir -p /var/soc2-evidence/access-reviews
sudo mkdir -p /var/log/soc2
sudo chown -R soc2-collector:soc2-collector /var/soc2-evidence /var/log/soc2

# Copy scripts
sudo cp scripts/soc2-*.py /usr/local/bin/
sudo cp scripts/soc2-*.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/soc2-*

# Configure AWS credentials for audit user
sudo -u soc2-collector aws configure --profile chai-vc-production
```

### 3. Cron Scheduling

```bash
# Add to soc2-collector user crontab
sudo -u soc2-collector crontab -e

# Daily evidence collection (2 AM)
0 2 * * * /usr/local/bin/soc2-evidence-collector.py 2>&1 | logger -t soc2-evidence

# Weekly configuration snapshots (Sunday 3 AM)
0 3 * * 0 /usr/local/bin/soc2-config-snapshot.py 2>&1 | logger -t soc2-config

# Quarterly access reviews (1st day of quarter, 4 AM)
0 4 1 1,4,7,10 * /usr/local/bin/soc2-access-review.sh 2>&1 | logger -t soc2-access-review
```

## Evidence Organization

### Directory Structure
```
/var/soc2-evidence/
├── daily-collections/
│   ├── 2024-01-15/
│   │   ├── security-evidence.json
│   │   ├── availability-evidence.json
│   │   ├── processing-integrity-evidence.json
│   │   ├── confidentiality-evidence.json
│   │   └── privacy-evidence.json
├── access-reviews/
│   ├── Q1-2024/
│   │   ├── aws-iam-review.json
│   │   ├── k8s-rbac-review.json
│   │   ├── database-access-review.json
│   │   ├── consolidated-access-review.json
│   │   └── csv-exports/
├── config-snapshots/
│   ├── 20240115_030000/
│   │   ├── aws_infrastructure_config_snapshot.json
│   │   ├── kubernetes_config_snapshot.json
│   │   ├── security_tools_config_snapshot.json
│   │   └── summary_config_snapshot.json
└── compliance-reports/
    ├── monthly/
    └── quarterly/
```

## Trust Services Criteria Mapping

### CC6.1 - Logical and Physical Access Controls
- **Evidence**: IAM policies, user access reviews, privileged access logs, RBAC configurations
- **Scripts**: `soc2-access-review.sh`, `soc2-evidence-collector.py`
- **Frequency**: Quarterly reviews, daily monitoring

### CC6.2 - System Operations
- **Evidence**: Security monitoring alerts, intrusion detection logs, vulnerability scans
- **Scripts**: `soc2-evidence-collector.py`
- **Frequency**: Daily collection, weekly analysis

### CC6.7 - Confidentiality
- **Evidence**: Encryption configurations, key management procedures, key rotation logs
- **Scripts**: `soc2-config-snapshot.py`, `soc2-evidence-collector.py`
- **Frequency**: Weekly snapshots, daily monitoring

### CC7.1 - System Availability and Operation
- **Evidence**: Uptime reports, SLA compliance metrics, capacity planning
- **Scripts**: `soc2-evidence-collector.py`
- **Frequency**: Daily collection, monthly reporting

### CC8.1 - Data Processing
- **Evidence**: Data validation procedures, processing controls, integrity checks
- **Scripts**: `soc2-evidence-collector.py`
- **Frequency**: Daily collection for healthcare transaction logs

## Monitoring and Alerting

### Evidence Collection Monitoring

```bash
# Check evidence collection status
systemctl status soc2-evidence-collector
journalctl -u soc2-evidence-collector -f

# Prometheus metrics
soc2_evidence_collection_success_total
soc2_evidence_collection_duration_seconds
soc2_evidence_collection_errors_total
```

### Alert Conditions
- Evidence collection failure
- Missing daily evidence files
- Configuration drift detected
- Access review deadlines approaching
- Storage capacity warnings

## Compliance Reporting

### Monthly Reports
- Evidence collection completeness
- Control effectiveness assessment
- Exception and remediation tracking
- Security metrics trends

### Quarterly Reports
- Access review summaries
- Configuration change analysis
- Compliance gap assessment
- Continuous monitoring effectiveness

### Annual Reports
- Full SOC2 readiness assessment
- Evidence portfolio review
- Control testing results
- Remediation status summary

## Security and Privacy

### Data Protection
- All evidence files encrypted at rest (AES-256)
- Secure transmission (TLS 1.3)
- Access logging for all evidence files
- Retention policy enforcement (7 years)

### Access Controls
- Dedicated service account with minimal privileges
- Role-based access to evidence directories
- Audit trail for all access and modifications
- Separation of duties for evidence review

### PII Handling
- Automatic redaction of sensitive data
- Pseudonymization for GDPR compliance
- Data subject request handling
- Breach notification procedures

## Troubleshooting

### Common Issues

**Permission Errors**:
```bash
# Fix evidence directory permissions
sudo chown -R soc2-collector:soc2-collector /var/soc2-evidence
sudo chmod 750 /var/soc2-evidence
```

**AWS API Limits**:
```bash
# Check AWS API usage
aws sts get-caller-identity
aws iam get-account-summary
```

**Database Connection Issues**:
```bash
# Test database connectivity
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT current_timestamp;"
```

**Kubernetes Access**:
```bash
# Verify kubectl configuration
kubectl auth can-i list pods --all-namespaces
kubectl get nodes
```

### Log Analysis
```bash
# Evidence collection logs
tail -f /var/log/soc2/soc2-evidence-*.log

# System logs
journalctl -f -t soc2-evidence
journalctl -f -t soc2-config
journalctl -f -t soc2-access-review
```

## Maintenance

### Regular Tasks
- **Weekly**: Review evidence collection completeness
- **Monthly**: Update configuration templates
- **Quarterly**: Validate evidence retention policies
- **Annually**: Review and update Trust Services Criteria mappings

### Updates and Patches
- Monitor for new AWS services and APIs
- Update Kubernetes API versions
- Refresh security tool integrations
- Validate compliance framework changes

---

**Document Version**: 1.0
**Last Updated**: 2024-01-01
**Maintained By**: Security and Compliance Team
**Review Frequency**: Quarterly