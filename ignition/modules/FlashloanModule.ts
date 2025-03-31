// scripts/deployFlashloan.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

const FlashloanModule = buildModule("FlashloanModule", (m) => {
    // Configuration - Aave V3 Pool Addresses Provider on Arbitrum
    const aaveProviderAddress = m.getParameter(
    "aaveProviderAddress",
    "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb" // Arbitrum mainnet
    );

    // Deploy FlashloanManager contract
    const flashloanManager = m.contract("FlashloanManager", [aaveProviderAddress]);

    // Return the deployed contract for potential use in other modules
    return { flashloanManager };
});

export default FlashloanModule;