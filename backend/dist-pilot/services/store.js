"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const db = new Map();
exports.store = {
    async setIssued(id, record) {
        db.set(id, { ...record, status: "ACTIVE" });
    },
    async setStatus(id, status) {
        const cur = db.get(id) || { status: "ACTIVE", jwt: "", subjectId: "" };
        db.set(id, { ...cur, status });
    },
    async getStatus(id) {
        return db.get(id)?.status ?? "EXPIRED";
    },
    async findBySubject(subjectId) {
        return [...db.entries()]
            .filter(([, v]) => v.subjectId === subjectId)
            .map(([credentialId, v]) => ({ credentialId, status: v.status }));
    },
    async getCredential(id) {
        return db.get(id);
    }
};

