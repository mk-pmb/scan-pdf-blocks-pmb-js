/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var kisi = {}, univeil = require('univeil');

function ifFun(x, d) { return ((typeof x) === 'function' ? x : d); }
function ifNonNegNum(x, d) { return ((x === +x) && (x >= 0) ? x : d); }


kisi.makeRegexpMemoMatcher = function () {
  return function rxm(t, r) {
    if (!r) { return rxm.m[t]; }
    rxm.m = (r.exec(String(t || '')) || false);
    return rxm.m;
  };
};


kisi.makeStrEqPseudoRx = function (expect) {
  return { exec: function (s) { return (s === expect ? [s] : null); } };
};


kisi.makePreviewFunc = function (p) {
  var h, t, m, j = ' … ';
  if (p === undefined) { p = -1; }
  if (!p) { return false; }
  if (ifFun(p)) { return p; }
  if (ifNonNegNum(p, -1) !== -1) {
    h = t = p;
  } else {
    h = ifNonNegNum(p[0], 128);
    t = ifNonNegNum(p[1], Math.floor(h / 2));
  }
  m = h + t + j.length;
  p = function (s) {
    s = String(s);
    if (s.length > m) {
      s = s.replace(/ {2,}/g, ' ');
      s = s.slice(0, h) + j + s.slice(-t);
    }
    s = univeil(s, '\r\n\t');
    return s;
  };
  return p;
};





























module.exports = kisi;
