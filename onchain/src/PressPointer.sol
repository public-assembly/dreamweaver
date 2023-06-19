// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import {ERC721} from "solmate/tokens/ERC721.sol";
import {IMetadataRenderer} from "./JSONURIRenderer.sol";
import {Ownable} from "openzeppelin/access/Ownable.sol";

contract PressPointer is ERC721, Ownable {
    /// @dev Address of the metadata renderer used by `tokenURI`
    address public metadataRenderer;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

    function isMinted(uint256 id) public view returns (bool) {
        return ownerOf(id) != address(0);
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        require((!isMinted(id)), "NOT_MINTED");

        return IMetadataRenderer(metadataRenderer).tokenURI(id);
    }

    function setMetadataRenderer(address _metadataRenderer) public onlyOwner {
        metadataRenderer = _metadataRenderer;
        // refreshMetadata();
    }
}
