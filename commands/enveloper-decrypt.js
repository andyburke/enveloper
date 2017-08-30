#!/usr/bin/node

'use strict';

const enveloper = require( '../index.js' );
const pkg = require( '../package.json' );

module.exports = {
    command: 'decrypt <secret> <key> [--json]',
    builder: {
        json: {
            default: false
        }
    },
    describe: 'Decrypt the given secret using the specifed key.',
    handler: options => {
        // if ( typeof options.secret === 'undefined' ) {
        //     throw new Error( 'You must specify the secret to decrypt!' );
        // }

        // if ( typeof options.key === 'undefined' ) {
        //     throw new Error( 'You must specify the decryption key with the --key argument!' );
        // }

        const encrypted_info = enveloper.from_string( options.secret );
        encrypted_info.key = options.key;

        const result = enveloper.open( encrypted_info );

        if ( options.json ) {
            console.log( JSON.stringify( result, null, 4 ) );
        }
        else {
            console.log( result.decrypted );
        }

    }
};
