# **json‑seal**
![npm version](https://img.shields.io/npm/v/json-seal)
![Deterministic JSON](https://img.shields.io/badge/Deterministic%20JSON-RFC%208785%20Compliant-success)
![crypto](https://img.shields.io/badge/crypto-RSA--PSS-green)
![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![types](https://img.shields.io/badge/types-TypeScript-blue)
![bundle size](https://img.shields.io/bundlephobia/minzip/json-seal)
![npm downloads](https://img.shields.io/npm/dm/json-seal)

**A lightweight, zero‑dependency library for creating cryptographically signed, tamper‑proof JSON backups.**

---

## **Why json‑seal**

Apps often need to store or transmit JSON in a way that guarantees it hasn’t been tampered with — without relying on servers, tokens, or opaque binary formats. Most security libraries focus on encrypted blobs, authentication tokens, or low‑level crypto primitives, but none solve the simple problem:

**“I need to store JSON in a way that guarantees integrity — while keeping it readable, portable, and framework‑agnostic.”**

json‑seal fills that gap. It lets you:

- Canonicalize any JSON value  
- Sign it with a private key  
- Embed the public key  
- Verify integrity later  
- Detect any tampering — even a single character  

It’s like JWS, but for **arbitrary JSON documents**, without JWT complexity, and designed for **offline‑first apps**, **local backups**, and **portable integrity checks**. It turns any JSON value into a **portable, human‑readable, cryptographically signed artifact** that can be verified anywhere, on any device, with no external dependencies.

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

### **Works Everywhere**
Browsers, PWAs, Node 18+, Bun, Deno, and mobile runtimes.

### **Zero Dependencies**
Small, auditable, and safe for long‑term use.

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
const tampered = { ...backup, payload: { id: 1, data: "hacked" } };

verifyBackup(tampered).valid; // false
```

---

## **API**

### **`generateKeyPair()`**  
Generates a 2048‑bit RSA‑PSS keypair.

### **`signPayload(payload, privateKey, publicKey)`**  
Canonicalizes the payload, signs it, and returns a sealed backup object.

### **`verifyBackup(backup)`**  
Verifies the signature and returns `{ valid, payload? }`.

### **`canonicalize(value)`**  
Full RFC 8785 Canonical JSON implementation.

---

## **Prior Art**

json‑seal builds on ideas from:

- **json-canonicalize** — RFC 8785 canonicalization (no signing or backup format)  
- **rfc8785 (Python)** — pure Python canonicalizer  
- **jcs (Elixir)** — Elixir implementation of JCS  
- **JOSE / JWS / JWT** — signing standards focused on tokens, not arbitrary JSON  

json‑seal combines **canonicalization + signing + verification** into a single, zero‑dependency library designed for **offline‑first, portable JSON integrity**.

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