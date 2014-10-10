ASSETS=$(wildcard assets/*)
TARGETS=$(ASSETS:assets/%=site/%)

all: assets site/index.html

site/index.html: index.html.rb keys/publickey.der
	ruby index.html.rb > site/index.html

assets: $(TARGETS)

site/%: assets/% keys/publickey.der
	node encoder.js site $<

keys/privkey.pem:
	openssl genpkey -algorithm rsa -pkeyopt rsa_keygen_bits:2048 > keys/privkey.pem

keys/publickey.der: keys/privkey.pem
	openssl pkey -in keys/privkey.pem -pubout -outform der | base64 > keys/publickey.der

run: assets site/index.html
	http-server site/

clean_site:
	rm -f site/*

clean: clean_site
	rm -f keys/privkey.pem keys/publickey.der

