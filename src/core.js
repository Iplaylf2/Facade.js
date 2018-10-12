var { hasFlag, putFlag } = (() => {
    var flag = Symbol('curring');
    return {
        hasFlag: f => f[flag] !== undefined,
        putFlag: f => {
            f[flag] = true;
            return f;
        }
    };
})();

//optional
var _ = {};

//具有传染性
var curring = (f, length) => putFlag((...args) => {
    var optional = new Set();
    var realArgs = [];
    for (var i = 0; i !== args.length; i++) {
        if (args[i] === _) {
            optional.add(i);
        } else {
            realArgs.push(args[i]);
        }
    }
    if (optional.size !== 0) {
        if (realArgs.length === 0) {
            return f;
        }
        var nextFunc = curring((...rest) => {
            var right = [];
            var left = [];
            for (var i = 0; i !== length; i++) {
                if (i > length - optional.size - 1) {
                    right.push(rest[i]);
                }
                else {
                    left.push(rest[i]);
                }
            }
            var realArgs = [];
            for (var i = 0; i !== length; i++) {
                if (optional.has(i)) {
                    realArgs.push(right.shift());
                } else {
                    realArgs.push(left.shift());
                }
            }
            return f(...realArgs);
        }, length);
        return nextFunc(...realArgs);
    }

    if (length > args.length) {
        return curring((...rest) => f(...args.concat(rest)), length - args.length);
    }

    var firstResult = f(...args.slice(0, length));
    if (firstResult instanceof Function) {
        var nextFunc = firstResult;
        if (!hasFlag(nextFunc)) {
            nextFunc = curring(nextFunc, nextFunc.length);
        }
        var rest = args.slice(length);
        if (rest.length === 0) {
            return nextFunc;
        } else {
            return nextFunc(...rest);
        }
    } else {
        return firstResult;
    }
});

var Facade = f => curring(f, f.length);

var flip = f => (b, a) => f(a, b);

var pipe = funcs => funcs.reduce((g, f) => arg => f(g(arg)));

//obj.func(...arg) to func(...arg)(obj)
var forcall = f => curring((...args) => f.call(args[f.length], ...args.slice(0, f.length)), f.length + 1);

var argLimit = (f, count) => (...arg) => f(...arg.slice(0, count));

export default Object.assign(Facade, {
    isF: hasFlag,
    flip: Facade(flip),
    pipe: Facade(pipe),
    _,
    forcall: Facade(forcall),
    argLimit
});