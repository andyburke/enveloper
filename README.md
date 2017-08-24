![enveloper](/enveloper.png?raw=true)

enveloper
=========

enveloper is a small, simple utility to encrypt secrets.

# Installation

```
npm install enveloper
```

# API

## seal( secret[, options ] )

'seals' (encrypts) the given secret.

### options

| option             | default        | description                                                                              |
| ------------------ | -------------- | ---------------------------------------------------------------------------------------- |
| key                | auto generated | the key to use for encryption                                                            |
| algorithm          | aes-256-gcm    | encryption algorithm to use, which must support an initialization vector and an auth tag |
| key_hash_algorithm | sha256         | hashing algorithm for the key                                                            |
| input_encoding     | utf8           | input encoding of the secret                                                             |
| output_encoding    | base64         | output encoding for the encrypted value                                                  |
| iv                 | auto generated | initialization vector for the encryption algorithm                                       |

### example

```javascript
const enveloper = require( 'enveloper' );

const result = enveloper.seal( 'foo' );

// result:
// {
//     encrypted: 'k6Dp',
//     tag: '4ibYKY3u0CzgSeXkRmipuQ==',
//     key: 'twWq+Ah/UwCbOwYwx/tHL6Q5VurE2vGmzXkjczB+62bOGtUoppTfMF8Ukm0uRL0Tk8vo+UhW32H46qVKCxg2bQ==',
//     algorithm: 'aes-256-gcm',
//     key_hash_algorithm: 'sha256',
//     input_encoding: 'utf8',
//     output_encoding: 'base64',
//     iv: 'Zuv+EphpT8Kkjh9acWAMbQ=='
// }
```

## open( options )

'opens' (decrypts) the given secret using the specified options

### options

| option             | required | description                                                 |
| ------------------ | -------- | ----------------------------------------------------------- |
| encrypted          | yes      | the encrypted value to decrypt                              |
| key                | yes      | the key to use for decryption                               |
| iv                 | yes      | initialization vector                                       |
| tag                | yes      | the auth tag                                                |
| algorithm          | no       | encryption algorithm to use, assumes default                |
| key_hash_algorithm | no       | hashing algorithm for the key, assumes default              |
| input_encoding     | no       | input encoding of the secret, assumes default               |
| output_encoding    | no       | output encoding for the encrypted value, assumes default    |

### example

```javascript
const enveloper = require( 'enveloper' );

const result = enveloper.open( {
    encrypted: 'k6Dp',
    key: 'twWq+Ah/UwCbOwYwx/tHL6Q5VurE2vGmzXkjczB+62bOGtUoppTfMF8Ukm0uRL0Tk8vo+UhW32H46qVKCxg2bQ==',
    iv: 'Zuv+EphpT8Kkjh9acWAMbQ==',
    tag: '4ibYKY3u0CzgSeXkRmipuQ=='
} );

// result:
// {
//     decrypted: 'foo',
//     algorithm: 'aes-256-gcm',
//     key_hash_algorithm: 'sha256',
//     input_encoding: 'utf8',
//     output_encoding: 'base64',
//     encrypted: 'k6Dp',
//     key: 'twWq+Ah/UwCbOwYwx/tHL6Q5VurE2vGmzXkjczB+62bOGtUoppTfMF8Ukm0uRL0Tk8vo+UhW32H46qVKCxg2bQ==',
//     iv: 'Zuv+EphpT8Kkjh9acWAMbQ==',
//     tag: '4ibYKY3u0CzgSeXkRmipuQ=='
// }
```

## to_string( options )

converts a .seal() result to a string

### example

```javascript
const enveloper = require( 'enveloper' );

const sealed = enveloper.seal( 'foo' );

const str = enveloper.to_string( sealed );

// str:
// aes-256-gcm::sha256::base64::Zuv+EphpT8Kkjh9acWAMbQ==::k6Dp::4ibYKY3u0CzgSeXkRmipuQ==
```

## from_string( options )

parses a string into a set of enveloper options

### example

```javascript
const enveloper = require( 'enveloper' );

const sealed = enveloper.seal( 'foo' );

const str = enveloper.to_string( sealed );

const sealed_from_string = enveloper.from_string( str );

// sealed_from_string:
// {
//     algorithm: 'aes-256-gcm',
//     key_hash_algorithm: 'sha256',
//     output_encoding: 'base64',
//     iv: 'Zuv+EphpT8Kkjh9acWAMbQ==',
//     encrypted: 'k6Dp',
//     tag: '4ibYKY3u0CzgSeXkRmipuQ=='
// }
```
# Contributing

Pull requests are very welcome! Just make sure your code:

1) Passes eslint given the included .eslintrc.json

2) Follows the same style as existing code
