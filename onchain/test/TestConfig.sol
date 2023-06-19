// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "forge-std/console2.sol";

import {PressPointer} from "../src/PressPointer.sol";
import {JSONURIRenderer} from "../src/JSONURIRenderer.sol";

contract TestConfig is Test {
    string constant POINTER_NAME = "Pointer Version 1";
    string constant POINTER_SYMBOL = "PNTR";
    string constant BASE_URI = "https://arweave.net/";

    PressPointer pressPointer;
    JSONURIRenderer jsonRenderer;

    function setUp() public virtual {
        pressPointer = new PressPointer(POINTER_NAME, POINTER_SYMBOL);
        jsonRenderer = new JSONURIRenderer(BASE_URI);
        pressPointer.setMetadataRenderer(address(jsonRenderer));
    }
}
