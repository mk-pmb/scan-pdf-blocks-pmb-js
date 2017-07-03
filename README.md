
<!--#echo json="package.json" key="name" underline="=" -->
scan-pdf-blocks-pmb
===================
<!--/#echo -->

<!--#echo json="package.json" key="description" cut-tail=" (¹" -->
Parse the outer structure of some¹ PDF documents, and offer to parse some of
the deeper structures.
<!--/#echo -->

¹ Currently these flavors of PDF are supported:
* PDF v1.5 as produced by Firefox 54.0 on Ubuntu
* Maybe others as well, you'll have to try.



Usage
-----

from [test/dummy-form-blocks.js](test/dummy-form-blocks.js):

<!--#include file="test/dummy-form-blocks.js" start="  //#u" stop="  //#r"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="14" -->
```javascript
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
```
<!--/include-->

Example results of `.parsePdfBuffer` can be found in the `blocks` section of
[test/expect/dummy-form-blocks.json](test/expect/dummy-form-blocks.json).



<!--#toc stop="scan" -->



Known issues
------------

* needs more/better tests and docs




&nbsp;


License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
