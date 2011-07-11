require( "./../plus" );

var proto = (( module.exports = require( "events" ) )).EventEmitter.prototype;

proto.deferizeSelf( {
	addListener: 	"progress[1]",
	on: 			"progress[1]",
	once:			"progress[1]"
}, true );
