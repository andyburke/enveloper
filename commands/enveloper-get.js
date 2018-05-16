'use strict';

require( 'dotenv' ).config();
const Delver = require( 'delver' );
const path = require( 'path' );
const util = require( 'util' );

const enveloper = require( path.resolve( path.join( __dirname, '..', 'index.js' ) ) );
const find_in_tree = util.promisify( require( 'walk-up' ) );

module.exports = {
    command: 'get [path] [--key <key>] [--keyvar <environment variable>] [--json] [--envelope <filename>]',
    builder: yargs => {
        yargs
            .positional( 'path', {
                desc: 'the path (dot separated) to store the secret at'
            } )
            .option( 'key', {
                desc: 'the encryption key, if not specified, one is generated'
            } )
            .option( 'keyvar', {
                desc: 'the name of an environment variable containing the key to use'
            } )
            .option( 'json', {
                desc: 'outputs the result in json',
                default: false
            } )
            .option( 'envelope', {
                desc: 'the filename to store to',
                default: 'envelope.json'
            } );
    },
    describe: 'Read the given secret from the envelope',
    handler: async options => {
        if ( typeof options.path !== 'string' ) {
            console.error( 'You must specify a path to the secret at in the envelope.' );
            process.exit( 1 );
        }

        const envelope_search_result = await find_in_tree( process.cwd(), options.envelope );

        if ( !envelope_search_result || !envelope_search_result.found ) {
            console.error( `Could not locate an envelope with filename: ${ options.envelope }` );
            process.exit( 1 );
        }

        const envelope_path = path.join( envelope_search_result.path, options.envelope );

        const envelope = require( envelope_path );

        const secret = Delver.get( envelope, options.path );

        const encrypted_info = enveloper.from_string( secret );

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
