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
            .option( 'keyvar', {
                desc: 'the name of an environment variable containing the key to use'
            } )
            .option( 'json', {
                desc: 'outputs the result in json',
                default: false
            } )
            .demandOption( 'key', 'You must specify a decryption key!' );
    },
    describe: 'Decrypt the given secret using the specifed key.',
    handler: async options => {
        if ( typeof options.secret === 'undefined' ) {
            options.secret = await read_from_stdin();
        }

        const encrypted_info = enveloper.from_string( options.secret );

        if ( typeof options.key !== 'undefined' ) {
            encrypted_info.key = options.key;
        }
        else if ( typeof options.keyvar !== 'undefined' ) {
            encrypted_info.key = process.env[ options.keyvar ];
        }
        else {
            console.error( 'You must specify a decryption key using either --key or --keyvar!' );
            process.exit( 1 );
        }

        const result = enveloper.open( encrypted_info );

        console.log( options.json ? JSON.stringify( result, null, 4 ) : result.decrypted );
    }
};
