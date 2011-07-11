require( "./../lib/plus" );

module.exports = {
	bases: function( test ) {
		test.expect( 16 );
		var count = 2;
		function decount() {
			if ( !(( --count )) ) {
				test.done();
			}
		}
		Deferred(function ( defer ) {
			var progressCount = 0,
				promise = defer.promise();
			promise.ping(function( value ) {
				if ( progressCount < 3 ) {
					test.strictEqual( value, progressCount++, "ping ok" );
				}
			});
			promise.done(function( value ) {
				test.strictEqual( this, promise, "context ok" );
				test.strictEqual( value, "ok", "done ok" );
			}).fail(function() {
				test.ok( false, "fail" );
			});
			for( var i = 0; i <= 3; i++ ) {
				defer.progress( i );
			}
			defer.resolve( "ok" );
			defer.progress( "woops" );
			promise.done(function() {
				promise.ping(function( value ) {
					test.strictEqual( value, progressCount, "ping later ok" );
				});
				promise.attach( function( value ) {
					test.strictEqual( value, "ok", "attach ok" );
				}, function() {
					test.ok( false, "fail in attach" );
				}, function( value ) {
					test.strictEqual( value, progressCount, "ping attach ok" );
				});
				promise.done( decount );
			});
		});
		Deferred(function ( defer ) {
			var progressCount = 0,
				promise = defer.promise();
			promise.ping(function( value ) {
				if ( progressCount < 3 ) {
					test.strictEqual( value, progressCount++, "ping ok" );
				}
			});
			promise.fail(function( value ) {
				test.strictEqual( this, promise, "context ok" );
				test.strictEqual( value, "ok", "fail ok" );
			}).done(function() {
				test.ok( false, "done" );
			});
			for( var i = 0; i <= 3; i++ ) {
				defer.progress( i );
			}
			defer.reject( "ok" );
			defer.progress( "woops" );
			promise.ping(function( value ) {
				test.strictEqual( value, progressCount, "ping later ok" );
			});
			promise.fail(function() {
				promise.attach(function() {
					test.ok( false, "done in attach" );
				}, function( value ) {
					test.strictEqual( value, "ok", "fail attach ok" );
				}, function( value ) {
					test.strictEqual( value, progressCount, "ping attach ok" );
				});
				promise.fail( decount );
			});
		});
	},

	multipleCallbacks: function( test ) {
		test.expect( 1 );
		var cumul = "";
		Deferred(function( defer ) {
			defer.done(function() {
				cumul += "a";
			}, function() {
				cumul += "b";
			}).resolve().done(function() {
				cumul += "c";
			}, function() {
				cumul += "d";
			}, function() {
				test.strictEqual( cumul, "abcd", "proper order" );
				test.done();
			});
		});
	},

	then: function( test ) {
		test.expect( 17 );
		var done = function( value ) {
				return value + "Z";
			},
			fail = function() {
				return Deferred(function( defer ) {
					setTimeout( function() {
						defer.resolve( "fail" );
					}, 20 );
				});
			},
			ping = function( value ) {
				return "X" + value;
			},
			count = 2;
		function decount() {
			if ( !(( --count )) ) {
				test.done();
			}
		}
		Deferred(function ( defer ) {
			var progressCount = 0,
				promise = defer.then( done, fail, ping );
			promise.ping(function( value ) {
				if ( progressCount < 3 ) {
					test.strictEqual( value, "X" + (( progressCount++)), "ping ok" );
				}
			});
			promise.done(function( value ) {
				test.strictEqual( this, promise, "context ok" );
				test.strictEqual( value, "okZ", "done ok" );
			}).fail(function() {
				test.ok( false, "fail" );
			});
			for( var i = 0; i <= 3; i++ ) {
				defer.progress( i );
			}
			defer.resolve( "ok" );
			defer.progress( "woops" );
			promise.done(function() {
				promise.ping(function( value ) {
					test.strictEqual( value, "X" + progressCount, "ping later ok" );
				});
				promise.attach(function( value ) {
					test.strictEqual( value, "okZ", "attach ok" );
				}, function() {
					test.ok( false, "fail in attach" );
				}, function( value ) {
					test.strictEqual( value, "X" + progressCount, "ping attach ok" );
				});
				promise.done( decount );
			});
		});
		Deferred(function ( defer ) {
			var progressCount = 0,
				promise = defer.then( done, fail, ping );
			promise.ping(function( value ) {
				if ( progressCount < 3 ) {
					test.strictEqual( value, "X" + (( progressCount++ )), "ping ok" );
				}
			});
			promise.done(function( value ) {
				test.notStrictEqual( this, promise, "context ok (1/2)" );
				test.notStrictEqual( this, defer.promise(), "context ok (2/2)" );
				test.strictEqual( value, "fail", "done ok" );
			}).fail(function() {
				test.ok( false, "fail" );
			});
			for( var i = 0; i <= 3; i++ ) {
				defer.progress( i );
			}
			defer.reject( "ok" );
			defer.progress( "woops" );
			promise.done(function() {
				promise.ping(function( value ) {
					test.strictEqual( value, "X" + progressCount, "ping later ok" );
				});
				promise.attach(function( value ) {
					test.strictEqual( value, "fail", "done attach ok" );
				}, function() {
					test.ok( false, "fail in attach" );
				}, function( value ) {
					test.strictEqual( value, "X" + progressCount, "ping attach ok" );
				});
				promise.done( decount );
			});
		});
	},

	removeDone: function( test ) {
		test.expect( 1 );
		function f1() {
			test.ok( false, "f1" );
		}
		function f2( value ) {
			test.strictEqual( value, "hello", "f2 called" );
			test.done();
		}
		function f3() {
			test.ok( false, "f3" );
		}
		Deferred(function( defer ) {
			defer.done( f1, f2, f3 );
			defer.removeDone( f1, f3 );
			defer.resolve( "hello" );
		});
	},

	removeFail: function( test ) {
		test.expect( 1 );
		function f1() {
			test.ok( false, "f1" );
		}
		function f2( value ) {
			test.strictEqual( value, "hello", "f2 called" );
			test.done();
		}
		function f3() {
			test.ok( false, "f3" );
		}
		Deferred(function( defer ) {
			defer.fail( f1, f2, f3 );
			defer.removeFail( f1, f3 );
			defer.reject( "hello" );
		});
	},

	removePing: function( test ) {
		test.expect( 1 );
		function f1() {
			test.ok( false, "f1" );
		}
		function f2( value ) {
			test.strictEqual( value, "hello", "f2 called" );
			test.done();
		}
		function f3() {
			test.ok( false, "f3" );
		}
		Deferred(function( defer ) {
			defer.ping( f1, f2, f3 );
			defer.removePing( f1, f3 );
			defer.progress( "hello" );
		});
	}
};
