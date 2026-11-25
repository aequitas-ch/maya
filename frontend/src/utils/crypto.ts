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

/**
 * Derives a Master CryptoKey (AES-GCM-256) via HKDF from the PRF secret.
 */
export async function deriveMasterKey(prfSecret: ArrayBuffer, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        prfSecret,
        { name: "HKDF" },
        false,
        ["deriveKey"]
    );

    return await window.crypto.subtle.deriveKey(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: salt as BufferSource,
            info: new Uint8Array(0) as BufferSource,
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true, // make extractable if needed, or false for extra security. true for decrypting DEK.
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypts a File using a random DEK, and encrypts the DEK with the masterKey.
 * Returns the encrypted file blob, encrypted DEK (base64), and IV (base64).
 */
export async function encryptFile(file: File, masterKey: CryptoKey): Promise<{ ciphertextBlob: Blob, encryptedDekBase64: string, ivBase64: string }> {
    // Generate a random Data Encryption Key (DEK)
    const dek = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true, // Must be extractable so we can encrypt it with the master key
        ["encrypt", "decrypt"]
    );

    // Read file bytes
    const fileBytes = await file.arrayBuffer();

    // Encrypt file bytes with DEK
    const fileIv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: fileIv,
        },
        dek,
        fileBytes
    );
    const ciphertextBlob = new Blob([ciphertext], { type: "application/octet-stream" });

    // Export DEK to raw bytes to encrypt it
    const exportedDek = await window.crypto.subtle.exportKey("raw", dek);

    // Encrypt DEK with Master Key
    const masterIv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedDekBuffer = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: masterIv,
        },
        masterKey,
        exportedDek
    );

    // Convert encrypted DEK and IV to Base64
    const encryptedDekBase64 = btoa(Array.from(new Uint8Array(encryptedDekBuffer)).map(b => String.fromCharCode(b)).join(''));
    // We combine the masterIv and fileIv. Let's just return the masterIv for now,
    // but we actually need both or we store fileIv in the file.
    // Let's store fileIv and masterIv together in the 'iv' field.
    // They are 12 bytes each, 24 bytes total.

    const combinedIv = new Uint8Array(24);
    combinedIv.set(masterIv, 0);
    combinedIv.set(fileIv, 12);
    const ivBase64 = btoa(Array.from(combinedIv).map(b => String.fromCharCode(b)).join(''));

    return { ciphertextBlob, encryptedDekBase64, ivBase64 };
}

/**
 * Decrypts a file blob using the encrypted DEK and Master Key.
 */
export async function decryptFile(ciphertextBlob: Blob, encryptedDekBase64: string, ivBase64: string, masterKey: CryptoKey): Promise<Blob> {
    // Decode IVs
    const combinedIvStr = atob(ivBase64);
    const combinedIv = new Uint8Array(new ArrayBuffer(combinedIvStr.length));
    for (let i = 0; i < combinedIvStr.length; i++) {
        combinedIv[i] = combinedIvStr.charCodeAt(i);
    }
    const masterIv = combinedIv.slice(0, 12);
    const fileIv = combinedIv.slice(12, 24);

    // Decode encrypted DEK
    const encryptedDekStr = atob(encryptedDekBase64);
    const encryptedDek = new Uint8Array(new ArrayBuffer(encryptedDekStr.length));
    for (let i = 0; i < encryptedDekStr.length; i++) {
        encryptedDek[i] = encryptedDekStr.charCodeAt(i);
    }

    // Decrypt DEK with Master Key
    const decryptedDekBuffer = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: masterIv,
        },
        masterKey,
        encryptedDek
    );

    // Import DEK
    const dek = await window.crypto.subtle.importKey(
        "raw",
        decryptedDekBuffer,
        {
            name: "AES-GCM",
            length: 256,
        },
        false,
        ["encrypt", "decrypt"]
    );

    // Read ciphertext bytes
    const ciphertextBytes = await ciphertextBlob.arrayBuffer();

    // Decrypt file bytes with DEK
    const decryptedBytes = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: fileIv,
        },
        dek,
        ciphertextBytes
    );

    return new Blob([decryptedBytes]);
}
