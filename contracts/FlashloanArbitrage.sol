// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IFlashLoanSimpleReceiver} from "@aave/core-v3/contracts/flashloan/interfaces/IFlashLoanSimpleReceiver.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract FlashloanArbitrage is IFlashLoanSimpleReceiver {
    IPoolAddressesProvider public immutable override ADDRESSES_PROVIDER;
    IPool public immutable override POOL;

    address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    address public constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;

    ISwapRouter public immutable swapRouter;

    constructor(address provider, address _swapRouter) {
        /*
        aavePoolAddress = 0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb; // Aave V3 Pool on Arbitrum
        swapRouter = 0xE592427A0AEce92De3Edee1F18E0157C05861564; // Uniswap V3 Swap Router on Arbitrum
        */
        ADDRESSES_PROVIDER = IPoolAddressesProvider(provider);
        POOL = IPool(ADDRESSES_PROVIDER.getPool());
        swapRouter = ISwapRouter(_swapRouter);
    }

    /**
     * @dev This function initiates the full arbitrage process by requesting a flash loan.
     *      The key concept here is that Aave's flash loan system follows a callback pattern:
     *      - When a flash loan is requested via `flashLoanSimple()`, Aave's smart contract
     *        transfers the requested amount to the borrower (this contract).
     *      - Immediately after transferring the funds, Aave **automatically** calls the
     *        `executeOperation()` function on the borrower contract.
     *      - The `executeOperation()` function must implement the logic to utilize the
     *        borrowed funds and ensure that the loan (plus fees) is repaid **within the same transaction**.
     *
     *      This mechanism works because our contract **implements the IFlashLoanSimpleReceiver interface**,
     *      which includes the `executeOperation()` function signature.
     *      Aave expects this function to exist in any contract that requests a flash loan.
     *
     *      If `executeOperation()` is not implemented or fails, the entire transaction is reverted.
     *      This ensures that flash loans cannot be exploited—if the borrowed funds are not returned
     *      within the same block, the loan is effectively never issued.
     *
     * @param amount The amount of USDC to borrow
     */
    function requestFlashLoan(uint256 amount) external {
        address asset = USDC;
        bytes memory params = "";
        uint16 referralCode = 0;
        POOL.flashLoanSimple(
            address(this),
            asset,
            amount,
            params,
            referralCode
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(POOL), "Caller must be Aave Pool");
        require(initiator == address(this), "Initiator must be this contract");

        // Step 1: Swap USDC to WETH
        uint256 ethAmount = swapUSDCtoETH(amount);

        // Step 2: Swap WETH back to USDC
        uint256 usdcReceived = swapETHtoUSDC(ethAmount);

        // Step 3: Ensure we have enough USDC to repay the loan
        uint256 totalDebt = amount + premium;
        require(
            usdcReceived >= totalDebt,
            "Arbitrage failed: Insufficient USDC"
        );

        // Step 4: Approve and repay loan
        IERC20(USDC).approve(address(POOL), totalDebt);

        return true;
    }

    function swapUSDCtoETH(
        uint256 amountIn
    ) internal returns (uint256 amountOut) {
        IERC20(USDC).approve(address(swapRouter), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: USDC,
                tokenOut: WETH,
                fee: 500, // Uniswap V3 pool fee (0.05%)
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        amountOut = swapRouter.exactInputSingle(params);
    }

    function swapETHtoUSDC(
        uint256 amountIn
    ) internal returns (uint256 amountOut) {
        IERC20(WETH).approve(address(swapRouter), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH,
                tokenOut: USDC,
                fee: 500,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        amountOut = swapRouter.exactInputSingle(params);
    }
}
