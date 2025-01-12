import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

export default buildModule("MockERC20Module", (m) => {
  // Deploy the MockERC20 contract with specified parameters
  const mockERC20 = m.contract("MockERC20", [
    "Mock Token",   // Token name
    "MCK",          // Token symbol
    ethers.parseUnits("1000000", 18), // Initial supply: 1,000,000 tokens with 18 decimals
  ]);

  return { mockERC20 };
});
