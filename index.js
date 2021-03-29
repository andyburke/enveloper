'use strict';

const crypto = require( 'crypto' );
const deepmerge = require( 'deepmerge' );
const Delver = require( 'delver' );
const traverse = require( 'traverse' );
const util = require( 'util' );
const find_in_tree = util.promisify( require( 'walk-up' ) );

const DEFAULTS = {
	ALGORITHM: 'aes-256-gcm',
	INPUT_ENCODING: 'utf8',
	OUTPUT_ENCODING: 'base64',
	KEY_HASH_ALGORITHM: 'sha256',
	SEPARATOR: '::',
	STRING_ENCODING_FIELDS: [
		'algorithm',
		'key_hash_algorithm',
		'output_encoding',
		'iv',
		'encrypted',
		'tag'
	]
};

module.exports = {
	seal: function( secret, _options = {} ) {
		const options = deepmerge( {
			key: crypto.randomBytes( 64 ).toString( 'base64' ),
			algorithm: DEFAULTS.ALGORITHM,
			key_hash_algorithm: DEFAULTS.KEY_HASH_ALGORITHM,
			input_encoding: DEFAULTS.INPUT_ENCODING,
			output_encoding: DEFAULTS.OUTPUT_ENCODING,
			iv: crypto.randomBytes( 16 ).toString( 'base64' )
		}, _options );

		const hashed_key = options.key_hash_algorithm ? crypto.createHash( options.key_hash_algorithm ).update( options.key ).digest() : options.key;
		const cipher = crypto.createCipheriv( options.algorithm, hashed_key, options.iv );
		const encrypted = cipher.update( secret, options.input_encoding, options.output_encoding ) + cipher.final( options.output_encoding );
		const tag = cipher.getAuthTag().toString( 'base64' );
		return deepmerge( {
			encrypted,
			tag: tag
		}, options );
	},

	open: function( _options = {} ) {
		const options = deepmerge( {
			algorithm: DEFAULTS.ALGORITHM,
			key_hash_algorithm: DEFAULTS.KEY_HASH_ALGORITHM,
			input_encoding: DEFAULTS.INPUT_ENCODING,
			output_encoding: DEFAULTS.OUTPUT_ENCODING
		}, _options );

		const hashed_key = options.key_hash_algorithm ? crypto.createHash( options.key_hash_algorithm ).update( options.key ).digest() : options.key;
		const decipher = crypto.createDecipheriv( options.algorithm, hashed_key, options.iv );
		decipher.setAuthTag( Buffer.from( options.tag, 'base64' ) );

		const decrypted = decipher.update( options.encrypted, options.output_encoding, options.input_encoding ) + decipher.final( options.input_encoding );
		return deepmerge( {
			decrypted
		}, options );
	},

	to_string: function( _options = {} ) {
		const options = deepmerge( {
			separator: DEFAULTS.SEPARATOR,
			encoding_fields: DEFAULTS.STRING_ENCODING_FIELDS
		}, _options );

		const supported_output = options.output_encoding === 'hex' || options.output_encoding === 'base64';
		if ( !supported_output ) {
			throw new Error( `Unsupported output encoding: ${ options.output_encoding }` );
		}

		const result = options.encoding_fields.map( ( field ) => ( options[ field ] ) ).join( options.separator );

		return result;
	},

	from_string: function( input, _options = {} ) {
		const options = deepmerge( {
			separator: DEFAULTS.SEPARATOR,
			encoding_fields: DEFAULTS.STRING_ENCODING_FIELDS
		}, _options );

		const values = input.split( options.separator );

		if ( values.length !== options.encoding_fields.length ) {
			throw new Error( 'Could not parse input string.' );
		}

		const encrypted_info = deepmerge( {}, options );

		options.encoding_fields.forEach( ( field, index ) => {
			encrypted_info[ field ] = values[ index ];
		} );

		delete encrypted_info.separator;
		delete encrypted_info.encoding_fields;

		return encrypted_info;
	},

	get: async function( _options = {} ) {
		const options = deepmerge( {
			secrets: [],
			key: null,
			path: null,
			filename: 'envelope.json',
			directory: __dirname
		}, _options );

		let envelope_path = options.path;

		if ( !envelope_path ) {
			const envelope_search_result = await find_in_tree( options.directory, options.filename );

			if ( !envelope_search_result || !envelope_search_result.found ) {
				throw new Error( 'Could not locate an envelope.' );
			}

			const path = require( 'path' );
			envelope_path = path.join( envelope_search_result.path, options.filename );
		}

		const envelope = require( envelope_path );
		const environment = process.env.NODE_ENV;

		// allow for environment-specific things to override less environment-specific things
		const env_container = deepmerge.all( [ {}, envelope, ( environment && envelope[ environment ] || {} ) ] );
		if ( environment ) {
			delete env_container[ environment ];
		}

		if ( options.secrets.length ) {

			const result = {};
			options.secrets.forEach( ( secret ) => {

				const secret_spec_type = Array.isArray( secret ) ? 'array' : typeof secret;
				let secret_string = null;

				switch( secret_spec_type ) {
					case 'array':
						secret_string = traverse( env_container ).get( secret );
						break;
					case 'string':
						secret_string = Delver.get( env_container, secret );
						break;
					case 'object':
						if ( secret.name ) {
							secret_string = env_container[ secret.name ];
						}
						else if ( secret.path ) {
							secret_string = typeof secret.path === 'string' ? Delver.get( env_container, secret.path ) : traverse( env_container ).get( secret.path );
						}
						break;
					default:
						throw new Error( `Unknown secret spec type: ${ secret_spec_type }` );
				}

				if ( !secret_string ) {
					throw new Error( `Could not locate secret: ${ secret.name || secret.path } in ${ envelope_path }` );
				}

				const key = secret.key || options.key;

				const encrypted_secret = module.exports.from_string( secret_string );
				const decrypted_secret = module.exports.open( deepmerge( {
					key
				}, encrypted_secret ) );

				switch( secret_spec_type ) {
					case 'array':
						traverse( result ).set( secret, decrypted_secret.decrypted );
						break;
					case 'string':
						Delver.set( result, secret, decrypted_secret.decrypted );
						break;
					case 'object':
						if ( secret.name ) {
							result[ secret.name ] = decrypted_secret.decrypted;
						}
						else if ( secret.path ) {
							if ( typeof secret.path === 'string' ) {
								Delver.set( result, secret.path, decrypted_secret.decrypted );
							}
							else {
								traverse( result ).set( secret.path, decrypted_secret.decrypted );
							}
						}
						break;
				}
			} );
			
			return result;
		}
		else if ( options.key !== null ) {
			const key = options.key;
			const container_traverser = traverse( env_container );
			const decrypted = container_traverser.map( function ( value ) {
				if ( !this.isLeaf ) {
					return;
				}

				const encrypted_secret = module.exports.from_string( value );

				try {
					const decrypted_secret = module.exports.open( deepmerge( {
						key
					}, encrypted_secret ) );

					this.update( decrypted_secret.decrypted );
				}
				catch( ex ) {
					this.remove();
				}
			} );

			return decrypted;
		}
		else {
			throw new Error( 'must specify secrets and/or a key' );
		}
	},

	get_secrets: async function( secrets, _options = {} ) {
		return this.get( deepmerge( {
			secrets
		}, _options ) );
	}
};
