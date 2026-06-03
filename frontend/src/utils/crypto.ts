// Using Web Crypto API for secure browser-side encryption

/**
 * Derives an AES-GCM encryption key from a string password.
 * (If we want the user to manage a string, otherwise we could generate a raw key)
 */
export async function generateKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true, // extractable, so we can save it to a file
        ["encrypt", "decrypt"]
    );
}

/**
 * Exports a CryptoKey to a Base64 string so it can be downloaded/saved
 */
export async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("raw", key);
    const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
    return btoa(exportedAsString);
}

/**
 * Imports a CryptoKey from a Base64 string (uploaded from file)
 */
export async function importKey(base64Key: string): Promise<CryptoKey> {
    const rawKey = atob(base64Key);
    const rawKeyArray = new Uint8Array(new ArrayBuffer(rawKey.length));
    for (let i = 0; i < rawKey.length; i++) {
        rawKeyArray[i] = rawKey.charCodeAt(i);
    }

    return await window.crypto.subtle.importKey(
        "raw",
        rawKeyArray,
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypts a plaintext string using the provided key.
 * Returns a Base64 string containing both the IV and the ciphertext.
 */
export async function encryptData(text: string, key: CryptoKey): Promise<string> {
    const encoded = new TextEncoder().encode(text);
    // The IV must be unique for every encryption operation
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encoded
    );

    // Concatenate IV and ciphertext
    const ciphertextArray = new Uint8Array(ciphertext);
    const payload = new Uint8Array(iv.length + ciphertextArray.length);
    payload.set(iv, 0);
    payload.set(ciphertextArray, iv.length);

    // Convert to base64 for safe storage
    let base64String = btoa(String.fromCharCode(...payload));
    return base64String;
}

/**
 * Decrypts a Base64 string (containing IV + ciphertext) using the provided key.
 */
export async function decryptData(encryptedBase64: string, key: CryptoKey): Promise<string> {
    try {
        const rawPayload = atob(encryptedBase64);
        const payloadArray = new Uint8Array(new ArrayBuffer(rawPayload.length));
        for (let i = 0; i < rawPayload.length; i++) {
            payloadArray[i] = rawPayload.charCodeAt(i);
        }

        // Extract the IV (first 12 bytes) and ciphertext (the rest)
        const iv = payloadArray.slice(0, 12);
        const ciphertext = payloadArray.slice(12);

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error("Decryption failed", e);
        return "*** (Decryption Failed)";
    }
}
