import hardhat from "hardhat";
import { expect } from "chai";

const { ethers } = hardhat;

describe("MatchingPool", function () {
  it("allocates sponsor funds proportionally to unique contributors", async () => {
    const [sponsor, alice, bob, charlie, projectA, projectB] = await ethers.getSigners();

    const MatchingPool = await ethers.getContractFactory("MatchingPool");
    const pool = await MatchingPool.deploy();
    await pool.deployed();

    await pool.connect(sponsor).addSponsorFunds({ value: ethers.utils.parseEther("10") });

    await pool.connect(alice).contribute(projectA.address, { value: ethers.utils.parseEther("1") });
    await pool.connect(bob).contribute(projectA.address, { value: ethers.utils.parseEther("1") });
    await pool.connect(charlie).contribute(projectB.address, { value: ethers.utils.parseEther("1") });

    await pool.allocate();

    const balBeforeA = await ethers.provider.getBalance(projectA.address);
    const balBeforeB = await ethers.provider.getBalance(projectB.address);

    await pool.withdrawMatch(projectA.address);
    await pool.withdrawMatch(projectB.address);

    const balAfterA = await ethers.provider.getBalance(projectA.address);
    const balAfterB = await ethers.provider.getBalance(projectB.address);

    const receivedA = balAfterA.sub(balBeforeA);
    const receivedB = balAfterB.sub(balBeforeB);

    expect(receivedA).to.be.closeTo(ethers.utils.parseEther("8"), ethers.utils.parseEther("0.1"));
    expect(receivedB).to.be.closeTo(ethers.utils.parseEther("4"), ethers.utils.parseEther("0.1"));
  });
});
