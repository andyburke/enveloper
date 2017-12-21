'use strict';

const path = require( 'path' );

const enveloper = require( path.resolve( path.join( __dirname, '..', 'index.js' ) ) );
const read_from_stdin = require( path.resolve( path.join( __dirname, '..', 'read_from_stdin.js' ) ) );

module.exports = {
    command: 'decrypt [--key key] [secret] [--json]',
    builder: {
        json: {
            desc: 'outputs the result in json',
            default: false
        },
        key: {
            desc: 'the decryption key'
        }
    },
    describe: 'Decrypt the given secret using the specifed key.',
    handler: async options => {

        if ( typeof options.secret === 'undefined' ) {
            options.secret = await read_from_stdin();
        }

        try {
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
        catch( ex ) {
            console.error( ex );
        }

    }
};
