'use strict';

const program = require( 'commander' );
const pkg = require( '../package.json' );

program
    .version( pkg.version )
    .command( 'encrypt <secret> [--key <key>] [--json]', 'Encrypt a secret with the given key (or generate a new key if none specified)' )
    .command( 'decrypt <secret> --key <key> [--json]', 'Decrypt a secret with the given key' )
    .parse( process.argv );
