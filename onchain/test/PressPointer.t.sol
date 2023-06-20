// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {TestConfig} from "./TestConfig.sol";
import "forge-std/console2.sol";

import "../src/PressPointer.sol";
import "../src/JSONURIRenderer.sol";

contract PressPointerTest is TestConfig {
    uint256 public id = 1;
    string public transactionId = "transaction-id";

    // solhint-disable-next-line
    function test_tokenURI() public view {
        console2.log(jsonRenderer.tokenURI(1));
    }

    // solhint-disable-next-line
    function test_unmintedTokenURI() public {
        vm.expectRevert();
        jsonRenderer.tokenURI(2);
    }

    // solhint-disable-next-line
    function test_setTokenURI() public {
        jsonRenderer.setTokenURI(id, transactionId);
        assertEq(jsonRenderer.tokenURI(id), "https://arweave.net/transaction-id");
    }

    // solhint-disable-next-line
    function test_baseURI() public {
        assertEq(jsonRenderer.baseURI(), "https://arweave.net/");
    }

    // solhint-disable-next-line
    function test_setBaseURI() public {
        jsonRenderer.setBaseURI("ar://");
        assertEq(jsonRenderer.baseURI(), "ar://");
    }

    // solhint-disable-next-line
    function test_balanceOfDeployer() public {
        assertEq(pressPointer.balanceOf(address(deployer)), 1);
    }

    // solhint-disable-next-line
    function test_ownerOf() public {
        assertEq(pressPointer.ownerOf(id), address(deployer));
    }
}
