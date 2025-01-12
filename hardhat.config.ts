import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";


const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable IR-based compilation
    },
  },
  // defaultNetwork: "arbitrumMainnet", // during actual deployments
  defaultNetwork: "hardhat", // during npx hardhat test
  networks: {
    arbitrumMainnet: {
      url: process.env.ARBITRUM_MAINNET_URL || "https://arb1.arbitrum.io/rpc",
      chainId: 42161, // Arbitrum Mainnet Chain ID
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 30000000, // Set a higher gas limit
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
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
    },
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  mocha: {
    timeout: 60000, // 60 seconds
  },
};

export default config;
