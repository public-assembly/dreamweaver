// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import {ERC721} from "solmate/tokens/ERC721.sol";

contract PressPointer is ERC721 {
    /// @dev URI prefix used by `tokenURI`
    string public baseURI;

    /// @dev Initial resource
    // string public tokenURI;

    constructor(string memory _name, string memory _symbol, string memory _baseURI) ERC721(_name, _symbol) {
        baseURI = _baseURI;
    }

    /// @dev Assigns a new string to `baseURI`
    function setBaseURI(string memory _newBaseURI) external {
        baseURI = _newBaseURI;
    }

    // function setTokenURI(string memory) public {

    // }

    function tokenURI(uint256 id) public view override returns (string memory) {
        return string(abi.encodePacked(baseURI, tokenURI));
    }
}
