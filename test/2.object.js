require( "./../lib/plus" );

module.exports = {

	extend: function( test ) {
		test.expect( 3 );
		var dest = {
				a: "dest",
				b: "dest",
				c: "dest"
			},
			srcSave,
			src = srcSave = {
				b: "src",
				d: "src"
			},
			expected = {
				a: "dest",
				b: "src",
				c: "dest",
				d: "src"
			},
			extend = dest.extend( src );
		test.same( extend, expected, "extend is as expected" );
		test.strictEqual( dest, extend, "destination was extended" );
		test.same( src, srcSave, "source is not modified" );
		test.done();
	},

	deepExtend: function( test ) {
		test.expect( 3 );
		var dest = {
				a: "dest",
				b: "dest",
				c: "dest",
				down: {
					a: "dest",
					b: "dest",
					c: "dest",
					down: {
						a: "dest",
						b: "dest",
						c: "dest"
					}
				}
			},
			srcSave,
			src = srcSave = {
				b: "src",
				d: "src",
				down: {
					b: "src",
					d: "src",
					down: {
						b: "src",
						d: "src"
					}
				}
			},
			expected = {
				a: "dest",
				b: "src",
				c: "dest",
				d: "src",
				down: {
					a: "dest",
					b: "src",
					c: "dest",
					d: "src",
					down: {
						a: "dest",
						b: "src",
						c: "dest",
						d: "src"
					}
				}
			},
			extend = dest.deepExtend( src );
		test.same( extend, expected, "extend is as expected" );
		test.strictEqual( dest, extend, "destination was extended" );
		test.same( src, srcSave, "source is not modified" );
		test.done();
	},

	hiddenExtend: function( test ) {
		test.expect( 3 );
		var dest = {
				a: "dest",
				b: "dest",
				c: "dest"
			},
			srcSave,
			src = srcSave = {
				b: "src",
				d: "src"
			},
			expected = {
				a: "dest",
				c: "dest"
			},
			extend = dest.hiddenExtend( src );
		test.same( extend, expected, "extend is as expected" );
		test.strictEqual( dest, extend, "destination was extended" );
		test.same( src, srcSave, "source is not modified" );
		test.done();
	},

	isArrayLike: function( test ) {
		test.expect( 4 );
		test.ok( [].isArrayLike(), "array" );
		test.ok( !( {}.isArrayLike() ), "object" );
		test.ok( { __array_like__: true }.isArrayLike(), "object with __array_like__ property" );
		test.ok( arguments.isArrayLike(), "arguments" );
		test.done();
	},

	concat: function( test ) {
		test.expect( 3 );
		try {
			({}).concat();
		} catch( e ) {
			test.strictEqual( "" + e, "TypeError: Object is not an array or an array-like object", "cannot be called on objects" );
		}
		test.same( [ 0, 1, 2 ].concat( [ 3, 4, 5 ] ), [ 0, 1, 2, 3, 4, 5 ], "can be called on array" );
		(function() {
			test.same( arguments.concat( [ 3, 4, 5 ] ), [ 0, 1, 2, 3, 4, 5 ], "can be called on array-like" );
		})( 0, 1, 2 );
		test.done();
	},

	every: function( test ) {
		test.expect( 7 );
		var object = { first: 3, second: 6 };
		object.every(function( value, key, self ) {
			test.strictEqual( value, 3, "value correct in callback" );
			test.strictEqual( key, "first", "key correct in callback" );
			test.strictEqual( self, object, "object correct in callback" );
			return false;
		});
		test.ok( !object.every(function( value ) {
			return !!( value % 2 );
		}), "every returning false" );
		test.ok( object.every(function( value ) {
			return !( value % 3 );
		}), "every returning true" );
		test.ok( [ "a", "b" ].every(function( value ) {
			return value === "a" || value === "b";
		}), "callable on array" );
		(function() {
			test.ok( arguments.every(function( value ) {
				return typeOf( value ) === "regexp";
			}), "callable on array-like");
		})( /r/, /t/ );
		test.done();
	},

	filter: function( test ) {
		test.expect( 6 );
		var object = { first: 3, second: 6 },
			first;
		object.filter(function( value, key, self ) {
			if( !first ) {
				first = true;
				test.strictEqual( value, 3, "value correct in callback" );
				test.strictEqual( key, "first", "key correct in callback" );
				test.strictEqual( self, object, "object correct in callback" );
			}
			return false;
		});
		test.same( object.filter(function( value ) {
			return !!( value % 2 );
		}), { first: 3 }, "filter works" );
		test.same( [ "a", "b" ].filter(function( value ) {
			return value === "a";
		}), [ "a" ], "callable on array" );
		(function() {
			test.same( arguments.filter(function( value ) {
				return value === "a";
			}), [ "a" ], "callable on array-like");
		})( "a", "b" );
		test.done();
	},

	flatten: function( test ) {
		test.expect( 7 );
		test.same( {}.flatten(), [{}], "flattening an object return an array with this object" );
		var array = [ 1, 2, [ 3, [ 4, 5 ], 6 ], [ 7 ], 8 ];
		test.same( array.flatten(), [ 1, 2, 3, 4, 5, 6, 7, 8 ], "callable on array" );
		(function() {
			test.same( arguments.flatten(), [ 1, 2, 3, 4, 5, 6, 7, 8 ], "callable on array-like" );
		}).apply( undefined, array );
		test.same( array.flatten(function( value ) {
			if ( value % 2 ) {
				throw "even";
			}
			return 2 * value;
		}), [ 4, 8, 12, 16 ], "filtering works" );
		var tmp = 0;
		test.strictEqual( array.flatten( false, function( value ) {
			tmp += value;
		}), undefined, "no array constructed if asked for" );
		test.strictEqual( tmp, 36, "callbacks were called" );
		test.strictEqual( array.flatten( false ), undefined, "(false) does nothing" );
		test.done();
	},

	forEach: function( test ) {
		test.expect( 6 );
		var object = { first: 3, second: 6 },
			cumul = "",
			first;
		object.forEach(function( value, key, self ) {
			if( !first ) {
				first = true;
				test.strictEqual( value, 3, "value correct in callback" );
				test.strictEqual( key, "first", "key correct in callback" );
				test.strictEqual( self, object, "object correct in callback" );
			} else {
				cumul += ",";
			}
			cumul += key + ":" + value;
		});
		test.strictEqual( cumul, "first:3,second:6", "callable on object" );
		cumul = "";
		[ "a", "b" ].forEach(function( value ) {
			cumul += value;
		});
		test.strictEqual( cumul, "ab", "callable on array" );
		(function() {
			cumul = "";
			arguments.forEach(function( value ) {
				cumul += value;
			});
			test.strictEqual( cumul, "ab", "callable on array" );
		})( "a", "b" );
		test.done();
	},

	indexOf: function( test ) {
		test.expect( 9 );
		var object = {
			first: 1,
			second: 1
		};
		test.strictEqual( object.indexOf( 1 ), "first", "callable on object (1/4)" );
		test.strictEqual( object.indexOf( 1, "second" ), "second", "callable on object (2/4)" );
		test.strictEqual( object.indexOf( 2 ), -1, "callable on object (3/4)" );
		test.strictEqual( object.indexOf( 1, "toto" ), -1, "callable on object (4/4)" );
		test.strictEqual( [ "hello" ].indexOf( "hello" ), 0, "callable on array" );
		(function() {
			test.strictEqual( arguments.indexOf( 1 ), 0, "callable on array-like (1/4)" );
			test.strictEqual( arguments.indexOf( 1, 1 ), 1, "callable on array-like (2/4)" );
			test.strictEqual( arguments.indexOf( 2 ), -1, "callable on array-like (3/4)" );
			test.strictEqual( arguments.indexOf( 1, 2 ), -1, "callable on array-like (4/4)" );
		})( 1, 1 );
		test.done();
	},

	join: function( test ) {
		test.expect( 6 );
		var object = { first: 3, second: 6 };
		test.strictEqual( object.join(), "3,6", "callable on object" );
		test.strictEqual( object.join( "-" ), "3-6", "callable on object (with string)" );
		test.strictEqual( [ "a", "b" ].join(), "a,b", "callable on array" );
		test.strictEqual( [ "a", "b" ].join( "-" ), "a-b", "callable on array (with string)" );
		(function() {
			test.strictEqual( arguments.join(), "a,b", "callable on array-like" );
			test.strictEqual( arguments.join( "-" ), "a-b", "callable on array-like (with string)" );
		})( "a", "b" );
		test.done();
	},

	lastIndexOf: function( test ) {
		test.expect( 9 );
		var object = {
			first: 1,
			second: 1
		};
		test.strictEqual( object.lastIndexOf( 1 ), "second", "callable on object (1/4)" );
		test.strictEqual( object.lastIndexOf( 1, "first" ), "first", "callable on object (2/4)" );
		test.strictEqual( object.lastIndexOf( 2 ), -1, "callable on object (3/4)" );
		test.strictEqual( object.lastIndexOf( 1, "toto" ), -1, "callable on object (4/4)" );
		test.strictEqual( [ "hello" ].lastIndexOf( "hello" ), 0, "callable on array" );
		(function() {
			test.strictEqual( arguments.lastIndexOf( 1 ), 1, "callable on array-like (1/4)" );
			test.strictEqual( arguments.lastIndexOf( 1, 0 ), 0, "callable on array-like (2/4)" );
			test.strictEqual( arguments.lastIndexOf( 2 ), -1, "callable on array-like (3/4)" );
			test.strictEqual( arguments.lastIndexOf( 1, 2 ), 1, "callable on array-like (4/4)" );
		})( 1, 1 );
		test.done();
	},

	map: function( test ) {
		test.expect( 6 );
		var object = { first: 3, second: 6 },
			first;
		test.same( object.map(function( value, key, self ) {
			if( !first ) {
				first = true;
				test.strictEqual( value, 3, "value correct in callback" );
				test.strictEqual( key, "first", "key correct in callback" );
				test.strictEqual( self, object, "object correct in callback" );
			}
			return value / 3;
		}), { first: 1, second: 2 }, "callable on object" );
		test.same( [ "a", "b" ].map(function( value ) {
			return "X" + value;
		}), [ "Xa", "Xb" ], "callable on array" );
		(function() {
			test.same( arguments.map(function( value ) {
				return "X" + value;
			}), [ "Xa", "Xb" ], "callable on array" );
		})( "a", "b" );
		test.done();
	},

	pop: function( test ) {
		test.expect( 5 );
		try {
			({}).pop();
		} catch( e ) {
			test.strictEqual( "" + e, "TypeError: Object is not an array or an array-like object", "cannot be called on objects" );
		}
		var array = [ 0, 1, 2 ];
		test.strictEqual( array.pop(), 2, "can be called on array (1/2)" );
		test.same( array, [ 0, 1 ], "can be called on array (2/2)" );
		(function() {
			test.strictEqual( arguments.pop(), 2, "can be called on array (1/2)" );
			test.deepEqual( arguments.slice( 0 ), [ 0, 1 ], "can be called on array (2/2)" );
		})( 0, 1, 2 );
		test.done();
	},

	push: function( test ) {
		test.expect( 3 );
		try {
			({}).push();
		} catch( e ) {
			test.strictEqual( "" + e, "TypeError: Object is not an array or an array-like object", "cannot be called on objects" );
		}
		var array = [ 0, 1, 2 ];
		array.push( 3, 4, 5 );
		test.same( array, [ 0, 1, 2, 3, 4, 5 ], "can be called on array" );
		(function() {
			arguments.push( 3, 4, 5 );
			test.same( arguments.slice( 0 ), [ 0, 1, 2, 3, 4, 5 ], "can be called on array-like" );
		})( 0, 1, 2 );
		test.done();
	},

	reduce: function( test ) {
		test.expect( 12 );
		var object = {
				first: "a",
				second: "b",
				third: "c"
			},
			first;
		test.strictEqual( object.reduce(function( cumul, value, key, self ) {
			if ( !first ) {
				first = true;
				test.strictEqual( value, "b", "value correct in callback" );
				test.strictEqual( key, "second", "key correct in callback" );
				test.strictEqual( self, object, "object correct in callback" );
			}
			return cumul + value;
		}), "abc", "callable on object" );
		first = false;
		test.strictEqual( object.reduce( function( cumul, value, key, self ) {
			if ( !first ) {
				first = true;
				test.strictEqual( value, "a", "value correct in callback" );
				test.strictEqual( key, "first", "key correct in callback" );
				test.strictEqual( self, object, "object correct in callback" );
			}
			return cumul + value;
		}, "X" ), "Xabc", "callable on object (with init)" );
		test.strictEqual( [ "a", "b", "c" ].reduce(function( cumul, value, key, self ) {
			return cumul + value;
		}), "abc", "callable on array" );
		test.strictEqual( [ "a", "b", "c" ].reduce( function( cumul, value, key, self ) {
			return cumul + value;
		}, "X" ), "Xabc", "callable on array (with init)" );
		(function() {
			test.strictEqual( arguments.reduce(function( cumul, value, key, self ) {
				return cumul + value;
			}), "abc", "callable on array-like" );
			test.strictEqual( arguments.reduce( function( cumul, value, key, self ) {
				return cumul + value;
			}, "X" ), "Xabc", "callable on array-like (with init)" );
		})( "a", "b", "c" );
		test.done();
	},

	reduceRight: function( test ) {
		test.expect( 12 );
		var object = {
				first: "a",
				second: "b",
				third: "c"
			},
			first;
		test.strictEqual( object.reduceRight(function( cumul, value, key, self ) {
			if ( !first ) {
				first = true;
				test.strictEqual( value, "b", "value correct in callback" );
				test.strictEqual( key, "second", "key correct in callback" );
				test.strictEqual( self, object, "object correct in callback" );
			}
			return cumul + value;
		}), "cba", "callable on object" );
		first = false;
		test.strictEqual( object.reduceRight( function( cumul, value, key, self ) {
			if ( !first ) {
				first = true;
				test.strictEqual( value, "c", "value correct in callback" );
				test.strictEqual( key, "third", "key correct in callback" );
				test.strictEqual( self, object, "object correct in callback" );
			}
			return cumul + value;
		}, "X" ), "Xcba", "callable on object (with init)" );
		test.strictEqual( [ "a", "b", "c" ].reduceRight(function( cumul, value, key, self ) {
			return cumul + value;
		}), "cba", "callable on array" );
		test.strictEqual( [ "a", "b", "c" ].reduceRight( function( cumul, value, key, self ) {
			return cumul + value;
		}, "X" ), "Xcba", "callable on array (with init)" );
		(function() {
			test.strictEqual( arguments.reduceRight(function( cumul, value, key, self ) {
				return cumul + value;
			}), "cba", "callable on array-like" );
			test.strictEqual( arguments.reduceRight( function( cumul, value, key, self ) {
				return cumul + value;
			}, "X" ), "Xcba", "callable on array-like (with init)" );
		})( "a", "b", "c" );
		test.done();
	},

	reverse: function( test ) {
		test.expect( 4 );
		function buildView( object ) {
			var cumul = "";
			for( var key in object ) {
				if ( cumul ) {
					cumul += ",";
				}
				cumul += key + ":" + object[ key ];
			}
			return cumul;
		}
		var object = { first: 1, second: 2, third: 3 };
		object.reverse();
		test.strictEqual( buildView( object ), "third:3,second:2,first:1", "callable on object (odd length)" );
		object = { first: 1, second: 2 };
		object.reverse();
		test.strictEqual( buildView( object ), "second:2,first:1", "callable on object (even length)" );
		var array = [ "a", "b" ];
		array.reverse();
		test.same( array, [ "b", "a" ], "callable on array" );
		(function() {
			arguments.reverse();
			test.same( arguments.slice( 0 ), [ "b", "a" ], "callable on array-like" );
		})( "a", "b" );
		test.done();
	},

	shift: function( test ) {
		test.expect( 5 );
		try {
			({}).shift();
		} catch( e ) {
			test.strictEqual( "" + e, "TypeError: Object is not an array or an array-like object", "cannot be called on objects" );
		}
		var array = [ 0, 1, 2 ];
		test.strictEqual( array.shift(), 0, "callable on  array (1/2)" );
		test.same( array, [ 1, 2 ], "callable on  array (2/2)" );
		(function() {
			test.strictEqual( arguments.shift(), 0, "callable on  array-like (1/2)" );
			test.deepEqual( arguments.slice( 0 ), [ 1, 2 ], "callable on array-like (2/2)" );
		})( 0, 1, 2 );
		test.done();
	},

	slice: function( test ) {
		test.expect( 3 );
		try {
			({}).slice();
		} catch( e ) {
			test.strictEqual( "" + e, "TypeError: Object is not an array or an array-like object", "cannot be called on objects" );
		}
		var array = [ 0, 1, 2 ];
		test.same( array.slice( 1, 2 ), [ 1 ], "callable on array" );
		(function() {
			test.same( arguments.slice( 1, 2 ), [ 1 ], "callable on array-like" );
		})( 0, 1, 2 );
		test.done();
	},

	splice: function( test ) {
		test.expect( 3 );
		try {
			({}).splice();
		} catch( e ) {
			test.strictEqual( "" + e, "TypeError: Object is not an array or an array-like object", "cannot be called on objects" );
		}
		var array = [ 0, 1, 2 ];
		array.splice( 1, 1, 3 );
		test.same( array, [ 0, 3, 2 ], "callable on array" );
		(function() {
			arguments.splice( 1, 1, 3 );
			test.same( arguments.slice( 0 ), [ 0, 3, 2 ], "callable on array-like" );
		})( 0, 1, 2 );
		test.done();
	},

	some: function( test ) {
		test.expect( 7 );
		var object = { first: 3, second: 6 };
		object.some(function( value, key, self ) {
			test.strictEqual( value, 3, "value correct in callback" );
			test.strictEqual( key, "first", "key correct in callback" );
			test.strictEqual( self, object, "object correct in callback" );
			return true;
		});
		test.ok( !object.some(function( value ) {
			return !( value % 4 );
		}), "some returning false" );
		test.ok( object.some(function( value ) {
			return !( value % 2 );
		}), "every returning true" );
		test.ok( [ "a", "b" ].some(function( value ) {
			return value === "b";
		}), "callable on array" );
		(function() {
			test.ok( arguments.some(function( value ) {
				return typeOf( value ) === "regexp";
			}), "callable on array-like");
		})( 3, /t/ );
		test.done();
	},

	sort: function( test ) {
		test.expect( 5 );
		function buildView( object ) {
			var cumul = "";
			for( var key in object ) {
				if ( cumul ) {
					cumul += ",";
				}
				cumul += key + ":" + object[ key ];
			}
			return cumul;
		}
		var object = { first: 3, second: 2, third: 1 };
		object.sort();
		test.strictEqual( buildView( object ), "third:1,second:2,first:3", "callable on object (odd length)" );
		object = { first: "ba", second: "ab" };
		object.sort();
		test.strictEqual( buildView( object ), "second:ab,first:ba", "callable on object (even length)" );
		object = { first: "ba", second: "ab" };
		object.sort(function( a, b ) {
			a = a.substr( 1 );
			b = b.substr( 1 );
			return ( a < b ) ? - 1 : ( a === b ? 0 : 1 );
		});
		test.strictEqual( buildView( object ), "first:ba,second:ab", "callable on object (callback)" );
		var array = [ "b", "a" ];
		array.sort();
		test.same( array, [ "a", "b" ], "callable on array" );
		(function() {
			arguments.reverse();
			test.same( arguments.slice( 0 ), [ "a", "b" ], "callable on array" );
		})( "b", "a" );
		test.done();
	},

	unshift: function( test ) {
		test.expect( 3 );
		try {
			({}).unshift();
		} catch( e ) {
			test.strictEqual( "" + e, "TypeError: Object is not an array or an array-like object", "cannot be called on objects" );
		}
		var array = [ 0, 1, 2 ];
		array.unshift( 3, 4, 5 );
		test.same( array, [ 3, 4, 5, 0, 1, 2 ], "can be called on array" );
		(function() {
			arguments.unshift( 3, 4, 5 );
			test.same( arguments.slice( 0 ), [ 3, 4, 5, 0, 1, 2 ], "can be called on array-like" );
		})( 0, 1, 2 );
		test.done();
	}
};
