'use strict';

module.exports = () => {
    let buf = '';
    return new Promise( resolve => {
        process.stdin.on( 'readable', () => {
            let chunk;
            while( chunk = process.stdin.read() ) {
                buf += chunk;
            }
        } );
        process.stdin.on( 'end', () => resolve( buf ) );
    } );
};
