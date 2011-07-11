module.exports = {
	timeout: function( test ) {
		test.expect( 2 );
		var timer = Deferred.Timeout( 10, "hello", "world" );
		timer.done(function( hello, world ) {
			test.strictEqual( hello, "hello", "ok (1/2)" );
			test.strictEqual( world, "world", "ok (2/2)" );
			test.done();
		});
	},
	timeoutClear: function( test ) {
		test.expect( 0 );
		var timer = Deferred.Timeout( 10, "hello", "world" );
		timer.clear();
		timer.done(function() {
			test.ok( false, "timer called" );
		});
		setTimeout(function() {
			test.done();
		}, 20 );
	},
	interval: function( test ) {
		test.expect( 6 );
		var count = 3,
			timer = Deferred.Interval( 10, "hello", "world" );
		timer.ping(function( hello, world ) {
			test.strictEqual( hello, "hello", "iteration #" + count + "ok (1/2)" );
			test.strictEqual( world, "world", "iteration #" + count + "ok (2/2)" );
			if ( !(( --count )) ) {
				timer.clear();
				setTimeout(function() {
					test.done();
				}, 20 );
			}
		});
	}
};
