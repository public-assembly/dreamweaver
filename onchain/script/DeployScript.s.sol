// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import {PressPointer} from "../src/PressPointer.sol";
import {JSONURIRenderer} from "../src/JSONURIRenderer.sol";

contract DeployScript is Script {

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.envAddress("DEPLOYER");

        vm.startBroadcast(deployerPrivateKey);

        PressPointer pressPointer = new PressPointer("Pointer Version 1", "PNTR", deployer);
        JSONURIRenderer jsonRenderer = new JSONURIRenderer("https://arweave.net/");
        pressPointer.setMetadataRenderer(address(jsonRenderer));

        vm.stopBroadcast();
    }
}

// ======= DEPLOY SCRIPTS =====

// source .env
// export PRIVATE_KEY=<deployer-private-key>
// forge script script/DeployScript.s.sol:DeployScript --rpc-url $SEPOLIA_RPC_URL --broadcast --verify  -vvvv
