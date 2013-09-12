module.exports = {
    existy : existy,
    truthy : truthy,
    fail : fail,
    warn : warn,
    note : note,
    arrPush : arrPush,
    appendPath : appendPath
}

function existy(x) { return x != null }

function truthy(x) { return (x !== false) && existy(x) };

function fail(thing) {
  throw new Error(thing);
}

function warn(thing) {
  console.log(["WARNING:", thing].join(' '));
}

function note(thing) {
  console.log(["NOTE:", thing].join(' '));
}

function arrPush(arr, obj){
    arr.push(obj);
    return arr;
}

function appendPath(path, str){
  return path + '/' + str;
}