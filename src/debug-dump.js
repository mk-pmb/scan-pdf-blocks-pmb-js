/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = {}, kisi = require('./kitchen-sink'),
  inspectAsJson = require('inspect-as-json-pmb'),
  mergeSpace2 = inspectAsJson.mergeSpace2;


EX.jsonify = function (x, opt) {
  x = inspectAsJson(x, opt);

  // compactify blocks.*.loca:
  x = x.replace(/(\n *"loca": \{)([\s -z]+)/g, function (m, a, b) {
    return a + b.replace(/\n *($|"(?!fromLine))/g, ' $1', m);
  });

  // unescape univeils unicode escapes:
  x = x.replace(/\n *"preview": "[ -\uFFFF]+"/g,
    function (m) { return m.replace(/\\(\\u)/g, '$1'); });

  // compactify number-arrays like blockIndexBy.offset:
  x = x.replace(/()(\[\n *\d+[\d,\s"…\+\(\)]+)/g, mergeSpace2);

  // compactify small simple objects (e.g. xref obj)
  x = x.replace(/(\n {2,16}\{ *)((?:\n +|[ -z]){1,75} *\})/g, mergeSpace2);

  return x;
};


EX.jsonCommaEllip = function (m, l) {
  var a = m.split(/,/), ind = ((/^\s+/.exec(a[2] || '') || false)[0] || '');
  a.startEllip = ind + '"(… +';
  a.endEllip = ' …)"';
  return EX.objEllip(a, l, ind).join(',');
};


























module.exports = EX;
