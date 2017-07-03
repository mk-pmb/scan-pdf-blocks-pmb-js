/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

function unexpected(descrExpected, got) {
  throw new Error('Expected ' + descrExpected + ' but found ' +
    JSON.stringify(got));
}


function arrLast(a, n) { return a[a.length - (+n || 1)]; }


var EX = function parseXref(data) {
  var sects = [], sectId = 0, curSect = false, objsById = {}, nxObjId = null;

  function endSect() {
    if (!curSect) { return; }
    var nWant = curSect.claimedLength, nGot = curSect.obj.length;
    if (nWant !== nGot) { unexpected(nWant + ' objects in subsection', nGot); }
    sectId += 1;
  }

  data = String(data || '').split(/\n/);
  if (arrLast(data) === '') { data.pop(); }
  data.forEach(function (ln, idx) {
    if ((ln === 'xref') && (idx === 0)) { return; }
    var m = EX.sectHeadRx.exec(ln);
    if (m) {
      endSect();
      nxObjId = +m[1];
      curSect = { firstObjNum: nxObjId, claimedLength: +m[2], obj: [] };
      sectId = sects.length;
      sects[sectId] = curSect;
      return;
    }
    m = EX.objSpecRx.exec(ln);
    if (m) {
      if (!curSect) { unexpected('subsection header', ln); }
      m = { id: nxObjId, section: sectId,
        offset: +m[1], gen: +m[2], flag: m[3] };
      if (objsById[nxObjId]) {
        throw new Error('Duplicate object ID: ' + nxObjId + ', offsets: ' +
          objsById[nxObjId].offset + ', ' + m.offset);
      }
      objsById[nxObjId] = m;
      curSect.obj.push(m);
      nxObjId += 1;
      return;
    }
    unexpected('xref section header or xref object info', ln);
  });
  endSect();

  function objById(id) {
    if (id !== +id) { return false; }
    return (objsById[id] || false);
  }

  return { sections: sects, getObjById: objById };
};


EX.sectHeadRx = /^(\d+)\s+(\d+)\s*$/;
EX.objSpecRx  = /^(\d+)\s+(\d+)\s+([nf])\s*$/;






















module.exports = EX;
