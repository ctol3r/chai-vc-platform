export interface RiskCheck {
    name: string;
    evaluate(): Promise<number>;
}

export interface RiskResult {
    check: string;
    score: number;
}

export class RiskEngine {
    private checks: RiskCheck[];

    constructor(checks: RiskCheck[]) {
        this.checks = checks;
    }

    async calculateCompositeScore(): Promise<{score: number; details: RiskResult[]}> {
        if (this.checks.length === 0) {
            return {score: 0, details: []};
        }
        const details: RiskResult[] = [];
        for (const c of this.checks) {
            const score = await c.evaluate();
            details.push({check: c.name, score});
        }
        const total = details.reduce((acc, d) => acc + d.score, 0);
        const composite = total / this.checks.length;
        return {score: composite, details};
    }
}
