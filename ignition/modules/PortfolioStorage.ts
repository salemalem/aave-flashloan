import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

export default buildModule("PortfolioStorageModule", (m) => {
  // Step 1: Deploy the PortfolioStorage implementation contract
  console.log("Deploying PortfolioStorage implementation contract...");
  const portfolioStorageImpl = m.contract("PortfolioStorage");

  // Step 2: Deploy the ProxyAdmin contract
  console.log("Deploying ProxyAdmin contract...");
  const proxyAdmin = m.contract("MyProxyAdmin");

  // Step 3: Retrieve the contract interface and encode initialization data
  const initData = new ethers.Interface([
    "function initialize()"
  ]).encodeFunctionData("initialize");
  
  // Step 4: Deploy the TransparentUpgradeableProxy contract
  console.log("Deploying TransparentUpgradeableProxy contract...");
  console.log("PortfolioStorage implementation address:", portfolioStorageImpl);
  console.log("ProxyAdmin address:", proxyAdmin);
  console.log("Initialization data:", initData);
  const transparentProxy = m.contract("MyTransparentUpgradeableProxy", [
    portfolioStorageImpl, // Logic contract address (PortfolioStorage implementation)
    proxyAdmin, // Admin address (ProxyAdmin)
    initData, // Initialization data for PortfolioStorage
  ]);

  // Step 5: Return the deployed contracts
  return { portfolioStorageImpl, proxyAdmin, transparentProxy };
});
