const hre = require("hardhat");

async function main() {
  await hre.run("compile");

  const Verifier = await hre.ethers.getContractFactory("SelectiveDisclosureVerifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();

  console.log("Verifier deployed to:", verifier.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
