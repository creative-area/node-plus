require( "./../lib/plus" );

var types = {
		"arguments": [ (function() { return arguments; })() ],
		"array": [ [], [ 5 ], new Array(), new Array( 2 ) ],
		"boolean": [ true, false, new Boolean( true ), new Boolean( false ) ],
		"function": [ (function() {}), Object.keys, Object.prototype.toString, new Function() ],
		"null": [ null ],
		"number": [ 0, 32, new Number( 0 ), new Number( 32 ) ],
		"object": [ {}, { f:1 }, new Object(), Object.prototype ],
		"regexp": [ /r/, new RegExp( "u" ) ],
		"string": [ "", "hello", new String( "" ), new String( "hello" ) ],
		"undefined": [ undefined ]
	},
	type;

for ( type in types ) {
	(function( type, values ) {
		exports[ type ] = function( test ) {
			test.expect( values.length );
			values.forEach(function( value ) {
				test.strictEqual( typeOf( value ), type );
			});
			test.done();
		};
	})( type, types[ type ] );
}
