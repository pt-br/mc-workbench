var body = document.body;
workbench = document.createElement('div');

setTimeout(function() {
  initialize();
}, 2000);

function initialize() {
  var mcIframe = document.querySelector('#mc-created-iframe');
  originalBody = document.querySelector('#mc-original-body');

  mcIframe.style.width = '33.3%';
  mcIframe.style.left = '33.3%';
  originalBody.style.width = '33.3%';

  addBodyListener();
  injectWorkbench();
  //disableActions();
}

function addBodyListener() {
  originalBody.addEventListener('mousedown', function(e) {
      e.preventDefault();
      var cssPath = getPath(e.target);
      processSelector(cssPath);
  });
}

function toggleMenu() {
  var menu = workbench.querySelector('#mc-workbench-menu');
  if( menu.className.match(/^active/) ) {
    menu.className = 'inactive';
  } else {
    menu.className = 'active';
  }
}

function disableActions() {
  var element = originalBody.querySelectorAll('a, select, input, button');
  [].forEach.call(element, function(currentElement) {
    $(currentElement).unbind();
    switch(currentElement.tagName.toLowerCase()) {
      case 'a':
        var href = currentElement.href;
        currentElement.setAttribute('data-href', href);
        currentElement.setAttribute('href', '');
        currentElement.setAttribute('onclick', 'return false');
      break;
      case 'select':
      // If it needs some extra implementation
      break;
      case 'input':
      // If it needs some extra implementation
      break;
      case 'button':
      // If it needs some extra implementation
      break;
    }
  });
}

function injectWorkbench() {
  workbench.id = 'mc-workbench-container';
  workbench.innerHTML = '<link rel="stylesheet" type="text/css" href="https://localhost:8443/css/workbench.css"> <div id="mc-workbench-body"> <div id="mc-workbench-title">MoovCheckout Workbench <span id="mc-workbench-menu-toggle" onclick="toggleMenu()"> Hide/Show menu</span> </div> <ul id="mc-workbench-menu" class="active"> <li onclick="location.reload()"> Reload <span class="menuTip">Reloads the page</span> </li> <li onclick="disableActions()">Disable Actions <span class="menuTip">Disable anchors, buttons and inputs</span> </li> <li onclick="">Map Widget <span class="menuTip">Map a new widget</span> </li> <li onclick="">Export Widget <span class="menuTip">Exports current widget</span> </li> </ul> </div> ';
  body.appendChild(workbench);
}

function processSelector(cssPath) {
  // if match #mc-workbench-container, cancel the process
  if ( cssPath.match(/mc-workbench-container/) ) {
    return;
  }

  // Lowercase all HTML Tags
  cssPath = cssPath.replace(/(\s\w+)/g, replacer);

  function replacer(match, tag) {
	   return tag.toLowerCase();
  }

  // Verify if we have an ID to use
  var idSelectorGroup = cssPath.split('#');
  if( idSelectorGroup.length > 1 ) {
    var idLastIndex = idSelectorGroup.length - 1;
    var idSelector = '#' + idSelectorGroup[idLastIndex];
  }

  console.log('Your selector is: ' + idSelector);
}

function previousElementSibling (element) {
  if (element.previousElementSibling !== 'undefined') {
    return element.previousElementSibling;
  } else {
    // Loop through ignoring anything not an element
    while (element = element.previousSibling) {
      if (element.nodeType === 1) {
        return element;
      }
    }
  }
}

function getPath (element) {
  // False on non-elements
  if (!(element instanceof HTMLElement)) { return false; }
  var path = [];
  while (element.nodeType === Node.ELEMENT_NODE) {
    var selector = element.nodeName;
    if (element.id) { selector += ('#' + element.id); }
    else {
      // Walk backwards until there is no previous sibling
      var sibling = element;
      // Will hold nodeName to join for adjacent selection
      var siblingSelectors = [];
      while (sibling !== null && sibling.nodeType === Node.ELEMENT_NODE) {
        siblingSelectors.unshift(sibling.nodeName);
        sibling = previousElementSibling(sibling);
      }
      // :first-child does not apply to HTML
      if (siblingSelectors[0] !== 'HTML') {
        siblingSelectors[0] = siblingSelectors[0] + ':first-child';
      }
      selector = siblingSelectors.join(' + ');
    }
    path.unshift(selector);
    element = element.parentNode;
  }
  return path.join(' > ');
}
