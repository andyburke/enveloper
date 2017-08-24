#!/usr/bin/node

'use strict';

const enveloper = require( '../index.js' );
const program = require( 'commander' );
const pkg = require( '../package.json' );

program
    .version( pkg.version )
    .option( '--key <key>', 'specify the key to use' )
    .option( '--json', 'output the result as json' )
    .arguments( '<secret>')
    .action( ( secret ) => {
        if ( typeof program.key === 'undefined' ) {
            throw new Error( 'You must specify the decryption key with the --key argument!' );
        }

        const options = enveloper.from_string( secret );
        options.key = program.key;

        const result = enveloper.open( options );

        if ( program.json ) {
            console.log( JSON.stringify( result, null, 4 ) );
        }
        else {
            console.log( result.decrypted );
        }
    } )
    .parse( process.argv );
