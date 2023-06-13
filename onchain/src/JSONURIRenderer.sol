// SPDX-License-Identifier: UNLICENSED
/**
 * Modified from Context's JSONURIRenderer.sol
 * https://etherscan.io/address/0x9A12D9fCC221f93668D7aD9aC44D9623aE4fB6fb#code
 */
pragma solidity ^0.8.17;

import {Ownable} from "openzeppelin/access/Ownable.sol";
import {Strings} from "openzeppelin/utils/Strings.sol";

interface IMetadataRenderer {
    function tokenURI(uint256 id) external view returns (string memory);
}

contract JSONURIRenderer is IMetadataRenderer, Ownable {
    string public baseURI;

    constructor(string memory _baseURI) {
        baseURI = _baseURI;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        return string.concat(baseURI, Strings.toString(id), ".json");
    }

    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }
}
