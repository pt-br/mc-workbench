var express = require('express');
var serveIndex = require('serve-index')
var app = express();
var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');

var privateKey  = fs.readFileSync('cert/server.key', 'utf8');
var certificate = fs.readFileSync('cert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
});

/**
 *
 * Path to the moovcheckout research
 *
 * Change this path to match your moovcheckout-research repository
 */
var widgetListBasePath = '/home/lucas/Github/moovcheckout-research/';
// Output folder
var outputFolder = 'widgets/';
// Output path
var outputPath = outputFolder


// Check if snippets dir exists, if not, create it
if (!fs.existsSync(outputPath)){
  fs.mkdirSync(outputPath);
};
// Widget list path
var widgetListFile = path.join(widgetListBasePath, 'catalyst-developer-docs/site-tagging/widget-list.md');

var writeWidget = function (widgetName, widgetTemplate) {
  var widgetOutputName = widgetName.toLowerCase() + '.json';
  var widgetOutputContent = widgetTemplate;
  var widgetOutputPath = outputPath + widgetOutputName;

  fs.writeFile(widgetOutputPath, widgetOutputContent, function (err) {
    if (err) throw err;
  });
}

fs.readFile(widgetListFile, function (err, data) {
  if (err) throw err;

  if (Buffer.isBuffer(data)){
    var result = data.toString('utf8');
    var widgets = result.split(/^.+\n-+$/gm).splice(5);

    widgets.forEach(function (widget) {
      widget = widget.trim();
      widget = widget.replace(/\{Boolean\}/, '');

      var widgetTemplate = widget.match(/\{([^```]*)}/g)[0];
      var widgetName = widgetTemplate.match(/name:\s?'([^']*)?'/)[1];
      var widgetDescription = widget.match(/^([^|]+)/m)[1].trim();
      var widgetParams = widget.match(/^\|([^|]+)(\|.*?$)/gm).splice(2);

      widgetParams.forEach(function (line, index) {
        line = line.replace(/\n/m, '\n   * ')
                   .replace(/\|\s`(.*?)`\s\|(.*?)\s\|\s(.*?)(.*?)\s\|$/, '$1 {$2 } $3$4');

        if(index === 0) {
          widgetParams[index] = '@param  ' + line + '\n';
          return;
        }

        widgetParams[index] = '   * @param  ' + line + '\n';
      });

      writeWidget(widgetName, widgetTemplate);
    });
  }
});

app.use("/ux", express.static(__dirname + '/ux'));
app.use('/widgets', serveIndex('widgets', {'icons': true}));
app.use("/widgets", express.static(__dirname + '/widgets'));
app.use("/js", express.static(__dirname + '/js'));

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);
