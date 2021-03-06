'use strict';

require( 'dotenv' ).config();
const path = require( 'path' );

const enveloper = require( path.resolve( path.join( __dirname, '..', 'index.js' ) ) );
const read_from_stdin = require( path.resolve( path.join( __dirname, '..', 'read_from_stdin.js' ) ) );

module.exports = {
	command: 'encrypt [secret] [--key <key>] [--keyvar <environment variable>] [--json]',
	builder: ( yargs ) => {
		yargs
			.positional( 'secret', {
				desc: 'the secret to encrypt'
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
			} );
	},
	describe: 'Encrypt the given secret. If no key is specified, a key will be generated.',
	handler: async ( options ) => {
		const input = {};

		if ( typeof options.key !== 'undefined' ) {
			input.key = options.key;
		}
		else if ( typeof options.keyvar !== 'undefined' ) {
			input.key = process.env[ options.keyvar ];
		}

		if ( typeof options.secret === 'undefined' ) {
			options.secret = await read_from_stdin();
		}

		// cast to a string to ensure things like numbers are treated properly
		const result = enveloper.seal( String( options.secret ), input );

		if ( options.json ) {
			console.log( JSON.stringify( result, null, 4 ) );
		}
		else {
			const string_result = enveloper.to_string( result );

			console.log( string_result );

			if ( typeof options.key === 'undefined' ) {
				console.log( `autogenerated key: ${ result.key }` );
			}
		}

		return result;
	}
};
