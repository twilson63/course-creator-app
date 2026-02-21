/**
 * Password Hashing Utilities
 *
 * Provides secure password hashing and verification using Web Crypto API.
 * Uses SHA-256 with a 16-byte random salt.
 *
 * @module src/lib/auth/password
 */

/**
 * Hash a password with a random salt
 *
 * Algorithm:
 * 1. Generate 16 random bytes for salt
 * 2. Combine salt + password as UTF-8 bytes
 * 3. Hash with SHA-256
 * 4. Return as "base64(salt):base64(hash)"
 *
 * @param password - Plain text password to hash
 * @returns Promise<string> - Hash in format "salt:hash" (both base64 encoded)
 *
 * @example
 * const hash = await hashPassword('mySecret123');
 * // Returns: "abc123...base64...:def456...base64..."
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate 16 random bytes for salt (128 bits)
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  // Convert password to bytes
  const passwordBytes = new TextEncoder().encode(password);

  // Combine salt + password
  const combined = new Uint8Array(salt.length + passwordBytes.length);
  combined.set(salt, 0);
  combined.set(passwordBytes, salt.length);

  // Hash with SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  const hash = new Uint8Array(hashBuffer);

  // Return as "base64(salt):base64(hash)"
  return `${bufferToBase64(salt)}:${bufferToBase64(hash)}`;
}

/**
 * Verify a password against a stored hash
 *
 * @param password - Plain text password to verify
 * @param storedHash - Hash from hashPassword() in format "salt:hash"
 * @returns Promise<boolean> - True if password matches
 *
 * @example
 * const isValid = await verifyPassword('mySecret123', storedHash);
 * if (isValid) {
 *   // Password correct
 * }
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    // Parse stored hash
    const parts = storedHash.split(':');
    if (parts.length !== 2) {
      return false;
    }

    const [saltBase64, hashBase64] = parts;

    // Decode salt and hash
    const salt = base64ToBuffer(saltBase64);
    const storedHashBytes = base64ToBuffer(hashBase64);

    if (!salt || !storedHashBytes) {
      return false;
    }

    // Convert password to bytes
    const passwordBytes = new TextEncoder().encode(password);

    // Combine salt + password (same as hashing)
    const combined = new Uint8Array(salt.length + passwordBytes.length);
    combined.set(salt, 0);
    combined.set(passwordBytes, salt.length);

    // Hash the combined input
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    const computedHash = new Uint8Array(hashBuffer);

    // Timing-safe comparison
    return timingSafeEqual(storedHashBytes, computedHash);
  } catch {
    return false;
  }
}

/**
 * Convert Uint8Array to base64 string
 */
function bufferToBase64(buffer: Uint8Array): string {
  // Convert to binary string
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]!);
  }
  // Convert to base64
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array
 * Returns null if decoding fails
 */
function base64ToBuffer(base64: string): Uint8Array | null {
  try {
    // Decode base64 to binary string
    const binary = atob(base64);
    // Convert to Uint8Array
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer;
  } catch {
    return null;
  }
}

/**
 * Timing-safe comparison to prevent timing attacks
 * Always compares all bytes, regardless of early mismatches
 */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  // Different lengths = different values
  // But still compare to maintain constant time
  const maxLength = Math.max(a.length, b.length);
  let result = a.length === b.length ? 0 : 1;

  for (let i = 0; i < maxLength; i++) {
    // Use 0 for out-of-bounds to maintain constant time
    const aVal = i < a.length ? a[i]! : 0;
    const bVal = i < b.length ? b[i]! : 0;
    // XOR: 0 if equal, non-zero if different
    result |= aVal ^ bVal;
  }

  return result === 0;
}