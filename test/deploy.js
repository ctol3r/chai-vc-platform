import { strict as assert } from 'assert';
import hardhat from 'hardhat';

const { ethers } = hardhat;

describe('ReputationSBT', function () {
  it('should deploy and mint', async function () {
    const [issuer, receiver] = await ethers.getSigners();
    const ReputationSBT = await ethers.getContractFactory('ReputationSBT');
    const sbt = await ReputationSBT.deploy('ReputationBadge', 'RBT');
    await sbt.deployed();

    const tx = await sbt.connect(issuer).issue(receiver.address, 2);
    await tx.wait();

    assert.equal(await sbt.ownerOf(1), receiver.address);
    assert.equal(await sbt.burnAuth(1), 2);
  });
});
