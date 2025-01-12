// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract AuthorizationManager is
    Initializable,
    ContextUpgradeable,
    OwnableUpgradeable
{
    mapping(address => bool) private authorizedAddresses;

    /// @notice Emitted when an address is authorized
    event AddressAuthorized(address indexed account);

    /// @notice Emitted when an address is de-authorized
    event AddressDeauthorized(address indexed account);

    function __AuthorizationManager_init() public initializer {
        __Context_init();
        __Ownable_init(_msgSender());
        authorizeAddress(_msgSender());
    }

    /// @dev Gap for upgrade safety
    uint256[50] private __gap;

    /**
     * @notice Adds an address to the list of authorized addresses.
     * @param account The address to authorize.
     */
    function authorizeAddress(address account) public onlyOwner {
        require(account != address(0), "Cannot authorize zero address");
        // require(!authorizedAddresses[account], "Address already authorized");
        authorizedAddresses[account] = true;
        emit AddressAuthorized(account);
    }

    /**
     * @notice Removes an address from the list of authorized addresses.
     * @param account The address to deauthorize.
     */
    function deauthorizeAddress(address account) external onlyOwner {
        require(authorizedAddresses[account], "Address not authorized");
        authorizedAddresses[account] = false;
        emit AddressDeauthorized(account);
    }

    /**
     * @notice Checks if an address is authorized.
     * @param account The address to check.
     * @return True if the address is authorized, false otherwise.
     */
    function isAuthorized(address account) public view returns (bool) {
        return authorizedAddresses[account];
    }

    /**
     * @dev Modifier to restrict function access to authorized addresses only.
     */
    modifier onlyAuthorized() {
        require(authorizedAddresses[msg.sender], "Not authorized");
        _;
    }
}
