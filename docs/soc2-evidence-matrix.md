# SOC2 Evidence Matrix & Collection Automation

## Executive Summary

This document provides a comprehensive mapping of SOC 2 Type II controls to evidence artifacts for the Chai VC Platform, including automated collection procedures to ensure continuous compliance readiness. The matrix covers all five Trust Service Categories with healthcare-specific considerations.

## SOC 2 Trust Service Categories Overview

### Trust Service Categories
```typescript
enum TrustServiceCategory {
  SECURITY = 'CC1', // Common Criteria - Security
  AVAILABILITY = 'A1', // Availability
  PROCESSING_INTEGRITY = 'PI1', // Processing Integrity
  CONFIDENTIALITY = 'C1', // Confidentiality
  PRIVACY = 'P1' // Privacy
}

interface SOC2Control {
  id: string;
  category: TrustServiceCategory;
  title: string;
  description: string;
  testingFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  evidenceTypes: string[];
  automationLevel: 'Fully Automated' | 'Partially Automated' | 'Manual';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}
```

## Security Controls (CC1.0 - CC8.0)

### CC1.0 - Control Environment
```json
{
  "CC1.1": {
    "title": "Commitment to Integrity and Ethical Values",
    "evidenceArtifacts": [
      {
        "type": "Policy Document",
        "name": "Code of Conduct",
        "location": "docs/policies/code-of-conduct.pdf",
        "automation": "Document Version Control System",
        "collection_frequency": "Quarterly",
        "responsible_party": "HR Department"
      },
      {
        "type": "Training Records",
        "name": "Ethics Training Completion",
        "location": "hr-system/training-records/ethics-2024",
        "automation": "LMS API Integration",
        "collection_frequency": "Monthly",
        "responsible_party": "HR System"
      },
      {
        "type": "Incident Reports",
        "name": "Ethics Violations Log",
        "location": "compliance/incidents/ethics-violations.json",
        "automation": "Automated Incident Tracking",
        "collection_frequency": "Real-time",
        "responsible_party": "Compliance Officer"
      }
    ]
  },
  "CC1.2": {
    "title": "Board Independence and Oversight",
    "evidenceArtifacts": [
      {
        "type": "Meeting Minutes",
        "name": "Board Meeting Records",
        "location": "governance/board-meetings/",
        "automation": "Meeting Management System",
        "collection_frequency": "Quarterly",
        "responsible_party": "Board Secretary"
      },
      {
        "type": "Independence Declarations",
        "name": "Director Independence Statements",
        "location": "governance/independence-declarations/",
        "automation": "Annual Attestation System",
        "collection_frequency": "Annually",
        "responsible_party": "Legal Department"
      }
    ]
  }
}
```

### CC2.0 - Communication and Information
```typescript
class CommunicationControlEvidence {
  private evidenceCollector: EvidenceCollector;

  async collectCC2Evidence(): Promise<ControlEvidence> {
    return {
      'CC2.1': await this.collectInternalCommunicationEvidence(),
      'CC2.2': await this.collectExternalCommunicationEvidence(),
      'CC2.3': await this.collectSecurityPolicyEvidence()
    };
  }

  private async collectInternalCommunicationEvidence(): Promise<EvidenceArtifact[]> {
    return [
      {
        controlId: 'CC2.1',
        artifactType: 'Communication Logs',
        source: 'Slack/Discord Integration',
        evidence: await this.slackAPI.getSecurityChannelMessages(),
        automationScript: 'scripts/collect-slack-security-comms.js',
        lastCollection: new Date(),
        nextCollection: this.addDays(new Date(), 7)
      },
      {
        controlId: 'CC2.1',
        artifactType: 'Security Awareness Training',
        source: 'Learning Management System',
        evidence: await this.lmsAPI.getTrainingCompletionRates(),
        automationScript: 'scripts/collect-training-data.js',
        lastCollection: new Date(),
        nextCollection: this.addDays(new Date(), 30)
      }
    ];
  }
}
```

### CC3.0 - Risk Assessment
```yaml
CC3.1_Risk_Management_Process:
  evidence_artifacts:
    - type: "Risk Register"
      location: "risk-management/risk-register.xlsx"
      automation: "Risk Management Tool API"
      collection_script: "scripts/export-risk-register.py"
      frequency: "Monthly"

    - type: "Risk Assessment Reports"
      location: "risk-management/assessments/"
      automation: "Automated Risk Scoring"
      collection_script: "scripts/generate-risk-report.js"
      frequency: "Quarterly"

    - type: "Threat Intelligence Reports"
      location: "security/threat-intel/"
      automation: "Security Platform Integration"
      collection_script: "scripts/collect-threat-intel.py"
      frequency: "Weekly"

CC3.2_Risk_Identification:
  evidence_artifacts:
    - type: "Vulnerability Scan Results"
      location: "security/vulnerability-scans/"
      automation: "Nessus/OpenVAS Integration"
      collection_script: "scripts/export-vuln-scans.sh"
      frequency: "Daily"

    - type: "Penetration Test Reports"
      location: "security/pen-test-reports/"
      automation: "Manual Upload + Notification"
      collection_script: "scripts/process-pentest-reports.py"
      frequency: "Quarterly"
```

## Availability Controls (A1.0)

### A1.0 - System Availability
```python
# Automated availability evidence collection
class AvailabilityEvidenceCollector:
    def __init__(self):
        self.prometheus_client = PrometheusClient()
        self.grafana_client = GrafanaClient()
        self.pagerduty_client = PagerDutyClient()

    async def collect_a1_evidence(self):
        return {
            'A1.1': await self.collect_system_monitoring_evidence(),
            'A1.2': await self.collect_incident_response_evidence(),
            'A1.3': await self.collect_capacity_management_evidence()
        }

    async def collect_system_monitoring_evidence(self):
        # Collect uptime metrics
        uptime_metrics = await self.prometheus_client.query_range(
            'up{job="chai-vc-platform"}',
            start_time=datetime.now() - timedelta(days=30),
            end_time=datetime.now()
        )

        # Collect performance metrics
        performance_metrics = await self.prometheus_client.query_range(
            'http_request_duration_seconds{job="chai-vc-api"}',
            start_time=datetime.now() - timedelta(days=30),
            end_time=datetime.now()
        )

        # Generate availability report
        availability_report = {
            'period': '30_days',
            'uptime_percentage': self.calculate_uptime(uptime_metrics),
            'avg_response_time': self.calculate_avg_response_time(performance_metrics),
            'incidents': await self.pagerduty_client.get_incidents(),
            'sla_compliance': self.check_sla_compliance(uptime_metrics)
        }

        return {
            'artifact_type': 'System Availability Report',
            'data': availability_report,
            'collection_timestamp': datetime.now(),
            'automated': True
        }

    def calculate_uptime(self, metrics):
        total_samples = len(metrics)
        up_samples = sum(1 for m in metrics if m['value'] == '1')
        return (up_samples / total_samples) * 100 if total_samples > 0 else 0
```

## Processing Integrity Controls (PI1.0)

### PI1.0 - Processing Integrity
```typescript
interface ProcessingIntegrityEvidence {
  controlId: string;
  evidenceType: 'Data Validation' | 'Processing Controls' | 'Error Handling';
  artifacts: ProcessingArtifact[];
}

class ProcessingIntegrityCollector {
  async collectPI1Evidence(): Promise<ProcessingIntegrityEvidence[]> {
    return [
      await this.collectDataValidationEvidence(),
      await this.collectProcessingControlsEvidence(),
      await this.collectErrorHandlingEvidence()
    ];
  }

  private async collectDataValidationEvidence(): Promise<ProcessingIntegrityEvidence> {
    // Collect input validation logs
    const validationLogs = await this.logAnalyzer.getValidationEvents({
      timeRange: '30d',
      service: 'credential-verification',
      eventType: 'validation_failure'
    });

    // Collect data integrity checks
    const integrityChecks = await this.databaseService.runIntegrityChecks([
      'credential_hash_validation',
      'signature_verification',
      'timestamp_consistency'
    ]);

    return {
      controlId: 'PI1.1',
      evidenceType: 'Data Validation',
      artifacts: [
        {
          type: 'Validation Logs',
          data: validationLogs,
          automation: 'Log Analysis Pipeline',
          collectionScript: 'scripts/collect-validation-logs.js'
        },
        {
          type: 'Integrity Check Results',
          data: integrityChecks,
          automation: 'Database Monitoring',
          collectionScript: 'scripts/run-integrity-checks.sql'
        }
      ]
    };
  }
}
```

## Confidentiality Controls (C1.0)

### C1.0 - Confidentiality
```sql
-- Automated data classification evidence collection
CREATE OR REPLACE PROCEDURE collect_confidentiality_evidence()
AS $$
DECLARE
    classification_report JSONB;
    encryption_status JSONB;
    access_controls JSONB;
BEGIN
    -- Collect data classification evidence
    SELECT jsonb_build_object(
        'total_records', COUNT(*),
        'classified_records', COUNT(*) FILTER (WHERE data_classification IS NOT NULL),
        'high_sensitivity', COUNT(*) FILTER (WHERE data_classification = 'HIGH'),
        'medium_sensitivity', COUNT(*) FILTER (WHERE data_classification = 'MEDIUM'),
        'low_sensitivity', COUNT(*) FILTER (WHERE data_classification = 'LOW')
    ) INTO classification_report
    FROM credential_data;

    -- Collect encryption status
    SELECT jsonb_build_object(
        'encrypted_at_rest', COUNT(*) FILTER (WHERE is_encrypted_at_rest = true),
        'encrypted_in_transit', COUNT(*) FILTER (WHERE is_encrypted_in_transit = true),
        'total_sensitive_data', COUNT(*)
    ) INTO encryption_status
    FROM sensitive_data_inventory;

    -- Collect access control evidence
    SELECT jsonb_build_object(
        'total_access_requests', COUNT(*),
        'approved_requests', COUNT(*) FILTER (WHERE status = 'APPROVED'),
        'denied_requests', COUNT(*) FILTER (WHERE status = 'DENIED'),
        'pending_requests', COUNT(*) FILTER (WHERE status = 'PENDING')
    ) INTO access_controls
    FROM access_requests
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

    -- Insert evidence into SOC2 evidence table
    INSERT INTO soc2_evidence (
        control_id,
        evidence_type,
        evidence_data,
        collection_timestamp,
        automated
    ) VALUES (
        'C1.1',
        'Confidentiality Controls',
        jsonb_build_object(
            'data_classification', classification_report,
            'encryption_status', encryption_status,
            'access_controls', access_controls
        ),
        NOW(),
        true
    );

END;
$$ LANGUAGE plpgsql;
```

## Privacy Controls (P1.0) - Healthcare Specific

### P1.0 - Privacy
```typescript
class HealthcarePrivacyEvidenceCollector {
  private hipaaService: HIPAAComplianceService;
  private gdprService: GDPRComplianceService;

  async collectP1Evidence(): Promise<PrivacyEvidence[]> {
    return [
      await this.collectHIPAAEvidence(),
      await this.collectGDPREvidence(),
      await this.collectConsentManagementEvidence(),
      await this.collectDataSubjectRightsEvidence()
    ];
  }

  private async collectHIPAAEvidence(): Promise<PrivacyEvidence> {
    const evidence = {
      controlId: 'P1.1',
      category: 'HIPAA Compliance',
      artifacts: [
        {
          type: 'Business Associate Agreements',
          location: 'legal/hipaa/baa-agreements/',
          data: await this.hipaaService.getBAAStatus(),
          automation: 'Contract Management System',
          script: 'scripts/collect-baa-status.js'
        },
        {
          type: 'Minimum Necessary Assessments',
          location: 'compliance/hipaa/minimum-necessary/',
          data: await this.hipaaService.getMinimumNecessaryReports(),
          automation: 'Data Flow Analysis',
          script: 'scripts/analyze-data-flows.py'
        },
        {
          type: 'Access Logs for PHI',
          location: 'security/access-logs/phi/',
          data: await this.hipaaService.getPHIAccessLogs(),
          automation: 'Log Monitoring System',
          script: 'scripts/collect-phi-access-logs.js'
        },
        {
          type: 'Risk Assessment Reports',
          location: 'risk/hipaa-assessments/',
          data: await this.hipaaService.getRiskAssessments(),
          automation: 'Risk Management Platform',
          script: 'scripts/export-hipaa-risk-assessments.py'
        }
      ]
    };

    return evidence;
  }

  private async collectConsentManagementEvidence(): Promise<PrivacyEvidence> {
    const consentMetrics = await this.database.query(`
      SELECT
        consent_type,
        COUNT(*) as total_consents,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_consents,
        COUNT(*) FILTER (WHERE status = 'WITHDRAWN') as withdrawn_consents,
        AVG(EXTRACT(EPOCH FROM (withdrawn_at - created_at))/86400) as avg_consent_duration_days
      FROM user_consents
      WHERE created_at >= NOW() - INTERVAL '3 months'
      GROUP BY consent_type
    `);

    return {
      controlId: 'P1.2',
      category: 'Consent Management',
      artifacts: [
        {
          type: 'Consent Metrics',
          data: consentMetrics,
          automation: 'Database Query',
          script: 'scripts/collect-consent-metrics.sql'
        },
        {
          type: 'Consent Audit Trail',
          data: await this.getConsentAuditTrail(),
          automation: 'Audit Log System',
          script: 'scripts/collect-consent-audit-trail.js'
        }
      ]
    };
  }
}
```

## Evidence Collection Automation

### Automated Collection Framework
```typescript
class SOC2EvidenceAutomation {
  private collectors: Map<string, EvidenceCollector> = new Map();
  private scheduler: EvidenceScheduler;
  private storage: EvidenceStorage;

  constructor() {
    this.initializeCollectors();
    this.scheduler = new EvidenceScheduler();
    this.storage = new EvidenceStorage();
  }

  private initializeCollectors(): void {
    this.collectors.set('security', new SecurityEvidenceCollector());
    this.collectors.set('availability', new AvailabilityEvidenceCollector());
    this.collectors.set('processing', new ProcessingIntegrityCollector());
    this.collectors.set('confidentiality', new ConfidentialityCollector());
    this.collectors.set('privacy', new HealthcarePrivacyEvidenceCollector());
  }

  async startAutomatedCollection(): Promise<void> {
    // Schedule daily collections
    this.scheduler.schedule('0 2 * * *', async () => {
      await this.collectDailyEvidence();
    });

    // Schedule weekly collections
    this.scheduler.schedule('0 3 * * 0', async () => {
      await this.collectWeeklyEvidence();
    });

    // Schedule monthly collections
    this.scheduler.schedule('0 4 1 * *', async () => {
      await this.collectMonthlyEvidence();
    });

    // Schedule quarterly collections
    this.scheduler.schedule('0 5 1 1,4,7,10 *', async () => {
      await this.collectQuarterlyEvidence();
    });
  }

  private async collectDailyEvidence(): Promise<void> {
    const collections = await Promise.all([
      this.collectors.get('security')?.collectDailyEvidence(),
      this.collectors.get('availability')?.collectDailyEvidence(),
      this.collectors.get('processing')?.collectDailyEvidence()
    ]);

    for (const collection of collections.filter(Boolean)) {
      await this.storage.store(collection);
    }

    await this.notifyCollectionComplete('daily');
  }

  async generateComplianceReport(period: string): Promise<ComplianceReport> {
    const evidence = await this.storage.getEvidenceByPeriod(period);

    return {
      reportPeriod: period,
      generatedAt: new Date(),
      controls: await this.analyzeControlCompliance(evidence),
      gaps: await this.identifyComplianceGaps(evidence),
      recommendations: await this.generateRecommendations(evidence),
      auditReadiness: await this.assessAuditReadiness(evidence)
    };
  }
}
```

### Evidence Collection Scripts

#### Daily Collection Script
```bash
#!/bin/bash
# daily-evidence-collection.sh

set -e

echo "Starting daily SOC2 evidence collection..."

# Security logs
node scripts/collect-security-logs.js --period=1d

# System metrics
python scripts/collect-system-metrics.py --period=24h

# Access controls
./scripts/export-access-controls.sh

# Incident tracking
node scripts/collect-incidents.js --since=yesterday

# Data integrity checks
psql -d chai_vc_platform -f scripts/daily-integrity-checks.sql

echo "Daily evidence collection completed"
```

#### Weekly Collection Script
```python
#!/usr/bin/env python3
# weekly-evidence-collection.py

import asyncio
import logging
from datetime import datetime, timedelta
from evidence_collectors import *

async def collect_weekly_evidence():
    """Collect weekly SOC2 evidence artifacts"""

    collectors = {
        'vulnerability_scans': VulnerabilityScanner(),
        'backup_verifications': BackupVerificationService(),
        'performance_reports': PerformanceMonitor(),
        'user_access_reviews': AccessReviewService(),
        'security_training': TrainingTracker()
    }

    results = {}

    for name, collector in collectors.items():
        try:
            logging.info(f"Collecting {name}...")
            results[name] = await collector.collect_weekly_evidence()
            logging.info(f"✓ {name} collection completed")
        except Exception as e:
            logging.error(f"✗ Failed to collect {name}: {str(e)}")
            results[name] = {'error': str(e)}

    # Store results
    await store_evidence_artifacts(results, 'weekly')

    # Generate summary report
    await generate_weekly_summary(results)

    return results

if __name__ == "__main__":
    asyncio.run(collect_weekly_evidence())
```

### Evidence Storage and Retention

```sql
-- SOC2 Evidence Database Schema
CREATE TABLE soc2_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    control_id VARCHAR(10) NOT NULL,
    control_category VARCHAR(20) NOT NULL,
    evidence_type VARCHAR(100) NOT NULL,
    artifact_location TEXT,
    evidence_data JSONB,
    collection_method VARCHAR(50) NOT NULL, -- 'automated', 'manual', 'hybrid'
    collection_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    collection_script VARCHAR(255),
    responsible_party VARCHAR(100),
    review_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'approved'
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    retention_until DATE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_soc2_evidence_control ON soc2_evidence(control_id, collection_timestamp DESC);
CREATE INDEX idx_soc2_evidence_category ON soc2_evidence(control_category, collection_timestamp DESC);
CREATE INDEX idx_soc2_evidence_retention ON soc2_evidence(retention_until) WHERE review_status = 'approved';

-- Evidence retention policy
CREATE OR REPLACE FUNCTION manage_evidence_retention()
RETURNS void AS $$
BEGIN
    -- Archive old evidence beyond retention period
    WITH archived AS (
        UPDATE soc2_evidence
        SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{archived}', 'true')
        WHERE retention_until < CURRENT_DATE
        AND metadata->>'archived' IS NULL
        RETURNING id
    )
    INSERT INTO soc2_evidence_archive
    SELECT * FROM soc2_evidence WHERE id IN (SELECT id FROM archived);

    -- Delete archived evidence older than 7 years (regulatory requirement)
    DELETE FROM soc2_evidence_archive
    WHERE created_at < CURRENT_DATE - INTERVAL '7 years';

END;
$$ LANGUAGE plpgsql;
```

## Compliance Dashboard

```typescript
interface ComplianceDashboard {
  controlStatus: ControlStatusSummary;
  evidenceCollection: EvidenceCollectionStatus;
  auditReadiness: AuditReadinessScore;
  riskAssessment: RiskSummary;
  upcomingDeadlines: ComplianceDeadline[];
}

class SOC2Dashboard {
  async generateDashboard(): Promise<ComplianceDashboard> {
    const [
      controlStatus,
      evidenceStatus,
      auditReadiness,
      riskSummary,
      deadlines
    ] = await Promise.all([
      this.getControlStatusSummary(),
      this.getEvidenceCollectionStatus(),
      this.calculateAuditReadiness(),
      this.getRiskSummary(),
      this.getUpcomingDeadlines()
    ]);

    return {
      controlStatus,
      evidenceCollection: evidenceStatus,
      auditReadiness,
      riskAssessment: riskSummary,
      upcomingDeadlines: deadlines
    };
  }

  private async calculateAuditReadiness(): Promise<AuditReadinessScore> {
    const evidence = await this.evidenceService.getAllCurrentEvidence();
    const controls = await this.getRequiredControls();

    let readinessScore = 0;
    const scores = {
      evidenceCompleteness: this.calculateEvidenceCompleteness(evidence, controls),
      controlEffectiveness: await this.assessControlEffectiveness(evidence),
      documentationQuality: await this.assessDocumentationQuality(evidence),
      processMaturity: await this.assessProcessMaturity()
    };

    readinessScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 4;

    return {
      overallScore: Math.round(readinessScore),
      breakdown: scores,
      recommendedActions: this.generateReadinessRecommendations(scores),
      estimatedAuditDate: this.estimateAuditReadinessDate(readinessScore)
    };
  }
}
```

---

*Document Version: 1.0*
*Last Updated: September 2025*
*Next Review: December 2025*