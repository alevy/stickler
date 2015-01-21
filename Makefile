ASSETS_HASHED=$(wildcard assets/hashed/*)
ASSETS_SIGNED=$(wildcard assets/signed/*)
TARGETS=$(ASSETS_SIGNED:assets/%=site/%) $(ASSETS_HASHED:assets/%=site/%)
HTTP_SERVER=node_modules/http-server/bin/http-server
NODE=node

all: assets site/index.html

site/index.html: index.html.rb keys/publickey.der
	ruby index.html.rb > site/index.html

assets: $(TARGETS)

site/signed/%: assets/signed/% keys/publickey.der
	$(NODE) encoder.js sign site $<

site/hashed/%: assets/hashed/% 
	$(NODE) encoder.js hash site $<

keys/privkey.pem:
	openssl genpkey -algorithm rsa -pkeyopt rsa_keygen_bits:2048 > keys/privkey.pem

keys/publickey.der: keys/privkey.pem
	openssl pkey -in keys/privkey.pem -pubout -outform der | base64 > keys/publickey.der

run: assets site/index.html
	 $(HTTP_SERVER) -c 1 site/

clean_site:
	rm -f site/*

clean: clean_site
	rm -f keys/privkey.pem keys/publickey.der

