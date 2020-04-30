package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

func main() {
	localProxyUrl, _ := url.Parse("http://localhost:3000/")
	localProxy := httputil.NewSingleHostReverseProxy(localProxyUrl)
	http.Handle("/", localProxy)

	log.Println("Serving on localhost:3003")
	log.Fatal(http.ListenAndServeTLS(":3003", "server.crt", "server.key", nil))
}