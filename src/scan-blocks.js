/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX, makeBlockCollector = require('./block-collector'),
  strPeek = require('string-peeks'),
  kisi = require('./kitchen-sink'), rxm = kisi.makeRegexpMemoMatcher(),
  parseXref = require('./parse-xref');


function numIfNum(s) {
  var n = +s;
  return (String(n) === s ? n : s);
}


EX = function scanPdfBlocksInBuffer(pdfBytes, scanOpt) {
  scanOpt = (scanOpt || false);
  var bloCo = makeBlockCollector(), blks = bloCo.blocks,
    blkIdxBy = bloCo.blockIndexBy,
    previewBlkData = kisi.makePreviewFunc(scanOpt.preview),
    peek = strPeek.fromBuffer(pdfBytes, { anomalyDescrs: EX.anomalyDescrs,
      acceptAnomalies: scanOpt.acceptAnomalies }),
    pdf = { incomplete: true };

  blkIdxBy.type = (scanOpt.indexByType ? {} : null);
  blkIdxBy.offset = (scanOpt.indexByOffset ? {} : null);

  bloCo.onBeginBlock = function (blk, bIdx) {
    blk.loca = peek.rangeEndPos(peek.rangeStartPos());
    bloCo.blockIndexBy.add('offset', blk.loca.startOffset, bIdx);
  };
  bloCo.onEndBlock = function (blk) {
    var pos = peek.rangeEndPos(blk.loca), mtd;
    blk.loca = { fromByte: pos.startOffset, toByte: pos.endOffset,
      lenBytes: pos.lenChars,
      fromLine: pos.startLine, toLine: pos.endLine, lenLines: pos.lenLines };
    mtd = EX['parse_' + blk.type];
    if (mtd) { blk.parse = mtd; }
  };
  bloCo.onDecorateBlobBlock = (previewBlkData &&
    function (blk, data) { blk.preview = previewBlkData(data); });

  EX.readVersionLine(peek, bloCo, pdf);
  while (peek.notEmpty()) { EX.readTopLevelLine(peek, bloCo); }

  pdf.blocks = blks;
  pdf.blockIndexBy = blkIdxBy;
  pdf.getBlocksByProp = bloCo.getBlocksByProp;
  return pdf;
};


EX.anomalyDescrs = {
  '': '— no description available —',
  unsupVersionLine: 'unable to decode PDF version',
  unsupBlk: 'unsupported block',
};


EX.readVersionLine = function (peek, bloCo, pdf) {
  var ln = peek.peekLine();
  if (rxm(ln, /^%PDF-((\d+)\.(\d+))\n$/)) {
    pdf.version = rxm(1);
    pdf.verMajor = +rxm(2);
    pdf.verMinor = +rxm(3);
    return EX.readTopLevelLine(peek, bloCo);
  }
  peek.anomaly('unsupVersionLine', ln);
};


EX.readTopLevelLine = function (peek, bloCo) {
  var ln = peek.peekLine().replace(/\s+$/, ''), blk;
  if (ln.match(/^\s*%/)) {
    return bloCo.readBlobLinesUntil('%', peek, /\n(?!\s*%)/);
  }
  if (rxm(ln, /^(\d+)\s+(\d+)\s+obj$/)) {
    blk = bloCo.beginBlock('obj');
    //blk.num1 = numIfNum(rxm(1));
    //blk.num2 = numIfNum(rxm(2));
    return bloCo.readBlobLinesUntil(blk, peek, /\nendobj\n/);
  }
  if (ln === 'xref') {
    return bloCo.readBlobLinesUntil(ln, peek,
      /\n(?!\d+ \d+( [a-z] ?|)(\n|$))/);
  }
  if (ln === 'trailer') {
    return bloCo.readBlobLinesUntil(ln, peek,
      />>\s*\nstartxref\n\d+\n/);
  }
  return peek.anomaly('unsupBlk', ln);
};


EX.parse_xref = function (data) {
  var blk = false, xref;
  if (!data) { blk = this; }
  xref = parseXref(data || blk.getData());
  if (blk) { return Object.assign(blk, xref); }
  return xref;
};


























module.exports = EX;
