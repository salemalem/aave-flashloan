// DEPRECATED
// USE ignition
import { ethers } from "hardhat";
import { GoldPriceConsumer as GoldPriceConsumerType } from "../typechain-types"; // Typechain for Contract deployment
import { Contract } from "ethers"; // Import ethers.Contract for address typing

async function main() {
    // mainnet-bsc 0x86896fEB19D8A607c3b11f2aF50A0f239Bd71CD0
    // testnet-bsc 0x4E08A779a85d28Cc96515379903A6029487CEbA0
    const priceFeedAddress = "0x4E08A779a85d28Cc96515379903A6029487CEbA0";

    console.log("Deploying the GoldPriceConsumer contract...");

    // Get the contract factory
    const GoldPriceConsumerFactory = await ethers.getContractFactory("GoldPriceConsumer");

    // Deploy the contract and cast it to the correct type
    const goldPriceConsumer = (await GoldPriceConsumerFactory.deploy(
        priceFeedAddress
    )) as GoldPriceConsumerType & Contract;

    // Ensure the deployment is mined
    await goldPriceConsumer.deploymentTransaction()?.wait();

    // Access the contract address safely
    console.log(`GoldPriceConsumer deployed successfully at address: ${goldPriceConsumer.address}`);
}

// Handle errors
main().catch((error) => {
    console.error("Error deploying contract:", error);
    process.exitCode = 1;
});
