node-plus
=========
node-plus (or just __plus__) is a toolbox for nodejs that adds a bunch of functionalities to make node programming easier.

__plus__ is dual licensed under the MIT or GPL Version 2 licenses.

## Array Methods Available Where Needed

Ever dreamed you could use _arguments.forEach_ and cringed at the acrobatics involved? __plus__ makes all the standard _Array_ methods available to _Array-like_ objects. It also provides two separate means to mark objects or even entire classes as _Array-like_.

__plus__ also introduces the _flatten_ methods for _Arrays_ and _Array-like_ objects, a super useful deep _forEach_/_map_ kind of method.

Furthermore, when it makes sense, __plus__ provides an implementation of _Array_ methods for non-_Array-like_ objects. So you can use _forEach_, _map_, _filter_ and more onto plain objects!

## Proper Type Determination

Never understood why _typeof new String()_ returns _"object"_? Fear not, __plus__'s _typeOf( new String() )_ will return _"string"_ just like _jQuery.type()_ does!

_Arguments_ object are recognized as _"arguments"_, _Regular Expression_ object as _"regexp"_, etc.

## New Plain Object Methods

__plus__ adds _extend_, _deepExtend_ and _hiddenExtend_ for all your objects merging needs. Dealing with objects has never been easier. 

With _Array-like_ objects getting so much love, you'll be happy to know you can use _isArrayLike()_ to determine if your object will behave like an _Array_ or not: very useful when a function parameter can be an _Array_, an _Arguments_ object or any other kind of _Array-like_ object!

## And More!

__plus__ is heavily tested internally (more than 160 unique assertions in unit tests) but bugs undoubtedly exist! Don't hesitate to report them and make pull requests if you feel like helping.