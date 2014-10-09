var fs = require('fs');
var crypto = require('crypto');

process.argv.shift();
process.argv.shift();
var outputDir = process.argv.shift();
fs.readFile('keys/privkey.pem', function(err, privkey) {
  if (err) {
    console.log(err);
    return;
  }

  function go() {
    var f = process.argv.shift();
    if (f) {
      fs.readFile(f, function(err, payload) {
        if (err) {
          console.log(err);
          return
        }
        var sign = crypto.createSign("RSA-SHA256");

        var expiration = Date.now() + 14 * 24 * 3600000;
        sign.update(payload);
        var sig = sign.sign(privkey, 'base64');
        var result = {
          payload: new Buffer(payload).toString('base64'),
          signature: sig,
          expiration: expiration
        };
        fs.writeFile(outputDir + '/' + f, JSON.stringify(result), go);
      });
    }
  }
  go();
});

