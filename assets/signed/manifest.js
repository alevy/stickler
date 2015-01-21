
/* From http://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string */
function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

TPM.onImageLoaded = function(success, fmt, data, cb) {
  if (success) {
    var img = document.createElement("img");
    img.src = "data:image/" + fmt + ";base64," + data;
    cb(success, img);
  } else {
    document.body.innerHTML = '<h1>MITM!!!</h1>';
  }
};  

TPM.fetchSigImage = function(url, fmt, cb) {
  TPM.fetchSig(url, function(success, data) { 
    TPM.onImageLoaded(success, fmt, data, cb); 
  }, alert);
};

TPM.fetchHashImage = function(url, fmt, cb, hash) {
  TPM.fetchHash(url, function(success, data) {
    TPM.onImageLoaded(success, fmt, data, cb);
  }, alert, hash);
};

TPM.verifyHash = function(payloadArr, verifArr, thenFunc, errFunc) {
  var hashAlgo = { name: "SHA-256" };
  var p = window.crypto.subtle.digest(hashAlgo, payloadArr);
  p.then(function(digest) {
      var hashIs = arrayBufferToBase64(digest);
      thenFunc(hashIs == verifArr);
    });
  p.catch(errFunc);
};

TPM.fetchHash = function(url, cb, err, hash) {
  TPM.fetch(url, cb, err, function(payload, _, thenFunc, errFunc) {
    TPM.verifyHash(payload, hash, thenFunc, errFunc);
  });
};

/******
 * A manifest should be a list of objects of the form:
 *  {
 *    'url':   <Object URL>,
 *    'type':  'js' or type 'jpg', 'png', etc...
 *    'hash':  <Base64 Encoded hash of the resource> OR <Nothing (if obj is signed)>
 *    'cb':    <Callback function(success, data)>
 *  }
 */
TPM.loadManifest = function(manifest) {
  for (var i=0; i<manifest.length; i++) {
    var row = manifest[i];
    var doSig = (row.hash == undefined);
    if (row.type == 'js') {
      if (doSig) {
        TPM.fetchSig(row.url, row.cb);
      } else {
        TPM.fetchHash(row.url, row.cb, alert, row.hash)
      }
    } else {
      if (doSig) {
        TPM.fetchSigImage(row.url, row.type, row.cb);
      } else {
        TPM.fetchHashImage(row.url, row.type, row.cb, row.hash);
      }
    }
  }
};

(function() {
  document.body.innerHTML = "Hello world!";
  var manifest = [
    { 
      'url': '/profile.jpg', 
      'type': 'jpg',   
      'cb':
        function(success, img) { 
            if (success) document.body.appendChild(img)
        }
    },
    { 
      'url': '/bigphoto.jpg', 
      'type': 'jpg',   
      'hash': '+QTQzn1hjhKs4pP/PHcNTcAbX4h3dDlJD5shSQQCG6o=',
      'cb':
        function(success, img) {
            if (success) {
              img.style.height = '200px';
              document.body.appendChild(img);
            }
        }
    },
    { 
      'url': '/bigphoto.jpg', 
      'type': 'jpg',   
      'hash': '+QTQzn1hjhKs4pP/PHcNTcAbX4h3dDlJD5shSQQCG6o=',
      'cb':
        function(success, img) {
            if (success) {
              img.style.height = '200px';
              document.body.appendChild(img);
            }
        }
    },
    { 
      'url': '/bigphoto.jpg', 
      'type': 'jpg',   
      'hash': '+QTQzn1hjhKs4pP/PHcNTcAbX4h3dDlJD5shSQQCG6o=',
      'cb':
        function(success, img) {
            if (success) {
              img.style.height = '200px';
              document.body.appendChild(img);
            }
        }
    },
    { 
      'url': '/short.js', 
      'type': 'js',   
      'hash': 'DbP25fK6mMY1WIK1tBxJS9XT6cw/e3bBL6kx2ipsrBI=',
    },
  ];
  
  TPM.loadManifest(manifest);
}());

