'use strict';

const test = require( 'tape' );

const enveloper = require( '../index.js' );

test( 'enveloper is defined', ( t ) => {
	t.ok( enveloper, 'object exists' );
	t.end();
} );

test( 'enveloper API is as expected', ( t ) => {
	if ( !enveloper ) {
		t.fail( 'enveloper is not defined' );
		return;
	}

	t.equal( typeof enveloper.seal, 'function', '.seal' );
	t.equal( typeof enveloper.open, 'function', '.open' );
	t.equal( typeof enveloper.to_string, 'function', '.to_string' );
	t.equal( typeof enveloper.from_string, 'function', '.from_string' );
	t.end();
} );
