export interface QualificationRecord {
    id: string;
    practitionerId: string;
    code: string;
    issuer?: string;
    periodStart?: string;
    periodEnd?: string;
}

export interface PractitionerResource {
    resourceType: 'Practitioner';
    id: string;
    qualification: {
        identifier?: { value: string }[];
        code: { text: string };
        issuer?: { display: string };
        period?: { start?: string; end?: string };
    }[];
}

/**
 * Convert an internal qualification record to a minimal FHIR Practitioner
 * representation with a single qualification. This structure can be used by
 * verifiers to download a practitioner's qualification in a standard format.
 */
export function exportPractitionerQualificationFhir(record: QualificationRecord): PractitionerResource {
    return {
        resourceType: 'Practitioner',
        id: record.practitionerId,
        qualification: [
            {
                identifier: record.id ? [{ value: record.id }] : undefined,
                code: { text: record.code },
                issuer: record.issuer ? { display: record.issuer } : undefined,
                period:
                    record.periodStart || record.periodEnd
                        ? { start: record.periodStart, end: record.periodEnd }
                        : undefined,
            },
        ],
    };
}
