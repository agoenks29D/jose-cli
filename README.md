# jose CLI

> CLI tools for [jose library](https://github.com/panva/jose)

## Description

Generating secret key (symmetric) and pair keys (asymmetric) easily for the [jose](https://github.com/panva/jose) library. You can actually create it manually/automatically through the documentation published by the creator.

## Motivation

I struggled when trying to generate a new key using the jose library and waited for someone to provide the key generator I needed. Eventually, I had to create it myself, and it became my contribution as a developer to help others by making it easier for them.

## Installation

```bash
npm install jose-cli -g
```

## Generate secret key

> [Symmetric Secret Generation](https://github.com/panva/jose/blob/main/docs/functions/key_generate_secret.generateSecret.md)

**Command :** `generate:secret` **/** `secret`

```bash
jose secret
```

Generate & save **secret key**

```bash
jose secret --save
```

Generate with custom file name

```bash
jose secret --save MySecret
```

Help command

```bash
jose secret -h
```

## Generate key pair

> [Asymmetric Key Pair Generation](https://github.com/panva/jose/blob/main/docs/functions/key_generate_key_pair.generateKeyPair.md)

**Command :** `generate:keypair` **/** `keypair`

```bash
jose keypair 
```

Generate **key pair** + **JWK**

```bash
jose keypair --jwk
```

Generate **key pair** + **JWK** & export as **file**

```bash
jose keypair --jwk --save
```

Generate with custom file name

```bash
jose keypair --jwk MyJWK --save MyKey
```

Help command

```bash
jose keypair -h
```
