var express = require('express');
var app = express();
var fs = require('fs');
var http = require('http');
var https = require('https');

var privateKey  = fs.readFileSync('cert/server.key', 'utf8');
var certificate = fs.readFileSync('cert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

app.use("/template", express.static(__dirname + '/template'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);
