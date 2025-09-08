import "@nomicfoundation/hardhat-ethers";
import ethersChaiMatchersPlugin from "@nomicfoundation/hardhat-ethers-chai-matchers";

/** @type import("hardhat/config").HardhatUserConfig */
export default {
  solidity: "0.8.20",
  plugins: [ethersChaiMatchersPlugin]
};
