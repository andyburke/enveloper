'use strict';

const test = require( 'tape' );

const enveloper = require( '../index.js' );

const SECRET = 'this is a test';

test( 'encrypt/decrypt with auto-generated key', t => {
    const encryption_result = enveloper.seal( SECRET );

    t.ok( encryption_result, 'got encryption result' );
    t.ok( encryption_result && encryption_result.encrypted, 'has encrypted value' );
    t.ok( encryption_result && encryption_result.key, 'generated a key' );

    const decryption_result = enveloper.open( encryption_result );

    t.ok( decryption_result, 'got decryption result' );
    t.ok( decryption_result && decryption_result.decrypted, 'has decrypted value' );
    t.equal( decryption_result && decryption_result.decrypted, SECRET, 'decrypted value is correct' );

    t.end();
} );

test( 'encrypt/decrypt with user-specified key', t => {
    const TEST_KEY = 'this is the test key';

    const encryption_result = enveloper.seal( SECRET, {
        key: TEST_KEY
    } );

    t.ok( encryption_result, 'got encryption result' );
    t.ok( encryption_result && encryption_result.encrypted, 'has encrypted value' );
    t.equal( encryption_result && encryption_result.key, TEST_KEY, 'used specified key' );

    const decryption_result = enveloper.open( encryption_result );

    t.ok( decryption_result, 'got decryption result' );
    t.ok( decryption_result && decryption_result.decrypted, 'has decrypted value' );
    t.equal( decryption_result && decryption_result.decrypted, SECRET, 'decrypted value is correct' );

    t.end();
} );
