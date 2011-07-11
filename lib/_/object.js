var call = Function.prototype.call,
	apply = Function.prototype.apply,
	arrayProto = Array.prototype,
	forEach = call.bind( arrayProto.forEach ),
	slice = call.bind( arrayProto.slice ),
	concat = apply.bind( arrayProto.concat ),
	toString = call.bind( Object.prototype.toString ),
	r_cleanType = /^\[object |\]$/g,
	typeCache = {};

global.typeOf = function( obj ) {
	var type = ( obj == null ? String : toString )( obj );
	return typeCache[ type ] || ( typeCache[ type ] = type.replace( r_cleanType, "" ).toLowerCase() );
};

function deepExtend( dest, src ) {
	if ( ( src && typeOf( src ) ) !== "object" ) {
		return ( src && src.isArrayLike() ) ? slice( src, 0 ) : src.valueOf();
	}
	if ( ( dest && typeOf( dest ) ) !== "object" ) {
		dest = {};
	}
	for ( var key in src ) {
		dest[ key ] = deepExtend( dest[ key ], src[ key ] );
	}
	return dest;
}

Object.defineProperty( Object, "arrayTypes", {
	value: {
		arguments: true
	},
	enumerable: true
});

var methods = {
	extend: function() {
		if ( this == null ) {
	    	throw new TypeError();
	    }
		var target = this;
		forEach( arguments, function( src ) {
			for ( var key in src ) {
				target[ key ] = src[ key ];
			}
		});
		return target;
	},
	deepExtend: function() {
		if ( this == null ) {
	    	throw new TypeError();
	    }
		var target = this;
		forEach( arguments, function( src ) {
			target = deepExtend( target, src );
		});
		return target;
	},
	hiddenExtend: function() {
		if ( this == null ) {
	    	throw new TypeError();
	    }
		var definitions = {},
			key;
		forEach( arguments, function( src ) {
			for ( key in src ) {
				definitions[ key ] = {
					value: src[ key ]
				};
			}
		});
		for ( key in definitions ) {
			if ( key in this ) {
				delete this[ key ];
			}
		}
		Object.defineProperties( this, definitions );
		return this;
	},
	isArrayLike: function() {
		return !!( this && ( this.__array_like__ || Array.isArray( this ) || Object.arrayTypes[  typeOf( this ) ] ) );
	}
};

function flatten( object, array, callback ) {
	if ( object && object.isArrayLike() ) {
		forEach( object, function( object ) {
			flatten( object, array, callback );
		});
	} else {
		if ( callback ) {
			try {
				object = callback( object );
			} catch( e ) {
				return array;
			}
		}
		if ( array ) {
			array.push( object );
		}
	}
	return array;
}

function objectSortCompare( compare ) {
	return function( a, b ) {
		a = a.value;
		b = b.value;
		if ( compare ) {
			return compare( a, b );
		}
		a = String( a );
		b = String( b );
		return a < b ? -1 : ( a === b ? 0 : 1 );
	};
}

var arrayMethods = {
		concat: false,
		every: function( callback, context ) {
			if ( typeof callback !== "function" ) {
		    	throw new TypeError( "First argument is not callable" );
		    }
			callback = callback.bind( context );
			for( var key in this ) {
				if ( !callback( this[ key ], key, this ) ) {
					return false;
				}
			}
			return true;
		},
		filter: function( callback, context ) {
			if ( typeof callback !== "function" ) {
		    	throw new TypeError( "First argument is not callable" );
		    }
			var output = {},
				key;
			callback = callback.bind( context );
			for( key in this ) {
				if ( callback( this[ key ], key, this ) ) {
					output[ key ] = this[ key ];
				}
			}
			return output;
		},
		flatten: function( callback, _ ) {
			var array = ( callback === false ) ? undefined : [];
			if ( !array ) {
				callback = _;
			}
			if ( callback && typeof callback !== "function" ) {
				throw new TypeError( ( array ? "Second" : "First" ) + " argument is absent or not callable" );
			}
			if ( callback || array ) {
				return flatten( this, array, callback );
			}
		},
		forEach: function( callback, context ) {
			if ( typeof callback !== "function" ) {
		    	throw new TypeError( "First argument is not callable" );
		    }
			callback = callback.bind( context );
			for( var key in this ) {
				callback( this[ key ], key, this );
			}
		},
		indexOf: function( element, fromIndex ) {
			var indexPassed = ( arguments.length < 2 ),
				key;
			for( key in this ) {
				if ( !indexPassed ) {
					if ( key !== fromIndex ) {
						continue;
					}
					indexPassed = true;
				}
				if ( this[ key ] === element ) {
					return key;
				}
			}
			return -1;
		},
		join: function( separator ) {
			var array = [],
				key;
			for ( key in this ) {
				array.push( this[ key ] );
			}
			return array.join( separator );
		},
		lastIndexOf: function( element, fromIndex ) {
			var indexPassed = ( arguments.length < 2 ),
				keys = Object.keys( this ),
				key,
				index = keys.length;
			while(( index-- )) {
				key = keys[ index ];
				if ( !indexPassed ) {
					if ( key !== fromIndex ) {
						continue;
					}
					indexPassed = true;
				}
				if ( this[ key ] === element ) {
					return key;
				}
			}
			return -1;
		},
		map: function( callback, context ) {
			if ( typeof callback !== "function" ) {
		    	throw new TypeError( "First argument is not callable" );
		    }
			var output = {},
				key;
			callback = callback.bind( context );
			for( key in this ) {
				output[ key ] = callback( this[ key ], key, this );
			}
			return output;
		},
		pop: false,
		push: false,
		reduce: function( cumulate, initial ) {
			if ( typeof cumulate !== "function" ) {
		    	throw new TypeError( "First argument is not callable" );
		    }
			var cumul = initial,
				key,
				loop;
			for( key in this ) {
				if ( !loop ) {
					loop = true;
					if ( arguments.length === 1 ) {
						cumul = this[ key ];
						continue;
					}
				}
				cumul = cumulate( cumul, this[ key ], key, this );
			}
			if ( !loop && arguments.length === 1 ) {
				throw new TypeError( "Empty array and no second argument" );
			}
			return cumul;
		},
		reduceRight: function( cumulate, initial ) {
			if ( typeof cumulate !== "function" ) {
		    	throw new TypeError( "First argument is not callable" );
		    }
			var cumul = initial,
				keys = Object.keys( this ),
				key,
				index = keys.length,
				loop;
			while(( index-- )) {
				key = keys[ index ];
				if ( !loop ) {
					loop = true;
					if ( arguments.length === 1 ) {
						cumul = this[ key ];
						continue;
					}
				}
				cumul = cumulate( cumul, this[ key ], key, this );
			}
			if ( !loop && arguments.length === 1 ) {
				throw new TypeError( "Empty array and no second argument" );
			}
			return cumul;
		},
		reverse: function() {
			var key, value,
				keys = Object.keys( this ),
				index = keys.length;
			while(( index-- )) {
				key = keys[ index ];
				value = this[ key ];
				delete this[ key ];
				this[ key ] = value;
			}
		},
		shift: false,
		slice: false,
		splice: false,
		some: function( callback, context ) {
			if ( typeof callback !== "function" ) {
		    	throw new TypeError( "First argument is not callable" );
		    }
			callback = callback.bind( context );
			for( var key in this ) {
				if ( callback( this[ key ], key, this ) ) {
					return true;
				}
			}
			return false;
		},
		sort: function( compare ) {
			if ( arguments.length && typeof compare !== "function" ) {
		    	throw new TypeError( "First argument is not callable" );
		    }
			var array = [],
				key,
				index,
				length;
			for ( key in this ) {
				array.push({
					key: key,
					value: this[ key ]
				});
			}
			array.sort( objectSortCompare( compare ) );
			for ( index = 0, length = array.length; index < length; index++ ) {
				key = array[ index ].key;
				delete this[ key ];
				this[ key ] = array[ index ].value;
			}
		},
		unshift: false
	},
	needsFix = {
		concat: function( object, args ) {
			return concat( slice( object, 0 ), args );
		}
	};

for ( var method in arrayMethods ) {
	(function( method, key ) {
		var arrayMethod = arrayProto[ key ];
		if ( !arrayMethod ) {
			if ( method ) {
				Object.defineProperty( arrayProto, key , {
					value: (( methods[ key ] = method ))
				});
			}
		} else {
			if ( method ) {
				method = apply.bind( method );
			}
			arrayMethod = needsFix[ key ] || apply.bind( arrayMethod );
			methods[ key ] = function() {
				if ( this == null ) {
			    	throw new TypeError();
			    }
				if ( this.isArrayLike() ) {
					return arrayMethod( this, arguments );
				}
				if ( !method ) {
					throw new TypeError( "Object is not an array or an array-like object" );
				}
				return method( this, arguments );
			};
		}
	})( arrayMethods[ method ], method );
}

methods.hiddenExtend.call( Object.prototype, methods );
