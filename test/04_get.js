'use strict';

const test = require( 'tape' );

const enveloper = require( '../index.js' );

test( 'get (no environment)', async t => {
    process.env.NODE_ENV = undefined;

    const result = await enveloper.get( {
        secrets: [ {
            name: 'test',
            key: 'vVs0hBd1eXF860XYNg3LV4TOzML7WqTiaGViCoPX31acN2860dHY0VNyPopYKq340NzlFSjbMrK8jBbxpnR28g=='
        }, {
            name: 'no_environment',
            key: 'vVs0hBd1eXF860XYNg3LV4TOzML7WqTiaGViCoPX31acN2860dHY0VNyPopYKq340NzlFSjbMrK8jBbxpnR28g=='
        } ],
        directory: __dirname
    } );

    t.ok( result, 'got result' );
    t.ok( result && result.test, 'got test secret' );
    t.equal( result && result.test, 'this is an envelope secret', 'test secret is correct' );
    t.ok( result && result.no_environment, 'got no_environment secret' );
    t.equal( result && result.no_environment, 'this is an envelope secret', 'no_environment secret is correct' );

    t.end();
} );

test( 'get (NODE_ENV = dev)', async t => {
    process.env.NODE_ENV = 'dev';

    const result = await enveloper.get( { 
        secrets: [ {
            name: 'test',
            key: 'DdgNyV6JvvwHgIBbaUAfXcCLjsJqG0arKQEaxPOnvPAf9iqluMdBOfURX8r5c1Zz+PN/svAcQl7nUHxG/xMCXA=='
        }, {
            name: 'no_environment',
            key: 'vVs0hBd1eXF860XYNg3LV4TOzML7WqTiaGViCoPX31acN2860dHY0VNyPopYKq340NzlFSjbMrK8jBbxpnR28g=='
        } ],
        directory: __dirname
    } );

    t.ok( result, 'got result' );
    t.ok( result && result.test, 'got test secret' );
    t.equal( result && result.test, 'this is an envelope secret in dev', 'test secret is correct' );
    t.ok( result && result.no_environment, 'got no_environment secret' );
    t.equal( result && result.no_environment, 'this is an envelope secret', 'no_environment secret is correct' );

    t.end();
} );

test( 'get (dot separated path)', async t => {
    process.env.NODE_ENV = 'dev';

    const result = await enveloper.get( {
        secrets: [ {
            path: 'foo.bar',
            key: 'DdgNyV6JvvwHgIBbaUAfXcCLjsJqG0arKQEaxPOnvPAf9iqluMdBOfURX8r5c1Zz+PN/svAcQl7nUHxG/xMCXA=='
        } ],
        directory: __dirname
    } );

    t.ok( result, 'got result' );
    t.ok( result && result.foo && result.foo.bar, 'got nested secret' );
    t.equal( result && result.foo && result.foo.bar, 'this is an envelope secret in dev', 'test secret is correct' );

    t.end();
} );

test( 'get (array path)', async t => {
    process.env.NODE_ENV = 'dev';

    const result = await enveloper.get( {
        secrets: [ {
            path: [ 'foo', 'bar' ],
            key: 'DdgNyV6JvvwHgIBbaUAfXcCLjsJqG0arKQEaxPOnvPAf9iqluMdBOfURX8r5c1Zz+PN/svAcQl7nUHxG/xMCXA=='
        } ],
        directory: __dirname
    } );

    t.ok( result, 'got result' );
    t.ok( result && result.foo && result.foo.bar, 'got nested secret' );
    t.equal( result && result.foo && result.foo.bar, 'this is an envelope secret in dev', 'test secret is correct' );

    t.end();
} );

test( 'get with single key', async t => {
    process.env.NODE_ENV = 'dev';

    const result = await enveloper.get( {
        secrets: [
            'foo.bar',
            'foo.baz'
        ],
        key: 'DdgNyV6JvvwHgIBbaUAfXcCLjsJqG0arKQEaxPOnvPAf9iqluMdBOfURX8r5c1Zz+PN/svAcQl7nUHxG/xMCXA==',
        directory: __dirname
    } );

    t.ok( result, 'got result' );
    t.ok( result && result.foo && result.foo.bar, 'got nested secret: bar' );
    t.ok( result && result.foo && result.foo.baz, 'got nested secret: baz' );
    t.equal( result && result.foo && result.foo.bar, 'this is an envelope secret in dev', 'test secret "bar" is correct' );
    t.equal( result && result.foo && result.foo.baz, 'boop', 'test secret "baz" is correct' );

    t.end();
} );

test( 'get with single key (array paths)', async t => {
    process.env.NODE_ENV = 'dev';

    const result = await enveloper.get( {
        secrets: [
            [ 'foo', 'bar' ],
            [ 'foo', 'baz' ]
        ],
        key: 'DdgNyV6JvvwHgIBbaUAfXcCLjsJqG0arKQEaxPOnvPAf9iqluMdBOfURX8r5c1Zz+PN/svAcQl7nUHxG/xMCXA==',
        directory: __dirname
    } );

    t.ok( result, 'got result' );
    t.ok( result && result.foo && result.foo.bar, 'got nested secret: bar' );
    t.ok( result && result.foo && result.foo.baz, 'got nested secret: baz' );
    t.equal( result && result.foo && result.foo.bar, 'this is an envelope secret in dev', 'test secret "bar" is correct' );
    t.equal( result && result.foo && result.foo.baz, 'boop', 'test secret "baz" is correct' );

    t.end();
} );

test( 'get with single key (mixed paths)', async t => {
    process.env.NODE_ENV = 'dev';

    const result = await enveloper.get( {
        secrets: [
            'foo.bar',
            [ 'foo', 'baz' ]
        ],
        key: 'DdgNyV6JvvwHgIBbaUAfXcCLjsJqG0arKQEaxPOnvPAf9iqluMdBOfURX8r5c1Zz+PN/svAcQl7nUHxG/xMCXA==',
        directory: __dirname
    } );

    t.ok( result, 'got result' );
    t.ok( result && result.foo && result.foo.bar, 'got nested secret: bar' );
    t.ok( result && result.foo && result.foo.baz, 'got nested secret: baz' );
    t.equal( result && result.foo && result.foo.bar, 'this is an envelope secret in dev', 'test secret "bar" is correct' );
    t.equal( result && result.foo && result.foo.baz, 'boop', 'test secret "baz" is correct' );

    t.end();
} );