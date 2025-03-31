// scripts/executeFlashloan.ts
import { ethers } from "hardhat";

async function main() {
    // Configuration - USDC uses 6 decimals on Arbitrum
    // const USDC_DECIMALS = 6;
    // const FLASHLOAN_AMOUNT = ethers.parseUnits("1", USDC_DECIMALS); // 0.1 USDC
    const FLASHLOAN_AMOUNT = 1;
    // Replace with your deployed FlashloanManager contract address
    const FLASHLOAN_MANAGER_ADDRESS = "0xE5A73eFa988C246cAf743A715a7319011e562b34"; 

    // Get the contract instance
     // Get the contract instance using getContractAt
    const flashloanManager = await ethers.getContractAt(
        "FlashloanManager",
        FLASHLOAN_MANAGER_ADDRESS
    );

    // console.log(`Executing flashloan for ${ethers.formatUnits(FLASHLOAN_AMOUNT, USDC_DECIMALS)} USDC...`);
    console.log(`Executing flashloan for ${FLASHLOAN_AMOUNT} USDC...`);
    // Execute the flashloan
    const tx = await flashloanManager.requestFlashLoan(FLASHLOAN_AMOUNT);
    const receipt = await tx.wait();

    console.log(`Flashloan executed successfully!`);
    console.log(`Transaction hash: ${receipt.hash}`);

    // Calculate expected repayment (0.05% fee on Aave V3)
    const premium = FLASHLOAN_AMOUNT * 5n / 10000n; // 0.05% of amount
    const totalRepayment = FLASHLOAN_AMOUNT + premium;

    console.log(`Amount borrowed: ${ethers.formatUnits(FLASHLOAN_AMOUNT, USDC_DECIMALS)} USDC`);
    console.log(`Fee paid: ${ethers.formatUnits(premium, USDC_DECIMALS)} USDC`);
    console.log(`Total repaid: ${ethers.formatUnits(totalRepayment, USDC_DECIMALS)} USDC`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});