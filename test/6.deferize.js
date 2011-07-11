require( "./../lib/plus" );

var functions = {
		simple: {
			first: function( callback ) {
				var args = arguments,
					cumul = "";
				setTimeout(function() {
					args.forEach(function( value, index ) {
						if ( index ) {
							cumul += value;
						}
					});
					callback( cumul );
				}, 10 );
			},
			last: function() {
				var args = arguments,
					limit = args.length - 1,
					cumul = "";
				setTimeout(function() {
					args.forEach(function( value, index ) {
						if ( index === limit ) {
							value( cumul );
						} else {
							cumul += value;
						}
					});
				}, 10 );
			},
			sync: function() {
				var cumul = "";
				arguments.forEach(function( value, index ) {
					cumul += value;
				});
				return cumul;
			}
		},
		errorAnswer: {
			first: function( callback, error, answer ) {
				setTimeout(function() {
					callback( error, answer );
				}, 10 );
			},
			middle: function( error, callback, answer ) {
				setTimeout(function() {
					callback( error, answer );
				}, 10 );
			},
			last: function( error, answer, callback ) {
				setTimeout(function() {
					callback( error, answer );
				}, 10 );
			}
		}
	};

function rejectToResolve( value ) {
	return Deferred().resolve( value );
}

function callWithParam( params, callback ) {
	setTimeout(function() {
		callback.apply( undefined, params );
	}, 10 );
}

module.exports = {

	boolean: function( test ) {
		test.expect( 2 );
		var fn = callWithParam.deferize( "boolean" );
		fn( [ true ] ).done(function( value ) {
			test.strictEqual( value, undefined, "true ok" );
			fn( [ false ] ).fail(function( value ) {
				test.strictEqual( value, undefined, "false ok" );
				test.done();
			});
		});
	},

	errorAnswer: function( test ) {
		test.expect( 2 );
		var fn = callWithParam.deferize( "errorAnswer" );
		fn( [ null, "hello" ] ).done(function( value ) {
			test.strictEqual( value, "hello", "answer ok" );
			fn( [ "error" ] ).fail(function( value ) {
				test.strictEqual( value, "error", "error ok" );
				test.done();
			});
		});
	},

	errorOnly: function( test ) {
		test.expect( 2 );
		var fn = callWithParam.deferize( "errorOnly" );
		fn( [] ).done(function( value ) {
			test.strictEqual( value, undefined, "no error ok" );
			fn( [ "error" ] ).fail(function( value ) {
				test.strictEqual( value, "error", "error ok" );
				test.done();
			});
		});
	},

	progress: function( test ) {
		test.expect( 1 );
		callWithParam.deferize( "progress" )( [ "hello" ] ).ping(function( value ) {
			test.strictEqual( value, "hello", "ok" );
			test.done();
		});
	},

	reject: function( test ) {
		test.expect( 1 );
		callWithParam.deferize( "reject" )( [ "hello" ] ).fail(function( value ) {
			test.strictEqual( value, "hello", "ok" );
			test.done();
		});
	},

	resolve: function( test ) {
		test.expect( 1 );
		callWithParam.deferize( "resolve" )( [ "hello" ] ).done(function( value ) {
			test.strictEqual( value, "hello", "ok" );
			test.done();
		});
	},

	simpleMultiple: function( test ) {
		test.expect( 4 );
		var firstDefer = functions.simple.first.deferize( "[0]" )( "a", "b", "c" ),
			lastDefer = functions.simple.last.deferize( "resolve" )( "a", "b", "c" ),
			syncDefer = functions.simple.sync.deferize()( "a", "b", "c" ).done(function( value ) {
				test.strictEqual( value, "abc", "sync deferized" );
			});
		when( firstDefer, lastDefer, syncDefer ).done(function( firstValue, lastValue, syncValue ) {
			test.strictEqual( firstValue, "abc", "first ok" );
			test.strictEqual( lastValue, "abc", "last ok" );
			test.strictEqual( syncValue, "abc", "sync ok" );
			test.done();
		});
	},

	errorAnswerMultiple: function( test ) {
		test.expect( 1 );
		var firstFN = functions.errorAnswer.first.deferize( "errorAnswer[0]" ),
			middleFN = functions.errorAnswer.middle.deferize( "errorAnswer[1]" ),
			lastFN = functions.errorAnswer.last.deferize( "errorAnswer[2]" );
		when(
			firstFN( null, "firstAnswer" ),
			middleFN( null, "middleAnswer" ),
			lastFN( null, "lastAnswer" ),
			firstFN( "firstError" ).then( null, rejectToResolve ),
			middleFN( "middleError" ).then( null, rejectToResolve ),
			lastFN( "lastError" ).then( null, rejectToResolve )
		).done(function() {
			test.same( arguments.slice( 0 ),
				[ "firstAnswer", "middleAnswer", "lastAnswer", "firstError", "middleError", "lastError" ],
				"ok" );
			test.done();
		});
	},

	object: function( test ) {
		test.expect( 2 );
		var src = {
				first: functions.simple.first,
				middle: functions.errorAnswer.middle,
				last: functions.simple.last,
				notAFunction: "hello world"
			},
			dest = src.deferize({
				first: "[0]",
				middle: "errorAnswer[1]",
				last: "",
				notAFunction: "passThrough[4]"
			});
		test.strictEqual( dest.notAFunction, undefined, "no function ok" );
		when( dest.first( "fi", "rst" ), dest.middle( null, "middle"), dest.last( "la", "s", "t" ) ).done(function( first, middle, last ) {
			test.same( arguments.slice( 0 ), [ "first", "middle", "last" ], "ok" );
			test.done();
		});
	},

	objectSelf: function( test ) {
		test.expect( 2 );
		var src = {
				first: functions.simple.first,
				middle: functions.errorAnswer.middle,
				last: functions.simple.last,
				notAFunction: "hello world"
			};
		src.deferizeSelf({
			first: "[0]",
			middle: "errorAnswer[1]",
			last: "",
			notAFunction: "passThrough[4]"
		});
		test.strictEqual( src.notAFunctionDefer, undefined, "no function ok" );
		when( src.firstDefer( "fi", "rst" ), src.middleDefer( null, "middle"), src.lastDefer( "la", "s", "t" ) ).done(function( first, middle, last ) {
			test.same( arguments.slice( 0 ), [ "first", "middle", "last" ], "ok" );
			test.done();
		});
	},

	objectSelfHidden: function( test ) {
		test.expect( 3 );
		var src = {
				first: functions.simple.first,
				middle: functions.errorAnswer.middle,
				last: functions.simple.last,
				notAFunction: "hello world"
			};
		src.deferizeSelf( {
			first: "[0]",
			middle: "errorAnswer[1]",
			last: "",
			notAFunction: "resolve[4]"
		}, true );
		test.same( src, {
			first: functions.simple.first,
			middle: functions.errorAnswer.middle,
			last: functions.simple.last,
			notAFunction: "hello world"
		}, "hidden ok" );
		test.strictEqual( src.notAFunctionDefer, undefined, "no function ok" );
		when( src.firstDefer( "fi", "rst" ), src.middleDefer( null, "middle"), src.lastDefer( "la", "s", "t" ) ).done(function( first, middle, last ) {
			test.same( arguments.slice( 0 ), [ "first", "middle", "last" ], "ok" );
			test.done();
		});
	},

	customAdapter: function( test ) {
		test.expect( 1 );
		function func( resolve, error, answer, reject ) {
			if ( error ) {
				reject( error );
			} else {
				resolve( answer );
			}
		}
		var funcDefer = func.deferize(function( defer, args ) {
			return [ defer.resolve, args[ 0 ], args[ 1 ], defer.reject ];
		});
		when( funcDefer( "error" ).then( null, rejectToResolve ), funcDefer( null, "answer" ) ).done(function() {
			test.same( arguments.slice( 0 ), [ "error", "answer" ], "ok" );
			test.done();
		});
	}
};