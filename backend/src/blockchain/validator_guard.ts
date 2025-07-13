export function isTrustedValidator(): boolean {
    const entityId = process.env.HEALTHCARE_ENTITY_ID;
    const trusted = process.env.TRUSTED_HEALTHCARE_ENTITIES;
    if (!entityId || !trusted) {
        return false;
    }
    const allowed = trusted.split(',').map(id => id.trim());
    return allowed.includes(entityId.trim());
}

export function ensureTrustedValidator(): void {
    if (!isTrustedValidator()) {
        throw new Error('Validator node not running on trusted healthcare entity.');
    }
}
