'use strict';

const test = require( 'tape' );

const enveloper = require( '../index.js' );

test( 'get all secrets that use the same key', async ( t ) => {
	process.env.NODE_ENV = undefined;

	const result = await enveloper.get( {
		key: 'vVs0hBd1eXF860XYNg3LV4TOzML7WqTiaGViCoPX31acN2860dHY0VNyPopYKq340NzlFSjbMrK8jBbxpnR28g==',
		directory: __dirname
	} );

	t.ok( result, 'got result' );
	t.ok( result && result.test, 'got test secret' );
	t.equal( result && result.test, 'this is an envelope secret', 'test secret is correct' );
	t.ok( result && result.no_environment, 'got no_environment secret' );
	t.equal( result && result.no_environment, 'this is an envelope secret', 'no_environment secret is correct' );

	t.end();
} );

test( 'get all secrets that use the same key (NODE_ENV = dev)', async ( t ) => {
	process.env.NODE_ENV = 'dev';

	const result = await enveloper.get( {
		key: 'DdgNyV6JvvwHgIBbaUAfXcCLjsJqG0arKQEaxPOnvPAf9iqluMdBOfURX8r5c1Zz+PN/svAcQl7nUHxG/xMCXA==',
		directory: __dirname
	} );

	t.ok( result, 'got result' );
	t.ok( result && result.test, 'got test secret' );
	t.equal( result && result.test, 'this is an envelope secret in dev', 'test secret is correct' );
	t.notOk( result && result.no_environment, 'did not get no_environment secret' );
	t.ok( result && result.foo && result.foo.bar, 'got foo.bar secret' );
	t.equal( result && result.foo && result.foo.bar, 'this is an envelope secret in dev' );
	t.ok( result && result.foo && result.foo.baz, 'got foo.baz secret' );
	t.equal( result && result.foo && result.foo.baz, 'boop' );

	t.end();
} );
