var root   = this,
    lodash = root._;

if (typeof lodash !== 'object' && typeof require === 'function') {
    lodash = require('lodash');
}

if (typeof lodash !== 'function') {
    throw Error('fupslot.lodash.extend required lodash');
}

function existy(x) { return x != null };
function truthy(x) { return (x !== false) && existy(x) };
function ignored(x) { return x[0] == '-'}

function cat() {
    var head = lodash.first(arguments);
    if (existy(head)) return head.concat.apply(head, lodash.rest(arguments)); 
    else return [];
}

function construct(head, tail) { 
    return cat([head], lodash.toArray(tail));
}

function restOfString(string, start) {
    return string.substr(start || 1, string.length);
}

/**
 * Selectivelly creates an array composed of the own enumerable property names of an object.
 *
 * @returns {Array} Returns an array of property names.
 * @example
 *
 * keyss({a:1,b:2,c:3},'!c')
 * // => ['a','b']
 */
function keyss(obj) {
    return lodash.difference(lodash.keys(obj), lodash.map(lodash.rest(arguments), restOfString));
}

/**
 * var users = [[{name:'Alice', number: 12}],[{name:'John',number:15}]]
 * _.table(users,['name',{number:'age'}])
 * result -> [{name:'Alice', age:12},{name:'John',age:15}];
 */
 /**
  * var users = [{name:'Alice', general: {number:12,city:'New York'}}]
  * _.table(users,['name',{'~general':{number:'age'}}])
  * 
  */ 
function table(table, keys) {
    if (lodash.isArray(keys)) {

        if (lodash.some(keys, ignored)) {
            var ignore = lodash.filter(keys, ignored);
            return lodash.map(table, function(row) {
                return lodash.pick.apply(null, construct(row, keyss.apply(null,construct(row, ignore))));
            });
        }
        else {
            var columns = lodash.filter(keys, lodash.isObject);
            if (columns.length > 0) {
                var newNames = lodash.assign.apply({}, columns);
                keys = cat(lodash.filter(keys, lodash.isString), lodash.values(newNames));
                table = as(table, newNames);
            }
            return lodash.map(table, function(row) {
                return lodash.pick.apply(null, construct(row, keys));
            });
        }
    }

    if (lodash.isObject(keys)) {
        return lodash.map(table, function(row) {
            return extract(row, keys);
        });
    }

    return [];
}

/**
 * var user = {name:'Alice', general: {number:12,city:'New York'}}
 * extract(user, {general:{number:'age',city:'city'}})
 * result -> user.name: 'Alice'
 *           user.age:  12
 *           user.city: 'New York'
 */
function extract (obj, branch) {
    var properties = [];
    for (var key in branch) {
        if (lodash.isObject(obj[key])) {
            properties = [].concat(properties, extract(obj[key], branch[key]));
        }
        if (!lodash.isObject(obj[key]) && !lodash.isArray(obj[key])) {
            var no = {}, nkey = key;
            if (nkey !== branch[key]) nkey = branch[key];
            no[nkey] = obj[key];
            properties.push(no);
        }
    }
    return lodash.assign.apply({},properties);
}
/**
 * queryObject -> {'age':{$in:[1,2]}}
 * queryObject -> {'age':{$eq:[1,2]}}
 */ 
function query (collection, queryObject, or) {
    var method = or === true ? 'some' : 'every';
    return lodash.filter(collection, function (row) {
        return lodash[method](queryObject, function (obj, key) {
            return matchQuery(row, key, obj, method);
        });
    });
}

function matchQuery (row, key, query, method) {
    return lodash[method](query, function (values, cond) {
        if (cond === '$in') return matchQueryIn(row, key, values);
        if (cond === '$eq') return matchQueryEq(row, key, values);
        if (cond === '$noeq') return matchQueryNoeq(row, key, values);
        if (cond === '$gt') return  matchQueryGt(row, key, values);
        if (cond === '$gte') return matchQueryGt(row, key, values, true);
        if (cond === '$lt') return  matchQueryLt(row, key, values);
        if (cond === '$lte') return matchQueryLt(row, key, values, true);
        if (cond === '$has') return matchQueryHas(row, key, values);
        if (cond === '$between') return matchQueryBetween(row, key, values);
        if (cond === '$regex') return matchQueryRegexp(row, key, values);
        // 
        return false;
    });
}

function matchQueryIn (row, field, values) {
    if (lodash.isArray(values)) {
        return values.indexOf(row[field]) !== -1;
    }

    if (lodash.isString(values) && lodash.isString(row[field])) {
        return row[field].indexOf(values) !== -1;
    }
    return false;
}

function matchQueryEq (row, field, value) {
    if (lodash.isArray(row[field])) return row[field]['length'] === value;
    return lodash.isEqual(row[field], value);
}

function matchQueryNoeq (row, field, value) {
    return !lodash.isEqual(row[field], value);
}

function matchQueryGt (row, field, value, equal) {
    if (lodash.isArray(row[field])) return gt(row[field]['length'], value, equal);
    if (lodash.isNumber(row[field])) {
        return gt(row[field], value, equal);
    }
    
    if (lodash.isDate(row[field]) && lodash.isDate(value)) {
        return gt(row[field].getTime(), value.getTime(), equal);
    }
    return false;
}

function matchQueryLt (row, field, value, equal) {
    if (lodash.isArray(row[field])) return lt(row[field]['length'], value, equal);
    if (lodash.isNumber(row[field])) {
        return lt(row[field], value, equal);
    }

    if (lodash.isDate(row[field]) && lodash.isDate(value)) {
        return lt(row[field].getTime(), value.getTime(), equal);
    }
    return false;
}

function gt (n1, n2, equal) {
    return equal === true ? n1 >= n2 : n1 > n2;
}

function lt (n1, n2, equal) {
    return equal === true ? n1 <= n2 : n1 < n2;
}

function matchQueryHas (row, field, value) {
    return lodash.has(row, field) === value;
}

function matchQueryBetween (row, field, value) {
    if (lodash.isNumber(row[field]) && lodash.isArray(value)) {
        return row[field] >= value[0] && row[field] <= value[1];
    }

    if (lodash.isDate(row[field]) && lodash.isArray(value)) {
        return row[field].getTime() >= value[0] && row[field].getTime() <= value[1];
    }
    return false;
}

function matchQueryRegexp(row, field, value) {
    try {
        var regexp = value instanceof RegExp ? value : new RegExp(value);
        return regexp.test(row[field]);
    }
    catch(ex) { return false; }
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

function insideOut (obj, fieldId) {
    return lodash.assign({}, {'id':obj[fieldId]}, {data:lodash.toArray(lodash.omit(obj,fieldId))});
}

function toJsonFormat (data, keys, fieldId) {
    fieldId = fieldId || 'id';

    var values = data;
    if (keys) values  = lodash.table(values, cat([fieldId], keys));

    return lodash.map(values, function (row) {
        return insideOut.call(null, row, fieldId);
    });
}

lodash.mixin({
    'existy': existy,
    'truthy': truthy,
    'cat': cat,
    'construct': construct,
    'table': table,
    'extract':extract,
    'rename': rename,
    'as': as,
    'query':query,
    'valuesOf': valuesOf,
    'containAll': containAll,
    'differenceBy': differenceBy,
    'findIndexBy': findIndexBy,
    'concatBy': concatBy,
    'keyss':keyss,
    'toJsonFormat': toJsonFormat
});

if ( typeof module === "object" && typeof module.exports === "object" ) {
    // For environments that do not inherently posses a window with a document
    // (such as Node.js), expose a jQuery-making factory as module.exports
    module.exports = lodash;
}