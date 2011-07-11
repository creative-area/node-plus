function later( context, fn, args ) {
	process.nextTick(function() {
		fn.apply( context, args );
	});
}

function Callbacks( repeat ) {
	var list = [],
		context,
		args,
		cbs;
	return ( cbs = {
		add: function() {
			if ( list || args ) {
				arguments.flatten( false, function( callback ) {
					if ( typeof callback === "function" ) {
						list && ( repeat || !args ) && ( list.indexOf( callback ) === -1 ) && list.push( callback );
						args && later( context, callback, args );
					}
				});
			}
			return this;
		},
		remove: function() {
			if ( list ) {
				arguments.flatten( false, function( callback ) {
					if ( typeof callback === "function" ) {
						var index = list.indexOf( callback );
						if ( index >= 0 ) {
							list.splice( index, 1 );
						}
					}
				});
			}
		},
		cancel: function() {
			list = undefined;
			if ( !repeat ) {
				context = args = undefined;
			}
		},
		fire: function( _context, _args ) {
			if ( list && ( repeat || !args ) ) {
				cbs.fc && cbs.fc.forEach(function( callback ) {
					callback();
				});
				cbs.fc = undefined;
				if ( _context && typeof _context.promise === "function" ) {
					_context = _context.promise();
				}
				context = _context;
				args = _args;
				var _list = list;
				if ( !repeat ) {
					list = undefined;
				}
				_list.forEach(function( callback ) {
					later( _context, callback, _args );
				});
			}
			return this;
		},
		call: function() {
			cbs.fire( this, arguments );
			return this;
		}
	});
}

var attachs = {
		resolve: "done",
		reject: "fail",
		progress: "ping"
	},
	detachs = attachs.map(function( value ) {
		return "remove" + value.substr( 0, 1 ).toUpperCase() + value.substr( 1 );
	});

function attachDetach( defer, list ) {
	return function( done, fail, ping ) {
		var cbs = done && arguments.length === 1 && ( typeof done !== "function" ) ? done : {
				resolve: done,
				reject: fail,
				progress: ping
			},
			key;
		for( key in list ) {
			if ( typeof cbs[ key ] === "function" ) {
				defer[ list[ key ] ]( cbs[ key ] );
			}
		}
		return this;
	};
}

function Deferred( func ) {
	var cbls = {},
		defer = {},
		promise = {},
		fire,
		cbs;
	for ( fire in attachs ) {
		cbs = cbls[ fire[2] ] = Callbacks( fire === "progress" );
		promise[ attachs[fire] ] = cbs.add;
		promise[ detachs[fire] ] = cbs.remove;
		defer[ fire + "With" ] = cbs.fire;
		defer[ fire ] = cbs.call;
	}
	cbls.s.fc = [ cbls.j.cancel, cbls.o.cancel ];
	cbls.j.fc = [ cbls.s.cancel, cbls.o.cancel ];
	cbs = fire = cbls = undefined;
	defer.extend( promise.extend({
		attach: attachDetach( defer, attachs ),
		detach: attachDetach( defer, detachs ),
		then: function( done, fail, ping ) {
			var cbs = {
					s: done && arguments.length === 1 && ( typeof done.promise === "function" ) ? function() {
						return done.promise();
					} : done,
					j: fail,
					o: ping
				},
				newDefer = Deferred();
			attachs.forEach(function( attach, fire ) {
				var cb = cbs[ fire[2] ];
				defer[ attach ]( typeof cb === "function" ? function() {
					var tmp;
					try {
						tmp = cb.apply( this, arguments );
					} catch( e ) {
						newDefer.reject( e );
					}
					if ( tmp && ( typeof tmp.promise === "function" ) ) {
						tmp.promise().attach( newDefer );
					} else {
						tmp = tmp === undefined ? arguments :
							(  tmp && tmp.isArrayLike() ? tmp : [ tmp ] );
						newDefer[ fire + "With" ]( this === promise ? newDefer.promise() : this, tmp );
					}
				} : newDefer[ fire ] );
			});
			return newDefer.promise();
		},
		always: function( cb ) {
			defer.attach( cb, cb );
			return this;
		},
		promise: function( target ) {
			if ( target != null ) {
				return target.extend( promise );
			}
			return promise;
		}
	}) );
	if ( func ) {
		func.call( defer, defer );
	}
	return defer;
}

global.Deferred = Deferred;

global.when = function() {
	var result = arguments,
		count = result.length;
	if ( count < 2 ) {
		if ( !count ) {
			return Deferred().resolve();
		}
		if ( result[ 0 ] && typeof result[ 0 ].promise === "function" ) {
			return result[ 0 ].promise();
		}
	}
	var defer = Deferred(),
		promise = defer.promise(),
		progress = new Array( count ),
		progressing = false;
	function decount() {
		if ( !(( --count )) ) {
			defer.resolveWith( promise, result );
		}
	}
	function fireProgress() {
		if ( !progressing ) {
			progressing = true;
			later( promise, function() {
				progressing = false;
				defer.progressWith( this, arguments );
			}, progress );
		}
	}
	result.forEach(function( value, index ) {
		if ( value && typeof value.promise === "function" ) {
			value.promise().attach({
				resolve: function() {
					result[ index ] = arguments.length > 1 ? arguments.slice( 0 ) : arguments[ 0 ];
					decount();
				},
				reject: defer.reject,
				progress: function() {
					progress[ index ] = arguments.length > 1 ? arguments.slice( 0 ) : arguments[ 0 ];
					fireProgress();
				}
			});
		} else {
			decount();
		}
	});
	return defer.promise();
};

var r_callbackPosition = /^(.*?)(?:\[([0-9])*\])?$/,
	adapters = {},
	deferAdapters = {
		boolean: function( defer ) {
			return function( bool ) {
				if ( bool ) {
					defer.resolveWith( this );
				} else {
					defer.rejectWith( this );
				}
			};
		},
		errorAnswer: function( defer ) {
			return function( error, answer ) {
				if ( error ) {
					defer.rejectWith( this, [ error ] );
				} else {
					defer.resolveWith( this, [ answer ] );
				}
			};
		},
		errorOnly: function( defer ) {
			return function( error ) {
				if ( error ) {
					defer.rejectWith( this, [ error ] );
				} else {
					defer.resolveWith( this, [] );
				}
			};
		}
	};

"resolve reject progress".split( " " ).forEach(function( name ) {
	deferAdapters[ name ] = function( defer ) {
		return defer[ name ];
	};
});

deferAdapters.forEach(function( callbackCreator, name ) {
	adapters[ name ] = function( defer, args, position ) {
		position = position === undefined ? args.length : position;
		if ( position > args.length ) {
			args = args.concat( new Array( position - args.length ) );
		}
		args.splice( position, 0, callbackCreator( defer ) );
		return args;
	};
});

function deferize( adapter, position ) {
	if ( arguments.length ) {
		if ( typeOf( adapter ) === "string" ) {
			adapter = r_callbackPosition.exec( adapter );
			position = adapter[ 2 ] || position;
			adapter = adapters[ adapter[ 1 ] || "resolve" ];
			if ( !adapter ) {
				throw new Error( "Unknown adapter" );
			}
		}
		if ( typeof adapter !== "function" ) {
			adapter = undefined;
		}
	}
	position = ( position || position === 0 ) ? 1 * position : undefined;
	var method = this;
	return function() {
		var defer = Deferred();
		if ( !adapter ) {
			defer.resolve( method.apply( this, arguments ) );
		} else {
			method.apply( this, adapter( defer, arguments, position ) );
		}
		return defer.promise();
	};
}

Function.prototype.hiddenExtend({
	deferize: deferize
});

function deferizeName( name ) {
	return name + "Defer";
}

Object.prototype.hiddenExtend({
	deferize: function( adapters, nameAdapter, target ) {
		nameAdapter = typeof nameAdapter === "function" && nameAdapter;
		target = target || {};
		var key, tmp;
		for ( key in adapters ) {
			tmp = adapters[ key ];
			if ( typeof this[ key ] === "function" ) {
				if ( !tmp || !tmp.isArrayLike() ) {
					tmp = [ tmp ];
				}
				target[ nameAdapter ? nameAdapter( key ) : key ] = deferize.apply( this[ key ], tmp );
			}
		}
		return target;
	},
	deferizeSelf: function( adapters, hidden ) {
		return this[ hidden ? "hiddenExtend" : "extend" ]( this.deferize( adapters, deferizeName ) );
	}
});

({
	Timeout:	"resolve",
	Interval:	"progress"
})
.forEach(function( deferAction, type ) {
	var start = global[ "set" + type ],
		end = global[ "clear" + type ];
	Deferred[ type ] = function() {
		var defer = Deferred(),
			timer = start.apply( undefined, [ defer[ deferAction ] ].concat( arguments.slice( 0 ) ) );
		return defer.promise({
			clear: function() {
				end( timer );
				defer.reject();
			}
		});
	};
});
