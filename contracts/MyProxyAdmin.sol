// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

contract MyProxyAdmin is ProxyAdmin {
    constructor() ProxyAdmin(_msgSender()) {}
}
