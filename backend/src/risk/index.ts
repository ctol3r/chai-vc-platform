import { RiskEngine } from './risk_engine';
import { StaticRiskCheck, RandomRiskCheck } from './sample_checks';

async function demo() {
    const checks = [
        new StaticRiskCheck('identity-verification', 0.1),
        new StaticRiskCheck('license-verification', 0.2),
        new RandomRiskCheck('background-check'),
    ];
    const engine = new RiskEngine(checks);
    const result = await engine.calculateCompositeScore();
    console.log('Composite risk score:', result.score.toFixed(2));
    result.details.forEach(d => {
        console.log(` - ${d.check}: ${d.score.toFixed(2)}`);
    });
}

demo();
