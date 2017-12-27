'use strict';

const path = require( 'path' );

const enveloper = require( path.resolve( path.join( __dirname, '..', 'index.js' ) ) );
const read_from_stdin = require( path.resolve( path.join( __dirname, '..', 'read_from_stdin.js' ) ) );

module.exports = {
    command: 'decrypt [secret] [--key <key>] [--json]',
    builder: yargs => {
        yargs
            .positional( 'secret', {
                desc: 'the secret to be decrypted'
            } )
            .option( 'key', {
                 desc: 'the decryption key'
            } )
            .option( 'json', {
                desc: 'outputs the result in json',
                default: false
            } )
            .demandOption( 'key', 'You must specify a decryption key!' );
    },
    describe: 'Decrypt the given secret using the specifed key.',
    handler: async options => {
        try {
            if ( typeof options.secret === 'undefined' ) {
                options.secret = await read_from_stdin();
            }

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
