'use strict';

const test = require( 'tape' );

const enveloper = require( '../index.js' );

test( 'get_secrets (no environment)', async t => {
    const result = await enveloper.get_secrets( [ {
        name: 'test',
        key: 'vVs0hBd1eXF860XYNg3LV4TOzML7WqTiaGViCoPX31acN2860dHY0VNyPopYKq340NzlFSjbMrK8jBbxpnR28g=='
    } ], {
        directory: __dirname
    } );

    t.ok( result, 'got result' );
    t.ok( result && result.test, 'got test secret' );
    t.equal( result && result.test, 'this is an envelope secret', 'test secret is correct' );

    t.end();
} );

test( 'get_secrets (NODE_ENV = dev)', async t => {
    process.env.NODE_ENV = 'dev';

    const result = await enveloper.get_secrets( [ {
        name: 'test',
        key: 'DdgNyV6JvvwHgIBbaUAfXcCLjsJqG0arKQEaxPOnvPAf9iqluMdBOfURX8r5c1Zz+PN/svAcQl7nUHxG/xMCXA=='
    } ], {
        directory: __dirname
    } );

    t.ok( result, 'got result' );
    t.ok( result && result.test, 'got test secret' );
    t.equal( result && result.test, 'this is an envelope secret in dev', 'test secret is correct' );

    t.end();
} );

test( 'get_secrets (dot separated path)', async t => {
    process.env.NODE_ENV = 'dev';

    const result = await enveloper.get_secrets( [ {
        path: 'foo.bar',
        key: 'DdgNyV6JvvwHgIBbaUAfXcCLjsJqG0arKQEaxPOnvPAf9iqluMdBOfURX8r5c1Zz+PN/svAcQl7nUHxG/xMCXA=='
    } ], {
        directory: __dirname
    } );

    t.ok( result, 'got result' );
    t.ok( result && result.foo && result.foo.bar, 'got nested secret' );
    t.equal( result && result.foo && result.foo.bar, 'this is an envelope secret in dev', 'test secret is correct' );

    t.end();
} );

test( 'get_secrets (array path)', async t => {
    process.env.NODE_ENV = 'dev';

    const result = await enveloper.get_secrets( [ {
        path: [ 'foo', 'bar' ],
        key: 'DdgNyV6JvvwHgIBbaUAfXcCLjsJqG0arKQEaxPOnvPAf9iqluMdBOfURX8r5c1Zz+PN/svAcQl7nUHxG/xMCXA=='
    } ], {
        directory: __dirname
    } );

    t.ok( result, 'got result' );
    t.ok( result && result.foo && result.foo.bar, 'got nested secret' );
    t.equal( result && result.foo && result.foo.bar, 'this is an envelope secret in dev', 'test secret is correct' );

    t.end();
} );