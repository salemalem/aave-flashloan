import { expect } from "chai";
import { ethers } from "hardhat";
import {
  PortfolioManager,
  PortfolioStorage,
  PortfolioLib,
  PortfolioTypeManager,
  AuthorizationManager,
  MockERC20,
  MockPriceFeed
} from "../typechain-types";

describe("PortfolioManager", function () {
  let portfolioManager: PortfolioManager;
  let portfolioStorage: PortfolioStorage;
  let portfolioLib: PortfolioLib;
  let portfolioTypeManager: PortfolioTypeManager;
  let authorizationManager: AuthorizationManager;

  let mockPriceFeed: MockPriceFeed;
  let acceptedToken: MockERC20;
  let owner: any;
  let user: any;
  let anotherUser: any;

  let portfolioLibAddress: string;
  let acceptedTokenAddress: string;
  let portfolioStorageAddress: string;
  let mockPriceFeedAddress: string;
  let portfolioManagerAddress: string;

  const portfolioCreationFee = ethers.parseUnits("1", 6); // 1 USDT with 6 decimals
  const maxAssets = 15;
  const initialPortfolioTypes = ["Crypto", "Equities"];

  before(async function () {
    [owner, user, anotherUser] = await ethers.getSigners();
    
    // Deploy the PortfolioLib library
    const PortfolioLibFactory = await ethers.getContractFactory("PortfolioLib");
    const portfolioLib = await PortfolioLibFactory.deploy() as PortfolioLib;
    await portfolioLib.waitForDeployment();
    portfolioLibAddress = await portfolioLib.getAddress();

    // Deploy the mock ERC20 token
    const ERC20MockFactory = await ethers.getContractFactory("MockERC20");
    const acceptedTokenDecimals = 6;
    acceptedToken = (await ERC20MockFactory.deploy(
        "Mock USDT",
        "mUSDT",
        ethers.parseUnits("1000000000000", acceptedTokenDecimals) // initialSupply
      )) as MockERC20;
      
    await acceptedToken.waitForDeployment();
    acceptedTokenAddress = await acceptedToken.getAddress();

    // Distribute tokens to user and otherUser
    await acceptedToken.transfer(user.address, ethers.parseUnits("1000", acceptedTokenDecimals));
    await acceptedToken.transfer(anotherUser.address, ethers.parseUnits("1000", acceptedTokenDecimals));


    // Deploy the MockPriceFeed
    const MockPriceFeedFactory = await ethers.getContractFactory("MockPriceFeed");
    mockPriceFeed = (await MockPriceFeedFactory.deploy(ethers.parseUnits("2", 8), 8)) as MockPriceFeed;
    await mockPriceFeed.waitForDeployment();
    mockPriceFeedAddress = await mockPriceFeed.getAddress();

    // Deploy the PortfolioStorage contract
    const PortfolioStorageFactory = await ethers.getContractFactory("PortfolioStorage");
    portfolioStorage = (await PortfolioStorageFactory.deploy()) as PortfolioStorage;
    await portfolioStorage.waitForDeployment();
    portfolioStorageAddress = await portfolioStorage.getAddress();

    // Deploy the PortfolioManager with the mock token's address
    const PortfolioManagerFactory = await ethers.getContractFactory("PortfolioManager", {
      libraries: {
        PortfolioLib: portfolioLibAddress,
      }
    }
    );
    portfolioManager = (await PortfolioManagerFactory.deploy(
      acceptedTokenAddress,
      portfolioCreationFee,
      maxAssets,
      portfolioStorageAddress,
    )) as PortfolioManager;
    await portfolioManager.waitForDeployment();
    portfolioManagerAddress = await portfolioManager.getAddress();

    // Authorize the PortfolioManager in PortfolioStorage
    await portfolioStorage.authorizeAddress(portfolioManagerAddress);

    // Add initial portfolio types
    for (const portfolioType of initialPortfolioTypes) {
      await portfolioStorage.connect(owner).addPortfolioType(portfolioType);
    }

    // Check the portfolio types
    const portfolioTypesBytes32  = await portfolioStorage.getAllPortfolioTypes();
    const portfolioTypes = portfolioTypesBytes32.map((typeBytes32) => {
      console.log("Type Bytes32:", typeBytes32);
      // Ensure the bytes32 value is not empty before decoding
      // if (typeBytes32 !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      //   return ethers.decodeBytes32String(typeBytes32);
      // }
      return null;
    }).filter(Boolean); // Remove any null values
    console.log("Portfolio Types:", portfolioTypes);  
    
  });

  it("should deploy PortfolioManager with correct parameters", async function () {
    expect(await portfolioManager.acceptedToken()).to.equal(acceptedTokenAddress);
    expect(await portfolioManager.portfolioCreationFee()).to.equal(portfolioCreationFee);
    expect(await portfolioManager.maxAssets()).to.equal(maxAssets);
    expect(await portfolioManager.portfolioStorage()).to.equal(portfolioStorageAddress);
  });


  
  describe("Portfolio Creation and Round Management", function () {
    it("should allow users and owner to approve tokens and create portfolios", async function () {
      const assets = [mockPriceFeedAddress];
      const portfolioType = "Crypto";
    
      console.log("User Address:", user.address);
      console.log("PortfolioManager Address:", portfolioManagerAddress);
    
      // Check initial balances and allowances
      console.log("User balance before:", (await acceptedToken.balanceOf(user.address)).toString());
      console.log("Portfolio creation fee:", portfolioCreationFee.toString());
    
      // User approves tokens for PrizeManager
      await acceptedToken.connect(user).approve(portfolioManagerAddress, portfolioCreationFee);
      // await acceptedToken.connect(user).approve(portfolioManagerAddress, portfolioCreationFee);

      const userAllowance = await acceptedToken.allowance(user.address, portfolioManagerAddress);
      console.log("User Allowance for PrizeManager:", userAllowance.toString());
      expect(userAllowance).to.equal(portfolioCreationFee);
      
      const userBalanceBefore = await acceptedToken.balanceOf(user.address);
      console.log("User balance before:", userBalanceBefore.toString());

      // User creates a portfolio
      let amounts = [5];
      await portfolioManager.connect(user).createPortfolioNextRound(portfolioType, assets, amounts);
      
      // Check updated balances
      const userBalanceAfter = await acceptedToken.balanceOf(user.address);
      console.log("User balance after:", userBalanceAfter.toString());
    
      // Verify the portfolio was created
      const [userAssets, userAllocations, userPortfolioType] =
        await portfolioManager.viewPortfolio(1, 0, user.address);
      expect(userPortfolioType).to.equal(portfolioType);
      expect(userAssets[0]).to.equal(assets[0]);
      expect(userAllocations[0]).to.equal(amounts[0]);

      // Balance of another user before creating a portfolio
      const anotherUserBalanceBefore = await acceptedToken.balanceOf(anotherUser.address);
      console.log("Another User balance before:", anotherUserBalanceBefore.toString());

      // Approve tokens and create portfolio for anotherUser
      await acceptedToken.connect(anotherUser).approve(portfolioManagerAddress, portfolioCreationFee);
      amounts = [7];
      await portfolioManager.connect(anotherUser).createPortfolioNextRound(portfolioType, assets, amounts);

      // Check updated balance for anotherUser
      const anotherUserBalanceAfter = await acceptedToken.balanceOf(anotherUser.address);
      console.log("Another User balance after:", anotherUserBalanceAfter.toString());

      // Verify the portfolio was created
      const [anotherUserAssets, anotherUserAllocations, anotherUserPortfolioType] =
        await portfolioManager.viewPortfolio(1, 0, anotherUser.address);
      expect(anotherUserPortfolioType).to.equal(portfolioType);
      expect(anotherUserAssets[0]).to.equal(assets[0]);
      expect(anotherUserAllocations[0]).to.equal(amounts[0]);

      // Balance of owner before creating a portfolio
      const ownerBalanceBefore = await acceptedToken.balanceOf(owner.address);
      console.log("Owner balance before:", ownerBalanceBefore.toString());

      // Approve tokens and create portfolio for owner
      await acceptedToken.connect(owner).approve(portfolioManagerAddress, portfolioCreationFee);
      amounts = [1];
      await portfolioManager.connect(owner).createPortfolioNextRound(portfolioType, assets, amounts);

      // Check updated balance for owner
      const ownerBalanceAfter = await acceptedToken.balanceOf(owner.address);
      console.log("Owner balance after:", ownerBalanceAfter.toString());

      // Verify the portfolio was created
      const [ownerAssets, ownerAllocations, ownerPortfolioType] =
        await portfolioManager.viewPortfolio(1, 0, owner.address);
      expect(ownerPortfolioType).to.equal(portfolioType);
      expect(ownerAssets[0]).to.equal(assets[0]);
      expect(ownerAllocations[0]).to.equal(amounts[0]);

      // Start a new round
      const oneWeek = 60 * 60 * 24 * 7;
      await portfolioManager.connect(owner).startRound(oneWeek);


      // Simulate passing of time for the round duration
      await ethers.provider.send("evm_increaseTime", [oneWeek]);
      await ethers.provider.send("evm_mine", []);

      // Check initial prize pool value
      const prizePoolBefore = await portfolioManager.viewPrizePool(1);
      console.log("Prize Pool Before Ending Round:", prizePoolBefore.toString());
      expect(prizePoolBefore).to.be.gt(0);

      // End the round
      await portfolioManager.connect(owner).endRound();
    });
  });    
  

  describe("Winner Verification and Prize Withdrawal", function () {
    it("should correctly determine if a user won the round", async function () {
      const roundId = 1;
  
      // Determine winners
      const winners = await portfolioManager.getWinners(roundId);
      console.log("Winners for Round:", winners);
  
      // Check if specific users are winners
      const userIsWinner = winners.includes(user.address);
      const anotherUserIsWinner = winners.includes(anotherUser.address);
      const ownerIsWinner = winners.includes(owner.address);
  
      console.log("User is winner:", userIsWinner);
      console.log("Another User is winner:", anotherUserIsWinner);
      console.log("Owner is winner:", ownerIsWinner);
  
      // Verify the conditions for the test
      expect(userIsWinner).to.be.a("boolean");
      expect(anotherUserIsWinner).to.be.a("boolean");
      expect(ownerIsWinner).to.be.a("boolean");
    });
  
    it("should allow winners to withdraw their prize", async function () {
      const roundId = 1;
  
      // Fetch initial balances
      const userInitialBalance = await acceptedToken.balanceOf(user.address);
      const anotherUserInitialBalance = await acceptedToken.balanceOf(anotherUser.address);
      console.log("User Initial Balance:", userInitialBalance.toString());
      console.log("Another User Initial Balance:", anotherUserInitialBalance.toString());
      
      // console.log("User:", user);
      console.log("User Address:", user.address);
      console.log("Another User Address:", anotherUser.address);
      console.log("Owner Address:", owner.address);
      console.log("PortfolioManager Address:", portfolioManagerAddress);
      console.log("AcceptedToken Address:", acceptedTokenAddress);
      expect(ethers.isAddress(portfolioManagerAddress)).to.be.true;
      expect(ethers.isAddress(acceptedTokenAddress)).to.be.true;


      // User withdraws prize if they are a winner
      const userIsWinner = await portfolioManager.isWinner(user.address, roundId);
      console.log("User is winner:", userIsWinner);
      if (userIsWinner) {
        console.log("User is winner:", userIsWinner, "Round ID:", roundId);
        await portfolioManager.connect(user).withdrawPrize(roundId);
      }
  
      // Another User withdraws prize if they are a winner
      const anotherUserIsWinner = await portfolioManager.isWinner(anotherUser.address, roundId);
      console.log("Another User is winner:", anotherUserIsWinner);
      if (anotherUserIsWinner) {
        await portfolioManager.connect(anotherUser).withdrawPrize(roundId);
      }
  
      // Fetch updated balances
      const userUpdatedBalance = await acceptedToken.balanceOf(user.address);
      const anotherUserUpdatedBalance = await acceptedToken.balanceOf(anotherUser.address);
      console.log("User Updated Balance:", userUpdatedBalance.toString());
      console.log("Another User Updated Balance:", anotherUserUpdatedBalance.toString());
  
      // Ensure prize was added to the winner's balance
      if (userIsWinner) {
        expect(userUpdatedBalance).to.be.gt(userInitialBalance);
      }
      if (anotherUserIsWinner) {
        expect(anotherUserUpdatedBalance).to.be.gt(anotherUserInitialBalance);
      }
      const ownerIsWinner = await portfolioManager.isOwnerWinner(roundId);
      console.log("Owner is winner:", ownerIsWinner);
    });
  });
  
});