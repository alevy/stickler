
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
    img.src = "data:image/" + fmt + ";base64," + arrayBufferToBase64(data);
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

TPM.verifyHash = function(payloadArr, verif, thenFunc, errFunc) {
  var verifArr = TPM.stringToArray(atob(verif));
  var hashAlgo = { name: "SHA-256" };
  var p = window.crypto.subtle.digest(hashAlgo, payloadArr);
  p.then(function(digest) {
    var digest = new Uint8Array(digest);
    if (digest.length != verifArr.length) {
      thenFunc(false);
    } else {
      for (var i = 0; i < digest.length; i++) {
        if (digest[i] != verifArr[i]) {
          thenFunc(false);
          return;
        }
      }
      thenFunc(true);
    }
  });
  p.catch(errFunc);
};

TPM.fetchHash = function(url, cb, err, hash) {
  TPM.fetch(url, cb, err, function(payload, _, thenFunc, errFunc) {
    TPM.verifyHash(payload, hash, thenFunc, errFunc);
  });
};

TPM.fetchLegacy = function(url, cb, err, hash) {
  var req = new XMLHttpRequest();
  cb = cb || TPM.evalJS;
  req.onload = function() {
    var obj = this.responseText;
    var p = TPM.verifyHash(TPM.stringToArray(obj), hash, 
      function(verified) {
        if (verified) {
          cb(true, obj);
        } else {
          cb(false, null);
        }
      }, err);
  };
  req.open('get', url);
  req.send();
}

TPM.fetchCSSLegacy = function(url, cb, err, hash) {
  TPM.fetchLegacy(url, function(success, payload) {
    if (success) {
      var s = document.createElement("style");
      s.innerHTML = payload;
      window.document.head.appendChild(s);
    } 

    if (cb) {
      cb(success, payload);
    }
  }, err, hash);
}

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
    if (row.type == 'js' || row.type == 'css') {
      if (doSig) {
        TPM.fetchSig(row.url, row.cb);
      } else {
        TPM.fetchHash(row.url, row.cb, alert, row.hash)
      }
    } else if (row.type == 'js-foreign') {
      // JS served from offsite
      TPM.fetchLegacy(row.url, row.cb, alert, row.hash)
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
  var manifest = [
    { 
      'url': '/body.html', 
      'type': 'js',   
      'cb':
        function(success, payload) { 
            if (success) { 
              document.body.innerHTML +=
                String.fromCharCode.apply(null, payload);
            }
        }
    },
    { 
      'url': '/style.css', 
      'type': 'css',   
      'cb':
        function(success, payload) { 
            if (success) { 
              var s = document.createElement("style");
              var data = String.fromCharCode.apply(null, payload)
              s.innerHTML = data;
              window.document.head.appendChild(s);
            }
        }
    },
    { 
      'url': '/micro_ops_sign_hash.png',
      'type': 'png',   
      'cb':
        function(success, img) { 
            if (success) {
              document.getElementById("eval-figure").appendChild(img);
            }
        }
    },
    { 
      'url': '/bootstrap-1.png',
      'type': 'png',   
      'cb':
        function(success, img) { 
            if (success) {
              document.getElementById("fig-bootstrap-1").appendChild(img);
            }
        }
    },
    { 
      'url': '/bootstrap-2.png',
      'type': 'png',   
      'cb':
        function(success, img) { 
            if (success) {
              document.getElementById("fig-bootstrap-2").appendChild(img);
            }
        }
    },
    { 
      'url': '/bootstrap-3.png',
      'type': 'png',   
      'cb':
        function(success, img) { 
            if (success) {
              document.getElementById("fig-bootstrap-3").appendChild(img);
            }
        }
    },
    { 
      'url': '/bootstrap-4.png',
      'type': 'png',   
      'cb':
        function(success, img) { 
            if (success) {
              document.getElementById("fig-bootstrap-4").appendChild(img);
            }
        }
    },
    { 
      'url': '/bootstrap-5.png',
      'type': 'png',   
      'cb':
        function(success, img) { 
            if (success) {
              document.getElementById("fig-bootstrap-5").appendChild(img);
            }
        }
    },
    { 
      'url': '/bootstrap-6.png',
      'type': 'png',   
      'cb':
        function(success, img) { 
            if (success) {
              document.getElementById("fig-bootstrap-6").appendChild(img);
            }
        }
    },
/*
    { 
      'url': '/chrome-logo.png', 
      'type': 'png',   
      'cb':
        function(success, img) { 
            if (success) {
              img.width = "128";
              document.getElementById("chrome-logo").appendChild(img);
            }
        }
    },
    { 
      'url': '/firefox-logo.png', 
      'type': 'png',   
      'cb':
        function(success, img) { 
            if (success) {
              img.width = "128";
              document.getElementById("firefox-logo").appendChild(img);
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
    */
    {
      /* Bootstrap relies on jQuery, so load jQuery first. */
      'url': '/jquery-2.1.3.min.js',
      'type': 'js',
      'hash': 'ivk71nXhz9nsyFDoYoGf2sbjrR9ddh+XDkCcfZxjvcM=', 
      'cb': function(success, payload) {
        TPM.evalJSArr(success, payload);

        /* Fetch Bootstrap CSS */
        TPM.fetchCSSLegacy(
          'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css', 
          undefined,
          alert, 
          '0xvvRQ7me2T5twv99B/k4AxlQ4cFzB+7SOpgJtOl1pc=');

        /* Fetch Bootstrap JS */
        TPM.fetchLegacy(
          'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js',
          undefined, 
          alert, 
          'yO7sg/6L9lXu7aKRRm0mh3BDbd5OPkBBaoXQXTiT6JI=');
      }
    },
  ];
  
  TPM.loadManifest(manifest);
}());

