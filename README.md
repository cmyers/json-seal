<h1 align="center">json-seal</h1>

<p align="center">
  <img src="https://github.com/cmyers/json-seal/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI" />
  <img src="https://img.shields.io/npm/v/json-seal" alt="npm version" />
  <img src="https://img.shields.io/badge/Deterministic%20JSON-RFC%208785%20Compliant-success" alt="Deterministic JSON" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="dependencies" />
  <img src="https://img.shields.io/badge/types-TypeScript-blue" alt="types" />
  <img src="https://img.shields.io/bundlephobia/minzip/json-seal" alt="bundle size" />
  <img src="https://img.shields.io/github/license/cmyers/json-seal" alt="license" />
</p>

<h3 align="center">
  A lightweight, zero‑dependency library for creating cryptographically signed, tamper‑proof JSON backups.
</h3>

---

## **Why json‑seal**

Apps often need to store or transmit JSON in a way that guarantees it hasn’t been tampered with — without relying on servers, tokens, or opaque binary formats. Most security libraries focus on encrypted blobs, authentication tokens, or low‑level crypto primitives, but none solve the simple problem:

**“I need to store JSON in a way that guarantees integrity — while keeping it readable, portable, and framework‑agnostic.”**

json‑seal fills that gap. It lets you:

- Canonicalise any **JSON‑compatible JavaScript value** into deterministic JSON text  
- Sign it with a private key  
- Embed the public key  
- Verify integrity later  
- Detect any tampering

It’s built for **offline‑first apps**, **local backups**, and **portable integrity checks**, where JSON must remain human‑readable and self‑verifying.

---

## **What json‑seal accepts**

`signPayload()` accepts any **JSON‑compatible JavaScript value**, including:

- objects  
- arrays  
- strings  
- numbers  
- booleans  
- null  

Typed TypeScript interfaces work automatically as long as their fields are JSON‑compatible.

### **Rejected values**

json‑seal **does not** accept values that cannot appear in JSON:

- `undefined`  
- functions  
- class instances  
- Dates  
- Maps / Sets  
- Symbols  
- BigInts  
- circular references  
- objects containing unsupported values  

These are rejected at runtime with a clear error.

### **Important**

json‑seal signs **values**, not JSON text.

```ts
signPayload('{"a":1}') // ❌ signs the string literally
signPayload({ a: 1 })  // ✔ signs the object
```

---

## **Features**

### **RFC 8785 Canonical JSON**
Deterministic, cross‑runtime canonicalization:

- sorted keys  
- strict number formatting  
- ECMAScript string escaping  
- duplicate‑key rejection  
- stable UTF‑8 output  

### **RSA‑PSS Signatures**
Modern asymmetric signing using WebCrypto.  
No shared secrets. No servers. No dependencies.

### **Portable JSON Backup Format**
Everything needed for verification is embedded:

- payload  
- timestamp  
- signature  
- public key  

### **Works with any JavaScript platform**
Browsers, PWAs, Node 18+, Bun, Deno, and mobile runtimes.

### **Interoperability**
json‑seal follows the WebCrypto RSA‑PSS specification (SHA‑256, saltLength = 32).
Environments built directly on OpenSSL defaults may not verify signatures unless configured to match WebCrypto’s parameters

### **Zero Dependencies**
Uses the built‑in WebCrypto API (no polyfills, no external crypto libraries). Small, auditable, and safe for long‑term use.

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

## **Example Backup**

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

---

## **Tamper Detection**

Any modification — even deep inside nested objects — invalidates the signature.

```ts
const tampered = { ...backup, payload: { id: 1, data: "modified" } };

verifyBackup(tampered).valid; // false
```

---

## **API**

### **`generateKeyPair()`**  
Generates a 2048‑bit RSA‑PSS keypair.

### **`signPayload(payload, privateKey, publicKey)`**  
Canonicalizes the payload, signs it, and returns a sealed backup object.  
The payload must be **JSON‑compatible** (see “What json‑seal accepts”).

### **`verifyBackup(backup)`**  
Verifies the signature and returns `{ valid, payload? }`.

### **`canonicalize(value)`**  
Full RFC 8785 Canonical JSON implementation.

---

## Prior Art

### JSON Web Signature (JWS)

JWS is the established IETF standard for signing JSON‑related data, but it solves a very different problem. JWS is designed for **token exchange between untrusted parties** (OAuth, OpenID Connect, identity providers), not for **deterministic, portable, tamper‑evident JSON objects**.

Key differences:

- **JWS signs bytes, not JSON**  
  The payload must be base64url‑encoded. Two equivalent JSON objects can produce different signatures.

- **No canonicalization**  
  JWS does not define how JSON should be normalized. json‑seal uses deterministic canonicalization so the same logical object always produces the same signature.

- **Heavy structural overhead**  
  Protected headers, unprotected headers, algorithm identifiers, key IDs, and two serialization formats (compact and JSON).

- **Not offline‑first**  
  JWS is built for network protocols. json‑seal is built for sealed backups, hash chains, and local integrity.

- **Not WebView‑friendly**  
  Most JOSE libraries depend on Node’s crypto module. json‑seal uses WebCrypto and works in browsers, Ionic, Capacitor, and mobile WebViews.

### In contrast

json‑seal focuses on a simpler, narrower goal:

- **Pure JSON in, pure JSON out**  
- **Deterministic canonicalization**  
- **WebCrypto‑based RSA‑PSS signatures**  
- **Self‑contained sealed objects with embedded public keys**  
- **Zero dependencies**  
- **Portable across browsers, Node, Deno, Bun, and hybrid mobile apps**  

It’s not a replacement for JWS — it’s a lightweight alternative for cases where you simply need to **seal JSON and verify it later**, without the complexity of JOSE.

---

## **Testing**

The test suite covers:

- RFC 8785 canonicalization  
- Unicode and number edge cases  
- Valid signatures  
- Shallow and deep tampering  
- Missing / wrong / corrupted signatures  
- Large payloads  
- Arrays and primitives  
- RSA‑PSS non‑determinism  

Run tests:

```bash
npm test
```
---

Pull Requests are welcome.

## **License**

MIT

---
