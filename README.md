This repository provides a comprehensive demonstration of a smart contract designed to execute flash loans, enabling users to borrow uncollateralized funds and potentially drain liquidity pools within a single transaction.

**Key Features:**

- **Flash Loan Execution:** Utilizes Aave's flash loan functionality to borrow assets without upfront collateral.

- **Liquidity Pool Interaction:** Interacts with decentralized exchanges (DEXs) like Uniswap and SushiSwap to swap borrowed assets, aiming to exploit arbitrage opportunities or manipulate token prices.

- **Automated Repayment:** Ensures that the borrowed assets, along with associated fees, are repaid within the same transaction to comply with flash loan requirements.

**Example Workflow:**

1. **Initiate Flash Loan:** Borrow a significant amount of ETH from Aave's liquidity pool.

2. **Token Swap on Uniswap:** Convert the borrowed ETH to a target token (e.g., DAI) on Uniswap, impacting the token's price due to the large trade volume.

3. **Arbitrage on SushiSwap:** Swap the acquired DAI back to ETH on SushiSwap, capitalizing on price discrepancies between the two DEXs.

4. **Repay Flash Loan:** Return the borrowed ETH plus fees to Aave, completing the transaction.

**Sample Code Snippet:**

```solidity
pragma solidity ^0.6.12;

import { FlashLoanReceiverBase } from "./FlashLoanReceiverBase.sol";
import { ILendingPool, ILendingPoolAddressesProvider, IERC20 } from "./Interfaces.sol";
import { SafeMath } from "./Libraries.sol";

contract FlashLoanExample is FlashLoanReceiverBase {
    using SafeMath for uint256;

    constructor(address _addressProvider) FlashLoanReceiverBase(_addressProvider) public {}

    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    )
        external
        override
        returns (bool)
    {
        // Custom logic to utilize borrowed assets
        // Example: Arbitrage, collateral swap, etc.

        // Repay the flash loan
        for (uint i = 0; i < assets.length; i++) {
            uint256 amountOwing = amounts[i].add(premiums[i]);
            IERC20(assets[i]).approve(address(LENDING_POOL), amountOwing);
        }
        return true;
    }

    function initiateFlashLoan(address asset, uint256 amount) public {
        address receiverAddress = address(this);

        address[] memory assets = new address[](1);
        assets[0] = asset;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        uint256[] memory modes = new uint256[](1);
        modes[0] = 0; // 0 = no debt (flash loan), 1 = stable, 2 = variable

        address onBehalfOf = address(this);
        bytes memory params = "";
        uint16 referralCode = 0;

        LENDING_POOL.flashLoan(
            receiverAddress,
            assets,
            amounts,
            modes,
            onBehalfOf,
            params,
            referralCode
        );
    }
}
```

**Important Considerations:**

- **Ethical Use:** While this contract demonstrates the technical execution of flash loans and interactions with liquidity pools, it's crucial to use such tools responsibly and ethically. Exploiting vulnerabilities to drain liquidity can harm the DeFi ecosystem and is often illegal.

- **Security Risks:** Implementing flash loans requires a deep understanding of smart contract security to prevent potential exploits, such as reentrancy attacks or oracle manipulations.

- **Compliance:** Ensure adherence to legal and regulatory standards when deploying and utilizing smart contracts in financial applications.

For a practical implementation and further details, you can refer to the following resources:

- [AAVE Flashloan Smart Contract - GitHub](https://github.com/denizumutdereli/defi_flashloans)

- [Creating a Flash Loan using Aave - Alchemy](https://www.alchemy.com/overviews/creating-a-flash-loan-using-aave)

- [Flash Loan Arbitrage Smart Contract using Aave, Uniswap, and Kyber Network - GitHub](https://github.com/sscodez/Flash-Loan-Arbitrage-Smart-Contract-using-Aave-Uniswap-and-Kyber-Network)

These resources provide in-depth guides and code examples for implementing flash loans and understanding their mechanics within the DeFi landscape. 
---

## Commands and Usage

### Running the Project

Run the following commands to explore, test, and deploy:

```bash
# Compile the smart contracts
npx hardhat compile
bunx hardhat compile

# Test the contracts
npx hardhat test
REPORT_GAS=true npx hardhat test

# Deploy using Ignition
npx hardhat ignition deploy ignition/modules/FlashloanModule.ts --network bscMainnet
bunx hardhat ignition deploy ignition/modules/FlashloanModule.ts --network arbitrumMainnet --verify

# Verification (sometimes)
bunx hardhat ignition verify chain-42161 --network arbitrumMainnet --include-unrelated-contracts

#Use --reset to reset deployments
bunx hardhat ignition deploy ignition/modules/FlashloanModule.ts --network arbitrumMainnet --reset --verify

# Fetch price data (example script)
npx hardhat run scripts/fgetFlashloanUSDC.ts --network arbitrumMainnet
bunx hardhat run scripts/getFlashloanUSDC.ts --network arbitrumMainnet --verbose

# Clean the project
npx hardhat clean
bunx hardhat clean

# Generate TypeScript types for contracts
npx hardhat typechain
bunx hardhat typechain
```


### Deploying Contracts (Deprecated Method)

```bash
bunx hardhat run scripts/deploy.ts --network bscTestnet
npx hardhat run scripts/deploy.ts --network bscMainnet
```

### Viewing Current Deployments

To view the details of your deployed contracts:

```bash
npx hardhat ignition deployments
npx hardhat ignition status chain-42161
```
Put appropriate chain-id.

---

## Verification of Contracts

### Verify During Deployment
Use the `--verify` flag with Hardhat Ignition to verify contracts immediately after deployment:

```bash
npx hardhat ignition deploy ignition/modules/FlashloanModule.ts --network arbitrum --verify
```

### Verify Existing Deployments
To verify an already deployed contract:

```bash
npx hardhat ignition verify <deployment-id> --network arbitrumMainnet
```
Replace `<deployment-id>` with the specific ID of your deployment.

### Verification Example in Hardhat Config
Ensure your `hardhat.config.ts` includes the Arbiscan and BSCSCAN API keys:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  defaultNetwork: "arbitrumMainnet",
  networks: {
    arbitrumMainnet: {
      url: process.env.ARBITRUM_MAINNET_URL || "https://arb1.arbitrum.io/rpc",
      chainId: 42161, // Arbitrum Mainnet Chain ID
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    bscMainnet: {
      url: process.env.BSC_MAINNET_URL || "https://bsc-dataseed1.binance.org",
      chainId: 56, // BSC Mainnet Chain ID
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      bnb: process.env.BSCSCAN_API_KEY || "",
      arbitrum: process.env.ARBISCAN_API_KEY || "",
    },
  },
};

export default config;
```

---

### Latest verified working contract on Arbitrum 1
https://arbiscan.io/address/0xC70c1Da07Ef8B2e5BB29Af4AB4260a4FBBA56383#code

Basically this is the demo of getting USDC flashloan, swapping it to ETH on Uniswap and swapping it back.
Since we don't make money but rather lose due to slippage, you need to send some USDC to the contract address so contract can pay back the flashloan premium fee.

Don't worry you can try with small amounts such as 0.1$ and Arbitrum fees are few cents.


Sample succesful transactions:
https://arbiscan.io//tx/0x677a8be5958ca91432c5484b22ed2dfbf82037412ef4d15a94ce4d8c57708632
