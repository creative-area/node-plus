require( "./../plus" );

module.exports = require( "fs" ).deferizeSelf({
	rename:		"[2]",
	truncate:	"[2]",
	chmod:		"[2]",
	stat:		"errorOrAnswer[1]",
	lstat:		"errorOrAnswer[1]",
	fstat:		"errorOrAnswer[1]",
	link:		"[2]",
	symlink:	"[2]",
	readlink:	"errorOrAnswer[1]",
	realpath:	"errorOrAnswer[1]",
	unlink:		"[1]",
	rmdir:		"[1]",
	mkdir:		"[2]",
	readdir:	"errorOrAnswer[1]",
	close:		"[1]",
	open:		"errorOrAnswer[3]",
	write:		"errorOrAnswer[5]",
	read:		"errorOrAnswer[5]",
	readFile:	"errorOrAnswer[2]",
	writeFile:	"[3]"
});
