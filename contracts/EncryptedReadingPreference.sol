// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title EncryptedReadingPreference - Private Reading Preference System
/// @notice Allows users to record encrypted reading category preferences
/// @dev Uses FHE to store and accumulate encrypted category counts on-chain
contract EncryptedReadingPreference is SepoliaConfig {
    // Mapping from user address to category ID to encrypted count
    mapping(address => mapping(uint32 => euint32)) private _encryptedCategoryCounts;
    
    // Mapping to track if user has initialized a category
    mapping(address => mapping(uint32 => bool)) private _hasInitialized;
    
    // Mapping to track all categories a user has interacted with
    mapping(address => uint32[]) private _userCategories;
    
    // Mapping to check if category exists for user
    mapping(address => mapping(uint32 => bool)) private _categoryExists;

    event CategoryPreferenceAdded(address indexed user, uint32 categoryId, uint256 timestamp);
    event CategoryPreferenceDecrypted(address indexed user, uint32 categoryId, uint256 decryptedCount);

    /// @notice Add preference count for a category
    /// @param categoryId The category ID (e.g., 1=Science Fiction, 2=Mystery, etc.)
    /// @param encryptedCount The encrypted count to add (must be >= 1)
    /// @param inputProof The FHE input proof
    function addCategoryPreference(
        uint32 categoryId,
        externalEuint32 encryptedCount,
        bytes calldata inputProof
    ) external {
        euint32 count = FHE.fromExternal(encryptedCount, inputProof);
        
        // Initialize if first time for this category
        if (!_hasInitialized[msg.sender][categoryId]) {
            _encryptedCategoryCounts[msg.sender][categoryId] = count;
            _hasInitialized[msg.sender][categoryId] = true;
            
            // Track this category for the user
            if (!_categoryExists[msg.sender][categoryId]) {
                _userCategories[msg.sender].push(categoryId);
                _categoryExists[msg.sender][categoryId] = true;
            }
        } else {
            // Add to existing count
            _encryptedCategoryCounts[msg.sender][categoryId] = FHE.add(
                _encryptedCategoryCounts[msg.sender][categoryId],
                count
            );
        }

        // Grant decryption permissions to the user
        FHE.allowThis(_encryptedCategoryCounts[msg.sender][categoryId]);
        FHE.allow(_encryptedCategoryCounts[msg.sender][categoryId], msg.sender);

        emit CategoryPreferenceAdded(msg.sender, categoryId, block.timestamp);
    }

    /// @notice Get the encrypted count for a user's category
    /// @param user The user address
    /// @param categoryId The category ID
    /// @return encryptedCount The encrypted category count
    function getEncryptedCategoryCount(address user, uint32 categoryId)
        external
        view
        returns (euint32 encryptedCount)
    {
        return _encryptedCategoryCounts[user][categoryId];
    }

    /// @notice Check if a user has initialized a category
    /// @param user The user address
    /// @param categoryId The category ID
    /// @return Whether the user has initialized this category
    function hasInitialized(address user, uint32 categoryId) external view returns (bool) {
        return _hasInitialized[user][categoryId];
    }

    /// @notice Get all category IDs for a user
    /// @param user The user address
    /// @return categoryIds Array of category IDs the user has interacted with
    function getUserCategories(address user) external view returns (uint32[] memory categoryIds) {
        return _userCategories[user];
    }

    /// @notice Check if a category exists for a user
    /// @param user The user address
    /// @param categoryId The category ID
    /// @return Whether the category exists for the user
    function categoryExists(address user, uint32 categoryId) external view returns (bool) {
        return _categoryExists[user][categoryId];
    }

    /// @notice Add multiple category preferences in a single transaction
    /// @param categoryIds Array of category IDs to add preferences for
    /// @param encryptedCounts Array of encrypted counts for each category
    /// @param inputProof The FHE input proof for all encrypted values
    function batchAddPreferences(
        uint32[] calldata categoryIds,
        externalEuint32[] calldata encryptedCounts,
        bytes calldata inputProof
    ) external {
        require(categoryIds.length == encryptedCounts.length, "Array length mismatch");
        require(categoryIds.length > 0, "Cannot add empty batch");
        require(categoryIds.length <= 10, "Batch size limited to 10 preferences for gas efficiency");

        for (uint256 i = 0; i < categoryIds.length; i++) {
            uint32 categoryId = categoryIds[i];
            euint32 count = FHE.fromExternal(encryptedCounts[i], inputProof);

            // Initialize if first time for this category
            if (!_hasInitialized[msg.sender][categoryId]) {
                _encryptedCategoryCounts[msg.sender][categoryId] = count;
                _hasInitialized[msg.sender][categoryId] = true;

                // Track this category for the user
                if (!_categoryExists[msg.sender][categoryId]) {
                    _userCategories[msg.sender].push(categoryId);
                    _categoryExists[msg.sender][categoryId] = true;
                }
            } else {
                // Add to existing count
                _encryptedCategoryCounts[msg.sender][categoryId] = FHE.add(
                    _encryptedCategoryCounts[msg.sender][categoryId],
                    count
                );
            }

            emit CategoryPreferenceAdded(msg.sender, categoryId, block.timestamp);
        }

        emit StatisticsUpdated(msg.sender);
    }

    /// @notice Get preference statistics for a user
    /// @param user The user address
    /// @return totalCategories Total number of categories the user has preferences for
    /// @return totalPreferences Total encrypted count across all categories
    /// @return averagePreferences Average encrypted preferences per category
    function getPreferenceStatistics(address user)
        external
        view
        returns (uint256 totalCategories, euint32 totalPreferences, euint32 averagePreferences)
    {
        totalCategories = _userCategories[user].length;
        if (totalCategories == 0) {
            totalPreferences = FHE.asEuint32(0);
            averagePreferences = FHE.asEuint32(0);
            return (totalCategories, totalPreferences, averagePreferences);
        }

        // Calculate total preferences across all categories
        euint32 total = FHE.asEuint32(0);
        for (uint256 i = 0; i < totalCategories; i++) {
            uint32 categoryId = _userCategories[user][i];
            total = FHE.add(total, _encryptedCategoryCounts[user][categoryId]);
        }

        totalPreferences = total;
        averagePreferences = FHE.div(total, FHE.asEuint32(totalCategories));

        return (totalCategories, totalPreferences, averagePreferences);
    }
}

