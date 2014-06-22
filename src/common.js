var root   = this,
    lodash = root._;

function existy(x) { return x != null };
function truthy(x) { return (x !== false) && existy(x) };


function cat() {
    var head = lodash.first(arguments);
    if (existy(head)) return head.concat.apply(head, lodash.rest(arguments)); 
    else return [];
}

function construct(head, tail) { 
    return cat([head], lodash.toArray(tail));
}

function table(table, keys) {
    return lodash.map(table, function(obj) {
        return lodash.pick.apply(null, construct(obj, keys));
    });
}

function rename(obj, newNames) {
    return lodash.reduce(newNames, function(o, nu, old) {
        if (lodash.has(obj, old)) {
            o[nu] = obj[old];
            return o;
        }
        else return o;
    },
    lodash.omit.apply(null, construct(obj, lodash.keys(newNames))));
}

function as(table, newNames) {
    return lodash.map(table, function(obj) {
        return rename(obj, newNames);
    });
}

function valuesOf(obj, keys) {
    return lodash.map(lodash.pick.apply(null, construct(obj, keys)), function (o) {
        return o;
    });
}

function containAll(obj, keys) {
    return lodash.every(keys, function(key){
        return lodash.contains(obj, key);
    });
}
/**
 * var users = [{id:1,name:'Alice'},{id:2,name:'John'}];
 * var good  = [{id:1,name:'Alice'}];
 *
 * _.differenceBy(users, good, 'id');
 * -> [{id:2,name:'John'}]
 */

function differenceBy(compare, compateTo, compareBy) {
    var values = lodash.pluck(compateTo, compareBy);
    return lodash.filter(compare, function (o) {
        return lodash.indexOf(values, o[compareBy]) === -1;
    });
}

function findIndexBy (collection, field, value) {
    return lodash.findIndex(collection, function(model) {
        return model[field] === value;
    });
}

function isCollection (collection) {
    lodash.every(collection, function(model){ return lodash.isPlainObject(model);});
}
/**
 * var users = [{name:'Alice', age: 12},{name:'John',age:15},{name:'Bob',age:20}]
 * _.filterBy(users,{'age&eq;':123})
 *
 */

/**
 * var users = [[{name:'Alice', age: 12}],[{name:'John',age:15}],[{name:'Bob',age:20}]]
 * _.concatBy(users,['name'])
 * result -> [{name:'Alice'},{name:'John'},{name:'Bob'}];
 */
function concatBy (values, keys) {
    return cat.apply(null, lodash.map(values, function (value) {
        if (!keys) return value;
        return lodash.table(value, keys);
    }));
}

if (typeof lodash !== 'object' && typeof require === 'function') {
    lodash = require('lodash');
}

lodash.mixin({
    'existy': existy,
    'truthy': truthy,
    'cat': cat,
    'construct': construct,
    'table': table,
    'rename': rename,
    'as': as,
    'valuesOf': valuesOf,
    'containAll': containAll,
    'differenceBy': differenceBy,
    'findIndexBy': findIndexBy,
    'concatBy': concatBy
});

if (module && exports) {
    module.exports = lodash;
}