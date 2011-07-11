require( "./../lib/plus" );

module.exports = {

	noValue: function( test ) {
		test.expect( 1 );
		when().done(function() {
			test.strictEqual( arguments.length, 0, "resolved with nothing" );
			test.done();
		});
	},

	singleValue: function( test ) {
		test.expect( 2 );
		var context = {};
		when( Deferred(function( defer ) {
			defer.resolveWith( context, [ "hello" ] );
		}) ).done(function( value ) {
			test.strictEqual( this, context, "context ok" );
			test.strictEqual( value, "hello", "value ok" );
			test.done();
		});
	},

	multiple: function( test ) {
		test.expect( 3 );
		when( Deferred(function( defer ) {
			defer.resolve( "first" );
		}), Deferred(function( defer ) {
			defer.resolve( "second", "third" );
		}), "third" ).done(function( first, second, third ) {
			test.strictEqual( first, "first", "first resolve value ok" );
			test.same( second, [ "second", "third" ], "second resolve value ok" );
			test.strictEqual( third, "third", "third resolve value ok" );
			test.done();
		});
	},

	fail: function( test ) {
		test.expect( 2 );
		var context = {};
		when( Deferred(function( defer ) {
			defer.rejectWith( context, [ "hello" ] );
		}) ).fail(function( value ) {
			test.strictEqual( this, context, "context ok" );
			test.strictEqual( value, "hello", "value ok" );
			test.done();
		});
	},

	progress: function( test ) {
		test.expect( 8 );
		var defer1 = Deferred().progress( "start" ),
			defer2 = Deferred(),
			count = 0,
			values = [ "a", "b", "c", "d" ];
		when( defer1, defer2 ).ping(function( value1, value2 ) {
			if ( value1 === "start" ) {
				defer1.progress( values[ 0 ] );
			} else {
				test.strictEqual( value1, values[ count ], "first value ok" );
				test.strictEqual( value2, count > 0 ? values[ count - 1 ] : undefined );
				if ( count < values.length - 1 ) {
					count++;
					defer2.progress( value1 );
					defer1.progress( values[ count ] );
				} else {
					test.done();
				}
			}
		});
	}

};
