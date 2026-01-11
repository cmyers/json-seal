# **json‑seal**
# json‑seal
Cryptographically signed, tamper‑proof JSON backups for apps — zero dependencies and a tiny footprint under 5 kB.

json‑seal lets you:

- Canonicalize any JSON object  
- Sign it with a private key  
- Embed the public key  
- Verify integrity later  
- Detect any tampering — even a single character  

It’s like JWS, but for **arbitrary JSON documents**, without JWT baggage, and designed for **offline‑first apps**, **local backups**, and **portable integrity checks**.

---

## **Why json‑seal?**

Most signing libraries assume:

- JWT semantics  
- base64url encoding  
- fixed claim structures  
- web‑auth use cases  

json‑seal is different.

It’s built for apps that need:

- Portable, self‑contained backups  
- Cryptographic tamper detection  
- Deterministic canonicalization  
- Zero dependencies  
- Clean TypeScript API  
- Works in Node today (browser support coming next)  

If the JSON changes — even whitespace — verification fails.

---

## **Installation**

```bash
npm install json-seal
```

---

## **Quick Start**

### **Generate a keypair**

```ts
import { generateKeyPair } from "json-seal";

const { privateKey, publicKey } = generateKeyPair();
```

### **Sign a payload**

```ts
import { signPayload } from "json-seal";

const payload = { id: 1, data: "hello" };

const backup = signPayload(payload, privateKey, publicKey);
```

### **Verify a backup**

```ts
import { verifyBackup } from "json-seal";

const result = verifyBackup(backup);

if (result.valid) {
  console.log("Payload:", result.payload);
}
```

---

## **What a signed backup looks like**

```json
{
  "version": 1,
  "timestamp": "2026-01-11T18:24:55.402Z",
  "payload": { "id": 1, "data": "hello" },
  "signature": {
    "algorithm": "RSA-PSS-SHA256",
    "publicKey": "-----BEGIN PUBLIC KEY----- ...",
    "value": "base64-signature"
  }
}
```

Everything needed to verify the backup is embedded.

---

## **Tamper Detection**

Any modification — even deep inside nested objects — invalidates the signature.

```ts
const tampered = { ...backup, payload: { id: 1, data: "hacked" } };

verifyBackup(tampered).valid; // false
```

---

## **Key Management**

`generateKeyPair()` should be called **once**, not on every backup.  
Apps are expected to generate or receive a keypair during onboarding and store it securely.

### **App‑generated keys**

Most offline‑first apps generate a keypair on first launch:

```ts
import { generateKeyPair } from "json-seal";

const { privateKey, publicKey } = generateKeyPair();

// Store securely (examples below)
secureStore.set("privateKey", privateKey);
secureStore.set("publicKey", publicKey);
```

On subsequent runs, the app loads the stored keys:

```ts
const privateKey = secureStore.get("privateKey");
const publicKey = secureStore.get("publicKey");

const backup = signPayload(data, privateKey, publicKey);
```

### **Where to store keys**

Storage depends on the platform:

- **iOS** → Keychain  
- **Android** → Keystore  
- **Web** → IndexedDB + WebCrypto (coming soon)  
- **Desktop** → OS keyring or encrypted local file  
- **Node** → environment variables or encrypted file  

json‑seal intentionally does **not** handle storage so it can remain environment‑agnostic.

### **Server‑generated keys**

Some architectures prefer the backend to generate and manage keys:

1. Server generates keypair  
2. Server stores private key  
3. Server sends public key to the app  
4. App signs backups using the server’s public key  
5. Server verifies integrity later  

This is useful for multi‑device accounts or enterprise systems.

### **Key rotation**

json‑seal embeds the public key inside each backup, so old backups remain verifiable even after rotation.

A typical rotation strategy:

- generate a new keypair yearly  
- store the new private key  
- keep old public keys for verification  
- continue verifying old backups without breaking anything  

### **Importing and exporting keys**

Keys are standard PEM strings, so they can be:

- backed up  
- migrated between devices  
- synced across platforms  
- exported/imported by the user  

This makes json‑seal suitable for long‑term, portable backup formats.

---

## **API**

### `generateKeyPair()`
Generates a 2048‑bit RSA keypair.

### `signPayload(payload, privateKey, publicKey)`
- Canonicalizes the JSON  
- Signs it using RSA‑PSS SHA‑256  
- Embeds the public key  
- Returns a portable backup object  

### `verifyBackup(backup)`
- Re‑canonicalizes the payload  
- Verifies the signature  
- Returns `{ valid: boolean, payload?: any }`  

### `canonicalize(obj)`
Deterministic JSON serializer with sorted keys.

---

## **Testing**

json‑seal ships with a full Vitest suite covering:

- Valid signatures  
- Shallow tampering  
- Deep tampering  
- Missing signature  
- Wrong public key  
- Corrupted signature  
- Canonicalization stability  
- Large payloads  
- Arrays and primitives  
- RSA‑PSS non‑determinism  

Run tests:

```bash
npm test
```

---

## **License**

MIT

---