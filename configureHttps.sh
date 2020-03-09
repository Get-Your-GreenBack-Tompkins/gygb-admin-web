#!/usr/bin/env bash
openssl genrsa -des3 -passout pass:supergreatpassword -out server.pass.key 2048
openssl rsa -passin pass:supergreatpassword -in server.pass.key -out server.key
echo "Writing RSA key"
rm server.pass.key
openssl req -new -key server.key -out server.csr
openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt