// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CompressionLogger {
    struct CompressionRecord {
        string hash;
        uint256 originalSize;
        uint256 compressedSize;
        uint256 timestamp;
        address sender;
    }

    mapping(string => CompressionRecord) public records;
    string[] public recordHashes;

    event CompressionLogged(
        string indexed hash,
        uint256 originalSize,
        uint256 compressedSize,
        uint256 timestamp,
        address sender
    );

    function logCompression(
        string memory _hash,
        uint256 _originalSize,
        uint256 _compressedSize
    ) public {
        require(bytes(_hash).length > 0, "Hash cannot be empty");
        require(_originalSize > 0, "Original size must be greater than 0");
        require(_compressedSize > 0, "Compressed size must be greater than 0");

        CompressionRecord memory newRecord = CompressionRecord({
            hash: _hash,
            originalSize: _originalSize,
            compressedSize: _compressedSize,
            timestamp: block.timestamp,
            sender: msg.sender
        });

        records[_hash] = newRecord;
        recordHashes.push(_hash);

        emit CompressionLogged(
            _hash,
            _originalSize,
            _compressedSize,
            block.timestamp,
            msg.sender
        );
    }

    function getRecord(string memory _hash) public view returns (
        string memory,
        uint256,
        uint256,
        uint256,
        address
    ) {
        CompressionRecord memory record = records[_hash];
        return (
            record.hash,
            record.originalSize,
            record.compressedSize,
            record.timestamp,
            record.sender
        );
    }

    function getRecordCount() public view returns (uint256) {
        return recordHashes.length;
    }
} 