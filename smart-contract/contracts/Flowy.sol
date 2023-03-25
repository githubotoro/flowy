// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IConnext} from "@connext/interfaces/core/IConnext.sol";
import {IXReceiver} from "@connext/interfaces/core/IXReceiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract Flowy is ERC721URIStorage, IXReceiver {
    // ERC 721 helpers
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;

    // Connext contract
    IConnext public immutable connext;

    // Token initializer
    IERC20 public sourceToken;
    IERC20 public destinationToken;

    // Streaming reference
    uint256 public streamReference;
    uint256 public streamAmount;
    uint256 public streamType;
    uint256 public streamMax;

    // Slippage set to 100%
    uint256 public immutable slippage = 10000;

    /**
     * @dev Constructor
     * @param _connext Connext address on given chain
     * @param _sourceToken Source token address
     * @param _destinationToken Destination token address
     */
    constructor(
        address _connext,
        address _sourceToken,
        address _destinationToken
    ) ERC721("FlowyNFT", "FNFT") {
        streamAmount = 0;
        streamReference = 0;
        streamMax = 60 * 60; // stream lasts for an hour
        connext = IConnext(_connext);
        sourceToken = IERC20(_sourceToken);
        destinationToken = IERC20(_destinationToken);

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, getTokenURI(newItemId));
    }

    /**
     * @dev Generate NFT for the given NFT
     * @param tokenId Token id of the required NFT
     */
    function generateNFT(uint256 tokenId) public view returns (string memory) {
        bytes memory svg = abi.encodePacked(
            '<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">',
            '<text x="100" y="100" text-anchor="middle">',
            "&lt;",
            currAmount(),
            "&gt;",
            "</text>",
            "</svg>"
        );

        return
            string(
                abi.encodePacked(
                    "data:image/svg+xml;base64,",
                    Base64.encode(svg)
                )
            );
    }

    /**
     * @dev Get token uri of the NFT
     * @param tokenId Token id of the required NFT
     */
    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            "{",
            '"name": "Flowy NFT',
            tokenId.toString(),
            '",',
            '"description": "NFT that can be streamed cross-chain.",',
            '"image": "',
            generateNFT(tokenId),
            '"',
            "}"
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(dataURI)
                )
            );
    }

    /**
     * @dev Overriden token uri functionality
     * @param tokenId Token id of the required NFT
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        _requireMinted(tokenId);
        return getTokenURI(tokenId);
    }

    /**
     * @dev Get current blockchain time
     */
    function getTimestamp() public view returns (uint256) {
        return block.timestamp;
    }

    /**
     * @dev Get currently streamed/streaming amount
     */
    function currAmount() public view returns (string memory) {
        if (streamReference == 0) {
            return Strings.toString(streamAmount);
        } else {
            if (streamType == 0) {
                // stream sender
                if ((block.timestamp - streamReference) >= streamAmount) {
                    // complete stream sent
                    return Strings.toString(0);
                } else {
                    // sending stream
                    return
                        Strings.toString(
                            streamAmount - (block.timestamp - streamReference)
                        );
                }
            } else {
                // stream receiver
                if (
                    streamAmount + (block.timestamp - streamReference) >=
                    streamMax
                ) {
                    // complete stream received
                    return Strings.toString(streamMax);
                } else {
                    // receiving stream
                    return
                        Strings.toString(
                            streamAmount + (block.timestamp - streamReference)
                        );
                }
            }
        }
    }

    /**
     * @dev Stream updator for FROM_CHAIN
     * @param target Target contract address
     * @param destinationDomain Domain id of destination chain
     * @param amount Amount of asset token to be sent
     * @param relayerFee Fee to be paid to relayer
     */
    function xSend(
        address target,
        uint32 destinationDomain,
        uint256 amount,
        uint256 relayerFee
    ) external payable {
        // Token validation
        require(
            sourceToken.allowance(msg.sender, address(this)) >= amount,
            "Token approval required!"
        );

        // Transferring token to contract
        sourceToken.transferFrom(msg.sender, address(this), amount);

        // Granting transfer approval to Connext
        sourceToken.approve(address(connext), amount);

        // Creating new stream reference
        uint256 newStreamReference = block.timestamp;

        // Encoding calldata for the target contract call
        bytes memory callData = abi.encode(newStreamReference);

        connext.xcall{value: relayerFee}(
            destinationDomain, // _destination: Domain ID of the destination chain
            target, // _to: address of the target contract
            address(sourceToken), // _asset: address of the token contract
            msg.sender, // _delegate: address that can revert or forceLocal on destination
            amount, // _amount: amount of tokens to transfer
            slippage, // _slippage: max slippage the user will accept in BPS
            callData // _callData: the encoded calldata to send
        );

        // Updating stream
        if (streamReference == 0) {
            streamAmount = streamMax;
            streamType = 0;
            streamReference = newStreamReference;
        } else {
            streamAmount = streamMax - (newStreamReference - streamReference);
            streamReference = 0;
        }
    }

    /**
     * @dev Stream updator for TO_CHAIN
     * @param _transferId Transfer id
     * @param _amount Received amount
     * @param _asset Asset address being sent
     * @param _originSender Origin sender's address
     * @param _origin Origin domain
     * @param _callData Received data
     */
    function xReceive(
        bytes32 _transferId,
        uint256 _amount,
        address _asset,
        address _originSender,
        uint32 _origin,
        bytes memory _callData
    ) external returns (bytes memory) {
        // Unpack the _callData
        uint256 newStreamReference = abi.decode(_callData, (uint256));

        // Updating stream
        if (streamReference == 0) {
            // Starting stream
            streamAmount = 0;
            streamType = 1;
            streamReference = newStreamReference;
        } else {
            // Ending stream
            streamAmount = newStreamReference - streamReference;
            streamReference = 0;
        }
    }

    /**
     * @dev Set NFT to a specific state
     * @param _streamAmount New amount
     * @param _streamReference New reference
     * @param _streamType New type
     * @param _streamMax New Max
     */
    function setNFT(
        uint256 _streamAmount,
        uint256 _streamReference,
        uint256 _streamType,
        uint256 _streamMax
    ) public {
        streamAmount = _streamAmount;
        streamReference = _streamReference;
        streamType = _streamType;
        streamMax = _streamMax;
    }
}
