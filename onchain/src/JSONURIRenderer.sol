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

    function setTokenURI(uint256 id, string memory transactionId) external;

    function setBaseURI(string memory _baseURI) external;
}

contract JSONURIRenderer is IMetadataRenderer, Ownable {
    string public baseURI;

    /// @dev Mapping from tokenId to token URI
    mapping(uint256 tokenId => string tokenURI) public tokenMetadata;

    constructor(string memory _baseURI) {
        baseURI = _baseURI;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        require(id == 1, "ONE_OF_ONE");
        return string.concat(baseURI, tokenMetadata[id]);
    }

    function setTokenURI(uint256 id, string memory transactionId) public onlyOwner {
        require(id == 1, "ONE_OF_ONE");
        tokenMetadata[id] = transactionId;
    }

    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }
}
