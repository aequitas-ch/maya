/**
 * Utility to interact with WebAuthn PRF Extension.
 * Extracts a symmetric secret from a PassKey to be used as a master key.
 */

export async function getPassKeyPrfSecret(credentialId?: string): Promise<ArrayBuffer> {
    // Use a constant, application-specific salt to ensure the PRF secret is deterministic
    // and can be recovered across sessions.
    const saltString = "aequitas-medical-documents-salt!"; // exactly 32 bytes
    const saltBuffer = new TextEncoder().encode(saltString);

    const publicKey: PublicKeyCredentialRequestOptions = {
        challenge: new Uint8Array(32),
        timeout: 60000,
        userVerification: "required",
    };

    if (credentialId) {
        // Not used unless specific credential
        // publicKey.allowCredentials = [{ type: 'public-key', id: Uint8Array.from(...) }];
    }

    const assertion = await navigator.credentials.get({
        publicKey: {
            ...publicKey,
            extensions: {
                prf: {
                    eval: {
                        first: saltBuffer
                    }
                }
            } as any
        }
    }) as PublicKeyCredential;

    if (!assertion) {
        throw new Error("WebAuthn assertion failed or cancelled.");
    }

    const extensions = assertion.getClientExtensionResults();
    if (!extensions.prf || !extensions.prf.results || !extensions.prf.results.first) {
        throw new Error("PRF extension not supported or did not return a result.");
    }

    return extensions.prf.results.first as ArrayBuffer;
}
