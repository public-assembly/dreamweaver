// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import {ERC721} from "solmate/tokens/ERC721.sol";
import {IMetadataRenderer} from "./JSONURIRenderer.sol";
import {Ownable} from "openzeppelin/access/Ownable.sol";

/// @title PressPointer
/// @author Salief Lewis | salief.eth

contract PressPointer is ERC721, Ownable {
    /// @dev Address of the metadata renderer used by tokenURI
    address public metadataRenderer;

    constructor(string memory _name, string memory _symbol, address deployer) ERC721(_name, _symbol) {
        _mint(deployer, 1);
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        require(id == 1, "ONE_OF_ONE");
        return IMetadataRenderer(metadataRenderer).tokenURI(id);
    }

    function setTokenURI(uint256 id, string memory transactionId) public onlyOwner {
        require(id == 1, "ONE_OF_ONE");
        IMetadataRenderer(metadataRenderer).setTokenURI(id, transactionId);
    }

    function setMetadataRenderer(address _metadataRenderer) public onlyOwner {
        metadataRenderer = _metadataRenderer;
    }
}
