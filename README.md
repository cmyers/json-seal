# **json‑seal**
![npm version](https://img.shields.io/npm/v/json-seal)
![license](https://img.shields.io/npm/l/json-seal)
![types](https://img.shields.io/badge/types-TypeScript-blue)
![bundle size](https://img.shields.io/bundlephobia/minzip/json-seal)
![crypto](https://img.shields.io/badge/crypto-RSA--PSS-green)
![npm downloads](https://img.shields.io/npm/dm/json-seal)

Cryptographically signed, tamper‑proof JSON backups for apps - zero dependencies and a tiny footprint under 5 kB.

json‑seal lets you:

- Canonicalize any JSON object  
- Sign it with a private key  
- Embed the public key  
- Verify integrity later  
- Detect any tampering - even a single character  

It’s like JWS, but for **arbitrary JSON documents**, without JWT complexity, and designed for **offline‑first apps**, **local backups**, and **portable integrity checks**.

---

## **Why json‑seal exists**

Most security libraries focus on:

- encrypted blobs (iron‑webcrypto)  
- authentication tokens (JOSE/JWS/JWT)  
- low‑level primitives (WebCrypto, libsodium)  

None of these solves the problem of:

**“I need to store or transmit JSON in a way that guarantees it hasn’t been tampered with - while keeping it readable, portable, and framework‑agnostic.”**

json‑seal fills that gap.

It turns any JSON object into a **sealed artifact** that can be verified anywhere, on any device, without servers, shared secrets, or opaque binary formats. The result is a portable, human‑readable, cryptographically signed JSON document that remains trustworthy for years.

---

## **Features**

### **Deterministic canonicalization**  
json‑seal produces a deterministic, canonical byte representation of JSON values.
The same input always yields the same canonical output within a given runtime,
ensuring signatures remain stable and verifiable. **Cross‑runtime consistency will
be fully guaranteed as the canonicalizer reaches complete RFC 8785 compliance.**

### **RSA‑PSS digital signatures**  
Modern, secure, asymmetric signing using the WebCrypto API.
No shared passwords, no symmetric secrets, no server dependency.

### **Pure JSON seal format**
Human‑readable, portable, and easy to store, sync, export, or transmit.  
Everything needed for verification is embedded.

### **Browser + Node support**
Works anywhere `crypto.subtle` is available - modern browsers, PWAs, Node 18+, Bun, Deno, and edge runtimes.

### **Framework‑agnostic**
Angular, React, Vue, Svelte, Ionic, Capacitor, PWAs, Node, Bun, Deno - json‑seal fits everywhere.

### **Zero dependencies** 
Small, auditable, and safe for long‑term use.
No polyfills, no crypto libraries, no runtime baggage.

### **Perfect for offline‑first apps**
Protects:

- Local storage
- IndexedDB
- Sync engines
- User‑exported backups
- Cross‑device data portability

json‑seal is built for apps that need **trustworthy, tamper‑proof JSON**, not tokens or encrypted blobs.

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

const { privateKey, publicKey } = await generateKeyPair();
```

### **Sign a payload**

```ts
import { signPayload } from "json-seal";

const payload = { id: 1, data: "hello" };

const backup = await signPayload(payload, privateKey, publicKey);
```

### **Verify a backup**

```ts
import { verifyBackup } from "json-seal";

const result = await verifyBackup(backup);

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

Any modification - even deep inside nested objects - invalidates the signature.

```ts
const tampered = { ...backup, payload: { id: 1, data: "hacked" } };

verifyBackup(tampered).valid; // false
```

---

## **Key Management**

`generateKeyPair()` should be called **once**, not on every backup.  
Apps are expected to generate or receive a keypair during onboarding and store it securely.

---

### **App‑generated keys**

Most offline‑first apps generate a keypair on first launch:

```ts
import { generateKeyPair } from "json-seal";

const { privateKey, publicKey } = await generateKeyPair();

secureStore.set("privateKey", privateKey);
secureStore.set("publicKey", publicKey);
```

On subsequent runs:

```ts
const privateKey = secureStore.get("privateKey");
const publicKey = secureStore.get("publicKey");

const backup = await signPayload(data, privateKey, publicKey);
```

---

### **Where to store keys**

Storage depends on the platform:

- iOS → Keychain  
- Android → Keystore  
- Web → IndexedDB + WebCrypto  
- Desktop → OS keyring or encrypted local file  
- Node → environment variables or encrypted file  

json‑seal intentionally does **not** handle storage so it can remain environment‑agnostic.

---

### **Server‑generated keys**

Some architectures prefer the backend to generate and manage keys:

1. Server generates keypair  
2. Server stores private key  
3. Server sends public key to the app  
4. App signs backups using the server’s public key  
5. Server verifies integrity later  

Useful for multi‑device accounts or enterprise systems.

---

### **Key rotation**

json‑seal embeds the public key inside each backup, so old backups remain verifiable even after rotation.

Typical strategy:

- generate a new keypair yearly  
- store the new private key  
- keep old public keys for verification  
- continue verifying old backups without breaking anything  

---

### **Importing and exporting keys**

Keys are standard PEM strings, so they can be:

- backed up  
- migrated  
- synced  
- exported/imported  

Perfect for long‑term, portable backup formats.

---

## **API**

### **`generateKeyPair()`**
Generates a 2048‑bit RSA‑PSS keypair using WebCrypto.

### **`signPayload(payload, privateKey, publicKey)`**
- Canonicalizes the JSON  
- Signs it using RSA‑PSS SHA‑256  
- Embeds the public key  
- Returns a portable backup object  

### **`verifyBackup(backup)`**
- Re‑canonicalizes the payload  
- Verifies the signature  
- Returns `{ valid: boolean, payload?: any }`  

### **`canonicalize(obj)`**
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

Pull Requests welcome.

## **License**

MIT

---
