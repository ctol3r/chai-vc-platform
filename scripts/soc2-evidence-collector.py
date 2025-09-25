#!/usr/bin/env python3
"""
SOC2 Evidence Collection Automation Script
CHAI•VITALCV Healthcare Credentialing Platform

Automates collection of evidence artifacts required for SOC2 Type II compliance.
Maps to Trust Services Criteria: Security, Availability, Processing Integrity,
Confidentiality, and Privacy.
"""

import asyncio
import json
import logging
import os
import subprocess
import yaml
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any
import boto3
import requests
from kubernetes import client, config
import psycopg2

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'/var/log/soc2-evidence-{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SOC2EvidenceCollector:
    """Main evidence collection orchestrator"""

    def __init__(self, config_path: str = "/etc/soc2/collector-config.yaml"):
        self.config = self._load_config(config_path)
        self.evidence_base_path = Path(self.config['evidence_storage']['base_path'])
        self.current_period = self._get_audit_period()
        self.evidence_metadata = {}

    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)

    def _get_audit_period(self) -> Dict[str, str]:
        """Get current audit period dates"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)  # 12-month period
        return {
            'start': start_date.strftime('%Y-%m-%d'),
            'end': end_date.strftime('%Y-%m-%d')
        }

    async def collect_all_evidence(self) -> Dict[str, Any]:
        """Collect all SOC2 evidence categories"""
        logger.info("Starting SOC2 evidence collection")

        evidence_tasks = [
            self.collect_security_evidence(),
            self.collect_availability_evidence(),
            self.collect_processing_integrity_evidence(),
            self.collect_confidentiality_evidence(),
            self.collect_privacy_evidence()
        ]

        results = await asyncio.gather(*evidence_tasks, return_exceptions=True)

        # Process results and handle exceptions
        evidence_summary = {}
        for i, result in enumerate(results):
            category = ['security', 'availability', 'processing_integrity', 'confidentiality', 'privacy'][i]
            if isinstance(result, Exception):
                logger.error(f"Failed to collect {category} evidence: {result}")
                evidence_summary[category] = {'status': 'failed', 'error': str(result)}
            else:
                evidence_summary[category] = result

        # Generate final report
        final_report = self._generate_evidence_report(evidence_summary)
        return final_report

class SecurityEvidenceCollector:
    """Collect Security (CC6.0) related evidence"""

    def __init__(self, config: Dict[str, Any], period: Dict[str, str]):
        self.config = config
        self.period = period
        self.k8s_client = self._init_k8s_client()
        self.aws_session = boto3.Session(
            profile_name=config.get('aws_profile', 'default')
        )

    def _init_k8s_client(self):
        """Initialize Kubernetes client"""
        try:
            config.load_incluster_config()
        except:
            config.load_kube_config()
        return client.CoreV1Api()

    async def collect_access_controls(self) -> Dict[str, Any]:
        """CC6.1: Access Controls"""
        evidence = {}

        # 1. IAM Policies and Roles
        iam_client = self.aws_session.client('iam')

        # Get all IAM roles
        roles_response = iam_client.list_roles()
        evidence['iam_roles'] = []

        for role in roles_response['Roles']:
            role_policies = iam_client.list_attached_role_policies(
                RoleName=role['RoleName']
            )
            evidence['iam_roles'].append({
                'role_name': role['RoleName'],
                'created_date': role['CreateDate'].isoformat(),
                'attached_policies': role_policies['AttachedPolicies']
            })

        # 2. Kubernetes RBAC
        rbac_v1 = client.RbacAuthorizationV1Api()

        # Get ClusterRoles
        cluster_roles = rbac_v1.list_cluster_role()
        evidence['k8s_cluster_roles'] = [
            {
                'name': role.metadata.name,
                'rules': [
                    {
                        'api_groups': rule.api_groups or [],
                        'resources': rule.resources or [],
                        'verbs': rule.verbs or []
                    } for rule in (role.rules or [])
                ]
            } for role in cluster_roles.items
        ]

        # 3. Database User Permissions
        evidence['database_users'] = await self._collect_db_permissions()

        return {
            'control_id': 'CC6.1',
            'evidence_type': 'access_controls',
            'collection_date': datetime.now().isoformat(),
            'data': evidence
        }

    async def _collect_db_permissions(self) -> List[Dict[str, Any]]:
        """Collect database user permissions"""
        db_config = self.config['database']
        conn = psycopg2.connect(
            host=db_config['host'],
            port=db_config['port'],
            database=db_config['name'],
            user=db_config['user'],
            password=os.getenv('DB_PASSWORD')
        )

        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                r.rolname as username,
                r.rolsuper as is_superuser,
                r.rolcreaterole as can_create_roles,
                r.rolcreatedb as can_create_databases,
                r.rolcanlogin as can_login,
                r.rolreplication as replication_privilege
            FROM pg_roles r
            WHERE r.rolcanlogin = true
            ORDER BY r.rolname;
        """)

        db_users = []
        for row in cursor.fetchall():
            db_users.append({
                'username': row[0],
                'is_superuser': row[1],
                'can_create_roles': row[2],
                'can_create_databases': row[3],
                'can_login': row[4],
                'replication_privilege': row[5]
            })

        conn.close()
        return db_users

    async def collect_security_monitoring(self) -> Dict[str, Any]:
        """CC6.2: Security Monitoring"""
        evidence = {}

        # 1. CloudTrail Logs
        cloudtrail = self.aws_session.client('cloudtrail')
        events = cloudtrail.lookup_events(
            StartTime=datetime.strptime(self.period['start'], '%Y-%m-%d'),
            EndTime=datetime.strptime(self.period['end'], '%Y-%m-%d'),
            MaxItems=1000
        )

        evidence['cloudtrail_events_sample'] = [
            {
                'event_time': event['EventTime'].isoformat(),
                'event_name': event['EventName'],
                'user_name': event.get('Username', 'N/A'),
                'source_ip': event.get('SourceIPAddress', 'N/A'),
                'user_agent': event.get('UserAgent', 'N/A')
            } for event in events['Events'][:100]  # Sample of 100 events
        ]

        # 2. Security Hub Findings
        securityhub = self.aws_session.client('securityhub')
        findings = securityhub.get_findings(
            Filters={
                'CreatedAt': [
                    {
                        'Start': self.period['start'] + 'T00:00:00.000Z',
                        'End': self.period['end'] + 'T23:59:59.999Z'
                    }
                ]
            },
            MaxResults=100
        )

        evidence['security_findings'] = [
            {
                'finding_id': finding['Id'],
                'title': finding['Title'],
                'severity': finding['Severity']['Label'],
                'compliance_status': finding.get('Compliance', {}).get('Status', 'N/A'),
                'created_at': finding['CreatedAt']
            } for finding in findings['Findings']
        ]

        # 3. Prometheus Alerting Rules
        prometheus_config = self.config.get('prometheus', {})
        if prometheus_config:
            evidence['alerting_rules'] = await self._collect_prometheus_rules()

        return {
            'control_id': 'CC6.2',
            'evidence_type': 'security_monitoring',
            'collection_date': datetime.now().isoformat(),
            'data': evidence
        }

    async def _collect_prometheus_rules(self) -> List[Dict[str, Any]]:
        """Collect Prometheus alerting rules"""
        prometheus_url = self.config['prometheus']['url']

        # Get alerting rules
        response = requests.get(f"{prometheus_url}/api/v1/rules")
        rules_data = response.json()

        alerting_rules = []
        for group in rules_data['data']['groups']:
            for rule in group['rules']:
                if rule['type'] == 'alerting':
                    alerting_rules.append({
                        'alert_name': rule['name'],
                        'expression': rule['query'],
                        'duration': rule.get('duration', '0s'),
                        'severity': rule.get('labels', {}).get('severity', 'unknown'),
                        'description': rule.get('annotations', {}).get('description', '')
                    })

        return alerting_rules

class AvailabilityEvidenceCollector:
    """Collect Availability (CC7.0) related evidence"""

    def __init__(self, config: Dict[str, Any], period: Dict[str, str]):
        self.config = config
        self.period = period

    async def collect_uptime_monitoring(self) -> Dict[str, Any]:
        """CC7.1: Uptime and Performance Monitoring"""
        evidence = {}

        # 1. Prometheus uptime metrics
        prometheus_url = self.config['prometheus']['url']

        # Query uptime metrics
        uptime_query = 'up{job=~"chai-.*"}'
        response = requests.get(f"{prometheus_url}/api/v1/query", params={
            'query': uptime_query
        })
        uptime_data = response.json()

        evidence['service_uptime'] = [
            {
                'instance': metric['metric']['instance'],
                'job': metric['metric']['job'],
                'status': 'up' if metric['value'][1] == '1' else 'down',
                'timestamp': datetime.fromtimestamp(float(metric['value'][0])).isoformat()
            } for metric in uptime_data['data']['result']
        ]

        # 2. SLA/SLO compliance
        evidence['slo_compliance'] = await self._calculate_slo_compliance()

        # 3. Incident response metrics
        evidence['incident_metrics'] = await self._collect_incident_metrics()

        return {
            'control_id': 'CC7.1',
            'evidence_type': 'availability_monitoring',
            'collection_date': datetime.now().isoformat(),
            'data': evidence
        }

    async def _calculate_slo_compliance(self) -> List[Dict[str, Any]]:
        """Calculate SLO compliance over audit period"""
        prometheus_url = self.config['prometheus']['url']

        # Define SLO targets
        slo_targets = [
            {
                'name': 'API Response Time',
                'query': 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
                'threshold': 0.5,  # 500ms
                'target': 99.5  # 99.5% of requests under 500ms
            },
            {
                'name': 'API Availability',
                'query': 'rate(http_requests_total{code!~"5.."}[5m]) / rate(http_requests_total[5m])',
                'threshold': 0.999,  # 99.9%
                'target': 99.9
            }
        ]

        slo_compliance = []
        for slo in slo_targets:
            # Query over audit period (simplified - would need proper range query)
            response = requests.get(f"{prometheus_url}/api/v1/query", params={
                'query': slo['query']
            })

            data = response.json()
            if data['data']['result']:
                current_value = float(data['data']['result'][0]['value'][1])
                compliance_status = 'compliant' if current_value >= slo['threshold'] else 'non_compliant'

                slo_compliance.append({
                    'slo_name': slo['name'],
                    'target_percentage': slo['target'],
                    'current_value': current_value,
                    'compliance_status': compliance_status,
                    'measurement_date': datetime.now().isoformat()
                })

        return slo_compliance

    async def _collect_incident_metrics(self) -> Dict[str, Any]:
        """Collect incident response metrics"""
        # This would integrate with incident management system (PagerDuty, etc.)
        # For now, return mock data structure
        return {
            'total_incidents': 12,
            'p1_incidents': 2,
            'p2_incidents': 5,
            'p3_incidents': 5,
            'mean_time_to_acknowledge_minutes': 8.5,
            'mean_time_to_resolution_hours': 2.3,
            'sla_violations': 1
        }

class ProcessingIntegrityEvidenceCollector:
    """Collect Processing Integrity (CC8.0) related evidence"""

    def __init__(self, config: Dict[str, Any], period: Dict[str, str]):
        self.config = config
        self.period = period

    async def collect_data_processing_controls(self) -> Dict[str, Any]:
        """CC8.1: Data Processing Controls"""
        evidence = {}

        # 1. Application logs showing processing validation
        evidence['processing_validation_logs'] = await self._collect_validation_logs()

        # 2. Database integrity constraints
        evidence['database_constraints'] = await self._collect_db_constraints()

        # 3. Blockchain proof verification logs
        evidence['zkp_verification_logs'] = await self._collect_zkp_logs()

        # 4. Smart contract audit results
        evidence['smart_contract_audits'] = await self._collect_contract_audits()

        return {
            'control_id': 'CC8.1',
            'evidence_type': 'data_processing_controls',
            'collection_date': datetime.now().isoformat(),
            'data': evidence
        }

    async def _collect_validation_logs(self) -> List[Dict[str, Any]]:
        """Collect application validation logs"""
        # Query application logs from centralized logging
        log_query = {
            'query': {
                'bool': {
                    'must': [
                        {'match': {'level': 'INFO'}},
                        {'match': {'message': 'validation'}},
                        {'range': {
                            'timestamp': {
                                'gte': self.period['start'],
                                'lte': self.period['end']
                            }
                        }}
                    ]
                }
            },
            'size': 1000
        }

        # Mock response - would integrate with Elasticsearch
        return [
            {
                'timestamp': '2024-01-15T10:30:00Z',
                'service': 'credential-verifier',
                'level': 'INFO',
                'message': 'Credential validation successful',
                'validation_type': 'schema_validation',
                'credential_id': 'cred_123456'
            }
        ]

    async def _collect_zkp_logs(self) -> List[Dict[str, Any]]:
        """Collect zero-knowledge proof verification logs"""
        # Query ZKP verification logs
        return [
            {
                'timestamp': '2024-01-15T14:22:00Z',
                'proof_id': 'proof_789abc',
                'verification_result': 'valid',
                'circuit_hash': '0x1234567890abcdef',
                'verifier_node': 'verifier-node-1',
                'gas_used': 145000
            }
        ]

class ConfidentialityEvidenceCollector:
    """Collect Confidentiality (CC6.7) related evidence"""

    def __init__(self, config: Dict[str, Any], period: Dict[str, str]):
        self.config = config
        self.period = period

    async def collect_encryption_evidence(self) -> Dict[str, Any]:
        """CC6.7: Confidentiality Controls"""
        evidence = {}

        # 1. Encryption at rest configuration
        evidence['encryption_at_rest'] = await self._collect_encryption_at_rest()

        # 2. Encryption in transit configuration
        evidence['encryption_in_transit'] = await self._collect_encryption_in_transit()

        # 3. Key management evidence
        evidence['key_management'] = await self._collect_key_management()

        return {
            'control_id': 'CC6.7',
            'evidence_type': 'confidentiality_controls',
            'collection_date': datetime.now().isoformat(),
            'data': evidence
        }

    async def _collect_encryption_at_rest(self) -> Dict[str, Any]:
        """Collect encryption at rest evidence"""
        aws_session = boto3.Session()

        # RDS encryption
        rds_client = aws_session.client('rds')
        db_instances = rds_client.describe_db_instances()

        rds_encryption = []
        for instance in db_instances['DBInstances']:
            rds_encryption.append({
                'db_instance_id': instance['DBInstanceIdentifier'],
                'encrypted': instance.get('StorageEncrypted', False),
                'kms_key_id': instance.get('KmsKeyId', 'N/A')
            })

        # S3 bucket encryption
        s3_client = aws_session.client('s3')
        buckets = s3_client.list_buckets()

        s3_encryption = []
        for bucket in buckets['Buckets']:
            try:
                encryption_config = s3_client.get_bucket_encryption(
                    Bucket=bucket['Name']
                )
                s3_encryption.append({
                    'bucket_name': bucket['Name'],
                    'encrypted': True,
                    'encryption_config': encryption_config['ServerSideEncryptionConfiguration']
                })
            except s3_client.exceptions.ClientError:
                s3_encryption.append({
                    'bucket_name': bucket['Name'],
                    'encrypted': False,
                    'encryption_config': None
                })

        return {
            'rds_encryption': rds_encryption,
            's3_encryption': s3_encryption
        }

class PrivacyEvidenceCollector:
    """Collect Privacy (CC6.8) related evidence"""

    def __init__(self, config: Dict[str, Any], period: Dict[str, str]):
        self.config = config
        self.period = period

    async def collect_privacy_controls(self) -> Dict[str, Any]:
        """CC6.8: Privacy Controls"""
        evidence = {}

        # 1. Data subject request logs
        evidence['data_subject_requests'] = await self._collect_dsr_logs()

        # 2. Consent management logs
        evidence['consent_management'] = await self._collect_consent_logs()

        # 3. Data retention compliance
        evidence['data_retention'] = await self._collect_retention_evidence()

        return {
            'control_id': 'CC6.8',
            'evidence_type': 'privacy_controls',
            'collection_date': datetime.now().isoformat(),
            'data': evidence
        }

    async def _collect_dsr_logs(self) -> List[Dict[str, Any]]:
        """Collect data subject request logs"""
        # Mock DSR logs - would query from privacy management system
        return [
            {
                'request_id': 'dsr_001',
                'request_type': 'erasure',
                'submitted_date': '2024-01-10T09:00:00Z',
                'completed_date': '2024-01-12T16:30:00Z',
                'status': 'completed',
                'data_subject_id': 'subj_hash_abc123'
            }
        ]

# Main execution function
async def main():
    """Main evidence collection execution"""
    try:
        collector = SOC2EvidenceCollector()

        # Collect all evidence categories
        evidence_report = await collector.collect_all_evidence()

        # Save evidence report
        output_file = f"/var/soc2-evidence/report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        with open(output_file, 'w') as f:
            json.dump(evidence_report, f, indent=2, default=str)

        logger.info(f"SOC2 evidence collection completed. Report saved to: {output_file}")

        # Generate summary
        print("\n=== SOC2 Evidence Collection Summary ===")
        for category, data in evidence_report.items():
            if isinstance(data, dict) and 'status' in data:
                status = data['status']
                print(f"{category.upper()}: {status}")
            else:
                print(f"{category.upper()}: collected")

        return evidence_report

    except Exception as e:
        logger.error(f"Evidence collection failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())