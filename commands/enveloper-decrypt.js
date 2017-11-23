'use strict';

const path = require( 'path' );
const enveloper = require( path.resolve( path.join( __dirname, '..', 'index.js' ) ) );

module.exports = {
    command: 'decrypt <secret> <key> [--json]',
    builder: {
        json: {
            default: false
        }
    },
    describe: 'Decrypt the given secret using the specifed key.',
    handler: options => {
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
