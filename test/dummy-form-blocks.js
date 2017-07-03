/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

require('usnam-pmb');

var dumpJSON = require('../src/debug-dump').jsonify, eq = require('equal-pmb'),
  exaDir = require('absdir').up(module, 2) + '/doc/example/',
  rrfs = require('read-resolved-file-sync')(require),
  knownGood = rrfs.frag('./expect/dummy-form-blocks.json');

knownGood.verify = function (x, s) { eq.lines(dumpJSON(x), knownGood(s)); };

(function readmeDemo() {
  //#u
  var fs = require('fs'), scanPdfBlk = require('scan-pdf-blocks-pmb');

  fs.readFile(exaDir + 'dummy-form.pdf', function (err, fileBytes) {
    if (err) { throw err; }
    var pdf, parseOpt = { preview: [64, 32],
      indexByType: true,
      indexByOffset: true,
      };
    pdf = scanPdfBlk.parsePdfBuffer(fileBytes, parseOpt);
    pdf.getBlocksByProp('type', 'xref', -1).parse();
    knownGood.verify(pdf, 'blocks');
  });
  //#r
}());








eq.onExitCode(0, "+OK dummy form test passed.");
