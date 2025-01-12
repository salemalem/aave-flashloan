import { ethers } from "hardhat";

async function main() {
  // Deployed contract address from your deployment
  const contractAddress = "0xE5A73eFa988C246cAf743A715a7319011e562b34";

  // Get the contract factory and attach to deployed address
  const GoldPrice = await ethers.getContractFactory("GoldPrice");
  const goldPriceConsumer = GoldPrice.attach(contractAddress);

  // Fetch the latest gold price
  const goldPrice = await goldPriceConsumer.getLatestGoldPrice();
  console.log("Latest Gold Price (scaled by 10^8):", goldPrice.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
