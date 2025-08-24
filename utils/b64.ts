
/**
 * Decodes a Base64 string, correctly handling multi-byte UTF-8 characters.
 * The built-in `atob` function can corrupt such characters.
 * @param b64 The Base64 encoded string.
 * @returns The decoded string.
 */
export function decodeBase64(b64: string): string {
    try {
        const binStr = atob(b64);
        const len = binStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binStr.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    } catch (error) {
        console.error("Failed to decode base64 string:", error);
        return ""; // Return empty string on error
    }
}
