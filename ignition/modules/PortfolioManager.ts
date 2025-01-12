import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


/*
* Arbitrum USDT address: 0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9
* BNB      USDT address: 0x55d398326f99059ff775485246999027b3197955
* 
* 
* Arbitrum USDT decimals: 6
* BNB      USDT decimals: 18
*/

export default buildModule("PortfolioManagerModule", (m) => {
  const deployer = m.getAccount(0);
  console.log("Deploying contracts with the account:", deployer);

  // Deploy the PortfolioLib library
  const portfolioLib = m.library("PortfolioLib");

  // Deploy the PortfolioStorage contract
  const portfolioStorage = m.contract("PortfolioStorage", [], {
    libraries: {
      // PortfolioLib: portfolioLib,
    },
  });

  // Deploy the PortfolioManager contract with its constructor arguments
  const acceptedTokenAddress = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"; // Replace with the actual token address
  const portfolioCreationFee = 1 * 10 ** 6; // Example: 1 token as the fee (adjust decimals accordingly)
  const maxAssets = 15; // Maximum number of assets allowed in a portfolio
  const initialPortfolioTypes = ["Crypto", "Equities"]; // Example portfolio types

  const portfolioManager = m.contract("PortfolioManager", [
    acceptedTokenAddress,
    portfolioCreationFee,
    maxAssets,
    portfolioStorage
  ], {
    libraries: {
      PortfolioLib: portfolioLib,
    },
  });

  m.call(portfolioStorage, "authorizeAddress", [portfolioManager]);

  // Example: Add a new portfolio type after deployment
//   m.call(portfolioManager, "addPortfolioType", ["RealEstate"]);

  // Example: Start a round after deployment with a duration of 7 days (in seconds)
//   m.call(portfolioManager, "startRound", [7 * 24 * 60 * 60]);

return { portfolioLib, portfolioStorage, portfolioManager };
});
