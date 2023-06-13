// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import {ERC721} from "solmate/tokens/ERC721.sol";
import {IMetadataRenderer} from "./JSONURIRenderer.sol";

contract PressPointer is ERC721 {
    /// @dev Address of the metadata renderer used by `tokenURI`
    address public metadataRenderer;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

    function tokenURI(uint256 id) public view override returns (string memory) {
        // if (!_exists(id)) revert InvalidTokenId();
        return IMetadataRenderer(metadataRenderer).tokenURI(id);
    }
}
