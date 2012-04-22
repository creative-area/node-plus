node-plus
=========
node-plus (or just __plus__) is a toolbox for nodejs that adds a bunch of functionalities to make node programming easier.

__plus__ is dual licensed under the MIT or GPL Version 2 licenses.

__plus__ is heavily tested internally (more than 160 unique assertions in unit tests) but bugs undoubtedly exist! Don't hesitate to report them and make pull requests if you feel like helping.

## In a Nutshell

### Array Methods Available Where Needed

Ever dreamed you could use _arguments.forEach_ and cringed at the acrobatics involved? __plus__ makes all the standard _Array_ methods available to _Array-like_ objects. It also provides two separate means to mark objects or even entire classes as _Array-like_.

__plus__ also introduces the _flatten_ methods for _Arrays_ and _Array-like_ objects, a super useful deep _forEach_/_map_ kind of method.

Furthermore, when it makes sense, __plus__ provides an implementation of _Array_ methods for non-_Array-like_ objects. So you can use _forEach_, _map_, _filter_ and more onto plain objects!

### Proper Type Determination

Never understood why _typeof new String()_ returns _"object"_? Fear not, __plus__'s _typeOf( new String() )_ will return _"string"_ just like _jQuery.type()_ does!

_Arguments_ object are recognized as _"arguments"_, _Regular Expression_ object as _"regexp"_, etc.

### New Plain Object Methods

__plus__ adds _extend_, _deepExtend_ and _hiddenExtend_ for all your objects merging needs. Dealing with objects has never been easier. 

With _Array-like_ objects getting so much love, you'll be happy to know you can use _isArrayLike()_ to determine if your object will behave like an _Array_ or not: very useful when a function parameter can be an _Array_, an _Arguments_ object or any other kind of _Array-like_ object!

## Documentation

### Installing

Just use npm: `npm install plus`

### Using

As soon as possible in your project just put `require( "plus" );`.

Since __plus__ will declare the global function `typeOf` and augment `Object` and its prototype, it will "propagate" to the rest of your project. Some people may see this as undesirable and, for any other purpose, I would agree, but it's quite unavoidable given the very nature of what __plus__ does.

### Brand New Methods & Functions

__`Object.prototype.extend( obj1, ..., objN )`__
> will add the properties of `obj1` to `objN` onto the current object. In case of properties already present, they will be overwritten by the newest value.

__`Object.prototype.deepExtend( obj1, ..., objN )`__
> same as `extend` except that the process is recursive when values of overwritten properties are objects.

__`Object.prototype.flatten( [ false, ] [ callback ] )`__
> flattens an Array or Array-like object. When called on a non-Array-like object, return the object in an Array:
> * `[ [ 1, 2 ], 3, [ [ 4 ], [ 5 ] ] ].flatten()` will return `[ 1, 2, 3, 4, 5 ]`
> * `{}.flatten()` will return `[ {} ]`
>
> if `callback` is given it acts as a data filter, the returned value is used to fill the resulting array. If an exception is thrown, the value is simply skipped and left out of the resulting array. For instance, the following code will return `[ 4, 8 ]`:
>
>     [ [ 1, 2 ], 3, [ [ 4 ], [ 5 ] ] ].flatten(function( value ) {
>         if ( value % 2 ) {
>             throw "odd";
>         }
>         return 2 * value;
>     });
>
> if `false` is given as first argument, then no array is constructed (`flatten` will return `undefined`) but `callback` will be called nonetheless:
>
>     var tmp = 0;
>     [ [ 1, 2 ], 3 ].flatten(function( value ) {
>         tmp += value;
>     });
>     console.log( tmp ); // outputs 6

__`Object.prototype.hiddenExtend( obj1, ..., objN )`__
> same as `extend` except the added properties won't be iterable using a `for..in` statement.

__`Object.prototype.isArrayLike()`__
> returns true if an Object is an Array or an Array-like Object, false otherwise.

__`typeOf( obj )`__
> returns the type of `obj`. This is equivalent to the `typeof` operator for non-Objects but will return the correct type for instantiated values. For instance, `typeOf( new String() )` will return `"string"` not `"class"`.

### Array Methods

The following table shows for which type of Object each Array method is implemented:

| Method        | Array-like Objects | Objects       |
| -------------:|:------------------:|:-------------:|
| `concat`      | __YES__            | _NO_          |
| `every`       | __YES__            | __YES__       |
| `filter`      | __YES__            | __YES__       |
| `flatten`     | __YES__            | __YES__       |
| `forEach`     | __YES__            | __YES__       |
| `indexOf`     | __YES__            | __YES__       |
| `join`        | __YES__            | __YES__       |
| `lastIndexOf` | __YES__            | __YES__       |
| `map`         | __YES__            | __YES__       |
| `pop`         | __YES__            | _NO_          |
| `push`        | __YES__            | _NO_          |
| `reduce`      | __YES__            | __YES__       |
| `reduceRight` | __YES__            | __YES__       |
| `reverse`     | __YES__            | __YES__       |
| `shift`       | __YES__            | _NO_          |
| `slice`       | __YES__            | _NO_          |
| `splice`      | __YES__            | _NO_          |
| `some`        | __YES__            | __YES__       |
| `sort`        | __YES__            | __YES__       |
| `unshift`     | __YES__            | _NO_          |

For those methods rewritten for Plain Objects, the algorithm is as much of a direct translation as possible with the notable exception of `sort` which, while sorting according to the value, will keep the key/value correspondances of the object. For instance, `{ "a": 2, "b": 1 }.sort();` will change the object into `{ "b": 1, "a": 2 }`.

Please note that, [because of a __BUG__ (Google devs can argue all they want, three years and more than a hundred comments later, it is *still* a bug in V8)](http://code.google.com/p/v8/issues/detail?id=164), the engine does not ensure consistent ordering of properties in Objects when one or more keys are numbers (or parsable as numbers, which is even worse). As such, some of the methods will probably not work as you would expect if you use numbers as keys. Let's pray the V8 devs get back to their senses one day. In the meantime, don't use numbers as keys in non-Array-like objects.

### Tagging a Class or Object as "Array-like"

The simplest way to tag a Class as Array-like is to add a `__array_like__` boolean property set to true to its prototype. We recommand using `Object.defineProperty` so that the property is not iterable using a `for...in` statement:

    Object.defineProperty( MyConstructor.prototype, "__array_like__", { "value": true } );

If your code is not prototype-based (but rather uses Plain Objects created in closures), you can create the property onto the Object itself:

    Object.defineProperty( myPlainObject, "__array_like__", { "value": true } );

If you're using Objects from a third-party library and can't (or don't want to) change the library's code, look up what value `typeOf` returns for this type of Objects and add an entry on the `Object.arrayTypes` map:

    Object.arrayTypes[ "thetype" ] = true;

__plus__ will take care of the rest from there! ;)