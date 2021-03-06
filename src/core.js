import CurringProxy from './facade/CurringProxy.js'
import { ArgumentSP, placeholder } from './facade/ArgumentSP.js'

const facade = function (func) {
    return new CurringProxy(func, func.length, new ArgumentSP([])).makeFunction();
};

const flip = function (func) {
    return function (a, b) {
        return func(b, a);
    };
};

const pipe = function (funcs) {
    return funcs.reduce((g, f) => arg => f(g(arg)));
};

//obj.func(...arg) to func(...arg)(obj)
const forcall = function (func) {
    const length = func.length;
    const call = function (...args) {
        return func.call(args[length], ...args.slice(0, length));
    };
    return new CurringProxy(call, length + 1, new ArgumentSP([])).makeFunction();
};

export default Object.assign(facade, {
    flip: facade(flip),
    pipe: facade(pipe),
    _: placeholder,
    forcall: facade(forcall)
});