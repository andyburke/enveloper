'use strict';

const crypto = require( 'crypto' );

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
    seal: function( secret, _options ) {
        const options = Object.assign( {
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
        return Object.assign( {
            encrypted: encrypted,
            tag: tag
        }, options );
    },

    open: function( _options ) {
        const options = Object.assign( {
            algorithm: DEFAULTS.ALGORITHM,
            key_hash_algorithm: DEFAULTS.KEY_HASH_ALGORITHM,
            input_encoding: DEFAULTS.INPUT_ENCODING,
            output_encoding: DEFAULTS.OUTPUT_ENCODING
        }, _options );

        const hashed_key = options.key_hash_algorithm ? crypto.createHash( options.key_hash_algorithm ).update( options.key ).digest() : options.key;
        const decipher = crypto.createDecipheriv( options.algorithm, hashed_key, options.iv )
        decipher.setAuthTag( Buffer.from( options.tag, 'base64' ) );

        const decrypted = decipher.update( options.encrypted, options.output_encoding, options.input_encoding ) + decipher.final( options.input_encoding );
        return Object.assign( {
            decrypted: decrypted
        }, options );
    },

    to_string: function( _options ) {
        const options = Object.assign( {
            separator: DEFAULTS.SEPARATOR,
            encoding_fields: DEFAULTS.STRING_ENCODING_FIELDS
        }, _options );

        const supported_output = options.output_encoding === 'hex' || options.output_encoding === 'base64';
        if ( !supported_output ) {
            throw new Error( `Unsupported output encoding: ${ options.output_encoding }` );
        }

        const result = options.encoding_fields.map( field => {
            return options[ field ];
        } ).join( options.separator );

        return result;
    },

    from_string: function( input, _options ) {
        const options = Object.assign( {
            separator: DEFAULTS.SEPARATOR,
            encoding_fields: DEFAULTS.STRING_ENCODING_FIELDS
        }, _options );

        const values = input.split( options.separator );

        if ( values.length !== options.encoding_fields.length ) {
            throw new Error( `Could not parse input string.` );
        }

        const encrypted_info = Object.assign( {}, options );

        options.encoding_fields.forEach( ( field, index ) => {
            encrypted_info[ field ] = values[ index ];
        } );

        delete encrypted_info.separator;
        delete encrypted_info.encoding_fields;

        return encrypted_info;
    }
};
