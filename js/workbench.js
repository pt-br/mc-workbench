var body = document.body;
var workbench = document.createElement('div');

setTimeout(function() {
  resizeMoovCheckout();
}, 2000);

function resizeMoovCheckout() {
  var mcIframe = document.querySelector('#mc-created-iframe');
  var originalBody = document.querySelector('#mc-original-body');

  mcIframe.style.width = '33.3%';
  mcIframe.style.left = '33.3%';
  originalBody.style.width = '33.3%';

  //parseHtml(originalBody);
  injectWorkbench(originalBody);
}

function parseHtml(originalBody) {
  var originalHtml = originalBody;

}

function injectWorkbench(originalBody) {

  var originalHtml = originalBody.innerHTML;

  workbench.id = 'mc-workbench-container';
  workbench.setAttribute('style', 'position: fixed;width: 33.3%;z-index: 999999;height: inherit;top: 45px;right: 0;');
  //workbench.innerHTML = '<link rel="stylesheet" type="text/css" href="https://localhost:8443/css/workbench.css"><div class="mc-workbench-body">Oiiiiiiii this is a test</div>';
  workbench.innerHTML = originalHtml;

  body.appendChild(workbench);
}
