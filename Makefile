
all: publickey.der

site/index.html: index.html
	cp index.html site/index.html

assets:
	node encoder.js site assets/*.*

privkey.pem:
	openssl genpkey -algorithm rsa -pkeyopt rsa_keygen_bits:2048 > privkey.pem

publickey.der: privkey.pem
	openssl pkey -in privkey.pem -pubout -outform der | base64 > publickey.der

