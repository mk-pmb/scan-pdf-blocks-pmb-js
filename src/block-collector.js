/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var CF, PT, goaks = require('getoraddkey-simple');

function identity(x) { return x; }

function blockIndexAdd(catalog, prop, val) {
  catalog = this[catalog];
  if (!catalog) { return; }
  goaks(catalog, prop, '[]').push(val);
}


CF = function BlockCollector() {
  if (!(this instanceof CF)) { return new CF(); }
  var self = this, blks = [];
  self.blocks = blks;
  self.blockIndexBy = { add: blockIndexAdd };
};
PT = CF.prototype;


PT.prevBlk = PT.curBlk = false;


PT.beginBlock = function (bType) {
  var blks = this.blocks, bIdx = blks.length, blk = { type: bType };
  this.blockIndexBy.add('type', bType, bIdx);
  blks[bIdx] = blk;
  this.prevBlk = this.curBlk;
  this.curBlk = blk;
  (this.onBeginBlock || identity).call(this, blk, bIdx);
  return blk;
};


PT.endBlock = function () {
  var blk = this.curBlk;
  (this.onEndBlock || identity).call(this, blk);
  this.curBlk = false;
  return blk;
};


PT.readBlobLinesUntil = function (blk, peek, endMark, data) {
  if (typeof blk === 'string') { blk = this.beginBlock(blk); }
  data = (data || '') + peek.eat();
  peek.eatUntilMarkOrEnd(endMark, function (eaten) { data += eaten; });
  (this.onDecorateBlobBlock || identity)(blk, data, endMark);
  blk.getData = function () { return data; };
  return this.endBlock();
};


PT.getBlocksByProp = function (prop, pVal, skip, howMany) {
  var ids = (this.blockIndexBy[prop] || false)[pVal], blks = this.blocks;
  if (!ids) { return false; }
  skip = (+skip || 0);
  ids = ids.slice(skip);

  function blkByIdx(idx) {
    if (idx !== +idx) { return false; }
    return (blks[idx] || false);
  }

  if (howMany === undefined) { howMany = null; }
  if (howMany === null) {
    // report just one item, w/o array wrapping
    return blkByIdx(ids[0]);
  }

  if ((howMany === +howMany) && (howMany > 0)) { ids = ids.slice(0, howMany); }
  return ids.map(blkByIdx);
};






























module.exports = CF;
