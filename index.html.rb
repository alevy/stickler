require 'base64'
require 'erb'

index = <<EOF
<!DOCTYPE html>
<html lang="en">

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <script>
      "use strict";

      window.TPM = (function() {
        var publicKeyStr = Uint8Array(<%= Base64.decode64(pubkey).chars.map do |x| x.ord end %>);

        var TPM = {}
        var publicKey;

        TPM.stringToArray = function(raw) {
          var rawLength = raw.length;
          var array = new Uint8Array(new ArrayBuffer(rawLength));
           
          for(var i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
          }

          return array; 
        };

        /* From https://gist.github.com/borismus/1032746 */
        TPM.base64toArray = function(base64) {
          var raw = window.atob(base64);
          return TPM.stringToArray(raw);
        };

        TPM.verifySig = function(payloadArr, signatureArr, thenFunc, errFunc) {
          var p = window.crypto.subtle.verify(rsaAlgo, publicKey,
                      signatureArr, payloadArr);
          p.then(thenFunc);
          p.catch(errFunc);
        };

        TPM.evalJS = function(success, data) { 
            success ? eval(atob(data)) : alert("MITM!");
        };

        TPM.fetch = function(url, cb, err, verifyAs) {
          var req = new XMLHttpRequest();
          cb = cb || TPM.evalJS;
          req.onload = function() {
            var obj = JSON.parse(this.responseText);
            var payloadArr = TPM.base64toArray(obj.payload);
            var signatureArr = TPM.base64toArray(obj.verif);
            var p = verifyAs(payloadArr, signatureArr, 
              function(verified) {
                if (verified) {
                  cb(true, obj.payload);
                } else {
                  cb(false, null);
                }
              }, err);
          };
          req.open('get', url);
          req.send();
        }

        TPM.fetchSig = function(url, cb, err) {
          TPM.fetch(url, cb, err, TPM.verifySig);
        }

        var rsaAlgo = { name: "RSASSA-PKCS1-v1_5", hash: {name: "SHA-256"} };

        TPM.init = function(cb) {
          var promise = window.crypto.subtle.importKey("spki",
                          publicKeyStr, rsaAlgo, true, ["verify"]);

          promise.catch(function(err) { console.log(err)});
          promise.then(function(pubk) {
            publicKey = pubk;
            cb();
          });
        }
        return TPM;

      }());

      TPM.init(function() {
        TPM.fetchSig('manifest.js', null, alert);
      });

    </script>
  </head>
  <body>
  </body>
</html>
EOF

pubkey = File.read("keys/publickey.der").gsub(/[\r\n]/, "")
ERB.new(index).run
