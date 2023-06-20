// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "forge-std/console2.sol";

import {PressPointer} from "../src/PressPointer.sol";
import {JSONURIRenderer} from "../src/JSONURIRenderer.sol";

contract TestConfig is Test {
    string public constant POINTER_NAME = "Pointer Version 1";
    string public constant POINTER_SYMBOL = "PNTR";
    string public constant BASE_URI = "https://arweave.net/";

    address public deployer = makeAddr("deployer");

    PressPointer public pressPointer;
    JSONURIRenderer public jsonRenderer;

    function setUp() public virtual {
        pressPointer = new PressPointer(POINTER_NAME, POINTER_SYMBOL, deployer);
        jsonRenderer = new JSONURIRenderer(BASE_URI);
        pressPointer.setMetadataRenderer(address(jsonRenderer));
    }
}
