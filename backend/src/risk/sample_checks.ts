import { RiskCheck } from './risk_engine';

export class StaticRiskCheck implements RiskCheck {
    name: string;
    private value: number;

    constructor(name: string, value: number) {
        this.name = name;
        this.value = value;
    }

    async evaluate(): Promise<number> {
        return this.value;
    }
}

export class RandomRiskCheck implements RiskCheck {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    async evaluate(): Promise<number> {
        return Math.random();
    }
}
