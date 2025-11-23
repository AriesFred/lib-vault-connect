# Liib Vault Reading Preference System - API Reference

## Smart Contract Functions

### Core Functions

#### `addCategoryPreference(uint32 categoryId, externalEuint32 encryptedCount, bytes inputProof)`
Add a preference count for a specific reading category.
- **Parameters:**
  - `categoryId`: Category ID (e.g., 1=Science Fiction, 2=Mystery)
  - `encryptedCount`: Encrypted count to add
  - `inputProof`: FHE input proof

#### `batchAddPreferences(uint32[] categoryIds, externalEuint32[] encryptedCounts, bytes inputProof)`
Add multiple category preferences in a single transaction.
- **Parameters:**
  - `categoryIds`: Array of category IDs
  - `encryptedCounts`: Array of encrypted counts
  - `inputProof`: FHE input proof
  - Maximum 10 preferences per batch

### Statistics Functions

#### `getEncryptedCategoryCount(address user, uint32 categoryId)`
Get the encrypted count for a user's category.
- **Returns:** Encrypted category count

#### `getUserCategories(address user)`
Get all category IDs for a user.
- **Returns:** Array of category IDs

#### `getPreferenceStatistics(address user)`
Get comprehensive preference statistics.
- **Returns:** `(totalCategories, totalPreferences, averagePreferences)`

### Utility Functions

#### `hasInitialized(address user, uint32 categoryId)`
Check if a user has initialized a category.
- **Returns:** Boolean indicating initialization status

#### `categoryExists(address user, uint32 categoryId)`
Check if a category exists for a user.
- **Returns:** Boolean indicating existence

## Category System

The system supports various reading categories:
- `1`: Science Fiction
- `2`: Mystery/Thriller
- `3`: Romance
- `4`: Fantasy
- `5`: Non-Fiction
- `6`: Biography
- `7`: History
- `8`: Self-Help
- `9`: Poetry
- `10`: Other

## Security Features

- **FHE Encryption**: All preference data is fully homomorphically encrypted
- **Private Analytics**: Statistics computation happens on encrypted data
- **Zero-Knowledge**: No plaintext data is ever stored or revealed
- **Secure Operations**: All operations maintain privacy guarantees

## Error Handling

- Invalid category IDs
- Array length mismatches in batch operations
- Missing FHE proofs
- Gas limit exceeded for large batches
