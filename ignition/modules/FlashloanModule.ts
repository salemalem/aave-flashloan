// scripts/deployFlashloan.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

const FlashloanModule = buildModule("FlashloanModule", (m) => {
    // Configuration - Aave V3 Pool Addresses Provider on Arbitrum
    const aaveProviderAddress = m.getParameter(
    "aaveProviderAddress",
    "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb" // Arbitrum mainnet
    );

    const uniswapRouterAddress = m.getParameter(
        "uniswapRouterAddress",
        "0xE592427A0AEce92De3Edee1F18E0157C05861564" // Uniswap V2 Router on Arbitrum 
    );

    // Deploy FlashloanManager contract
    // const flashloanManager = m.contract("FlashloanManager", [aaveProviderAddress]);
    const flashloanArbitrageManager = m.contract("FlashloanArbitrage", [
        aaveProviderAddress,
        uniswapRouterAddress,
    ]);

    // Return the deployed contract for potential use in other modules
    return { flashloanArbitrageManager };
});

export default FlashloanModule;