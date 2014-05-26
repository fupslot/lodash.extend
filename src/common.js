
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
    return _.map(table, function(obj) {
        return rename(obj, newNames);
    });
}

function valuesOf(obj, keys) {
    return _.map(_.pick.apply(null, construct(obj, keys)), function (o) {
        return o;
    });
}

function containAll(obj, keys) {
    return _.every(keys, function(key){
        return _.contains(obj, key);
    });
}

lodash.mixin({
    'existy': existy,
    'truthy': truthy,
    'cat': cat,
    'construct':construct,
    'table':table,
    'rename':rename,
    'as':as,
    'valuesOf':valuesOf,
    'containAll':containAll
});
