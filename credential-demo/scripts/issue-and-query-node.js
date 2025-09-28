const fs = require('fs');
const solc = require('solc');

async function compileContract() {
  const source = fs.readFileSync('contracts/CredentialRegistry.sol', 'utf8');
  const input = {
    language: 'Solidity',
    sources: {
      'CredentialRegistry.sol': { content: source }
    },
    settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } }
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const contract = output.contracts['CredentialRegistry.sol']['CredentialRegistry'];
  return { abi: contract.abi, bytecode: contract.evm.bytecode.object };
}

async function main() {
  const { ContractFactory, JsonRpcProvider } = await import('ethers');
  const { abi, bytecode } = await compileContract();
  const provider = new JsonRpcProvider('http://127.0.0.1:8545');
  const deployer = await provider.getSigner(0);
  const factory = new ContractFactory(abi, bytecode, deployer);
  const registry = await factory.deploy();
  await registry.waitForDeployment();

  const accounts = await provider.listAccounts();
  if (accounts.length < 2) {
    throw new Error('Need at least two local accounts to run the demo');
  }

  const userAddress = accounts[1];
  const userSigner = await provider.getSigner(userAddress);
  const credential = 'Certified Nurse';
  const tx = await registry.connect(userSigner).issueCredential(userAddress, credential);
  await tx.wait();

  const stored = await registry.credentials(userAddress);
  console.log('Credential stored on-chain:', stored);
}

main().catch(err => { console.error(err); process.exit(1); });
