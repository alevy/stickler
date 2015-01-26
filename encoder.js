var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

process.argv.shift();
process.argv.shift();
var signOrHash = process.argv.shift();
var outputDir = process.argv.shift();

var mode; 
if (signOrHash == "sign") {
  signMode = true;
} else if (signOrHash == "hash") {
  signMode = false;
} else {
  return new Error("First arguments should be [sign|hash]");
}

fs.readFile('keys/privkey.pem', function(err, privkey) {
  if (err) {
    console.log(err);
    return;
  }

  function sign(payload) {
    var sign = crypto.createSign("RSA-SHA256");
    sign.update(payload);
    return sign.sign(privkey);
  }

  function hash(payload) {
    var sha256 = crypto.createHash('sha256');
    sha256.update(payload);
    return sha256.digest();
  }

  function go() {
    var f = process.argv.shift();
    if (f) {
      fs.readFile(f, function(err, payload) {
        if (err) {
          console.log(err);
          return
        }

        /*
        var ext = path.extname(f);
        // Guess if it's an image
        if (ext == 'jpg' || ext == 'png' || ext == 'gif') {
          payload = payload.toString('base64');
        }
        */

        var verif = signMode ? sign(payload) : hash(payload);
        // The expiration field is bogus unless signed... 
        // don't worry about it for now.
        // var expiration = Date.now() + 14 * 24 * 3600000;
        var result = new Buffer(payload.length + verif.length + 2);
        result[0] = verif.length & 0xff;
        result[1] = verif.length >> 8;
        verif.copy(result, 2);
        payload.copy(result, verif.length + 2);
        fs.writeFile(path.join(outputDir, path.basename(f)), result, go);
      });
    }
  }
  go();
});

