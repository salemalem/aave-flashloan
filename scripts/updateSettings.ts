import { ethers } from "hardhat";

async function main() {
  // Address of the deployed PortfolioManager contract
  const contractAddress = "0x19D40dEf73c686FC33bEfc90fFEe516213813D2D";

  // Parameters for the updateSettings function
  const newAcceptedTokenAddress = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
  const newPortfolioCreationFee = ethers.parseUnits("0.1", 6); // 0.1 USDT (assuming USDT has 6 decimals)
  const newMaxAssets = 10; // Example value

  // Get the contract factory and attach to the deployed address
  const PortfolioManager = await ethers.getContractFactory("PortfolioManager");
  const portfolioManager = PortfolioManager.attach(contractAddress);

  // Ensure the signer is the owner of the contract
  const [owner] = await ethers.getSigners();
  const contractOwner = await portfolioManager.owner();
  if (owner.address !== contractOwner) {
    throw new Error("Signer is not the owner of the contract");
  }

  // Update the contract settings
  const tx = await portfolioManager.updateSettings(
    newAcceptedTokenAddress,
    newPortfolioCreationFee,
    newMaxAssets
  );

  // Wait for the transaction to be mined
  await tx.wait();

  console.log("Contract settings updated successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
