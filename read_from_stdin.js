'use strict';

module.exports = () => {
    let buf = '';
    return new Promise( resolve => {
        process.stdin.on( 'readable', () => {
            const chunk = process.stdin.read();
            if ( chunk !== null ) {
                buf += chunk;
            }
        } );
        process.stdin.on( 'end', () => resolve( buf ) );
    } );
};