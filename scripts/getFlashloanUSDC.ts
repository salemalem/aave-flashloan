// scripts/executeFlashloan.ts
import { ethers } from "hardhat";

async function main() {
    // Configuration - USDC uses 6 decimals on Arbitrum
    const USDC_DECIMALS = 6;
    // const FLASHLOAN_AMOUNT = ethers.parseUnits("0.1", USDC_DECIMALS); // 0.1 USDC
    const FLASHLOAN_AMOUNT = 1;
    // Replace with your deployed FlashloanManager contract address
    const FLASHLOAN_MANAGER_ADDRESS = "0xe0E1F58427d927466c4137308d1bd52D2d096ca3"; 
    const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // USDC address on Arbitrum


    // Get the contract instance
     // Get the contract instance using getContractAt
    const flashloanManager = await ethers.getContractAt(
        "FlashloanArbitrage",
        FLASHLOAN_MANAGER_ADDRESS
    );

    // Get the USDC token contract instance
    const usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);

    // Get your USDC balance
    const [signer] = await ethers.getSigners();
    const balance = await usdc.balanceOf(signer.address);
    console.log(`Your current USDC balance: ${ethers.formatUnits(balance, USDC_DECIMALS)} USDC`);
    console.log(`Your current USDC balance: ${balance} USDC`);
    const balanceContract = await usdc.balanceOf(FLASHLOAN_MANAGER_ADDRESS);
    console.log(`FlashloanManager USDC balance: ${ethers.formatUnits(balanceContract, USDC_DECIMALS)} USDC`);
    console.log(`FlashloanManager USDC balance: ${balanceContract} USDC`);

    // console.log(`Executing flashloan for ${ethers.formatUnits(FLASHLOAN_AMOUNT, USDC_DECIMALS)} USDC...`);
    console.log(`Executing flashloan for ${FLASHLOAN_AMOUNT} USDC...`);
    // Execute the flashloan
    const tx = await flashloanManager.requestFlashLoan(FLASHLOAN_AMOUNT,
        {
            gasLimit: 3000000, // Adjust gas limit as needed
        }
    );
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