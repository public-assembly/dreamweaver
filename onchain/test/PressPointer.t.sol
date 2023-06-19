// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {TestConfig} from "./TestConfig.sol";
import "forge-std/console2.sol";

import "../src/PressPointer.sol";
import "../src/JSONURIRenderer.sol";

contract PressPointerTest is TestConfig {
    uint256 id = 1;

    // function test_tokenURI() public view {
    //     pressPointer.tokenURI(id);
    // }

    function test_baseURI() public {
        assertEq(jsonRenderer.baseURI(), "https://arweave.net/");
    }

    function test_tokenURI() public view {
        console2.log(jsonRenderer.tokenURI(1));
    }
}
