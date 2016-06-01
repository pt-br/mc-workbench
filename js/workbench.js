var body = document.body;
workbench = document.createElement('div');
widgets = [];
var widgetSelectors = false;
var widgetSettings = false;

setTimeout(function() {
  initialize();
}, 2000);

function initialize() {
  mcIframe = document.querySelector('#mc-created-iframe');
  originalBody = document.querySelector('#mc-original-body');

  mcIframe.className = 'active';
  mcIframe.style.width = '33.3%';
  mcIframe.style.left = '33.3%';
  originalBody.style.width = '33.3%';

  addBodyListener();
  injectWorkbench();
}

function addBodyListener() {
  originalBody.addEventListener('mousedown', function(e) {
      var cssPath = getPath(e.target);
      processSelector(cssPath);
  });
}

function toggleMCIframe() {
  if( mcIframe.className.match(/^active/) ) {
    mcIframe.className = 'inactive';
    mcIframe.style.display = 'none';
    originalBody.style.width = '50%';
    workbench.style.width = '50%';
  } else {
    mcIframe.className = 'active';
    mcIframe.style.display = 'block';
    originalBody.style.width = '33.3%';
    workbench.style.width = '33.3%';
  }
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

function getUx() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://localhost:8443/ux/workbench.html', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var response = xhr.responseText.trim();
      workbench.innerHTML = response;
    }
  }
  xhr.send();
}

function getWidgetNames() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://localhost:8443/widgets', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var response = xhr.responseText.trim();
      var regex = /name\"\>(.*?)\<\/span\>/g;
      var response = response.match(regex);

      var responseIndex = response.length;

      for( var i = 0; i < responseIndex; i++ ) {
        var match = regex.exec(response);
        widgets.push(match[1]);
      }
    }
  }
  xhr.send();
}

function getWidgetTemplate(widgetFile) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://localhost:8443/widgets/' + widgetFile, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var widgetResult = JSON.stringify(xhr.responseText.trim());
      processWidgetFields(widgetResult);
    }
  }
  xhr.send();
}

function processWidgetFields(widgetResult) {
  var widgetTemplate = widgetResult;

  /* Process selectors (if widget has) */
  if( widgetResult.match(/selectors/) ) {
    widgetSelectors = widgetTemplate.replace(/settings.*/g, '');
    widgetSelectors = widgetSelectors.replace(/selectors:\s\{\\n\s*/g, '');
    widgetSelectors = widgetSelectors.replace(/\\n\s*/g, '');
    widgetSelectors = widgetSelectors.match(/(\w*?)\:/g, '');

    [].forEach.call(widgetSelectors, function(currentSelector, currentIndex) {
      currentSelector = currentSelector.replace(/\:/, '');
      widgetSelectors[currentIndex] = currentSelector;
    });
    console.log('Widget Selectors:');
    console.log(widgetSelectors);
  } else {
    widgetSelectors = false;
    console.log("Widget doesn't have selectors");
  }

  /* Process settings (if widget has) */
  if( widgetResult.match(/settings/) ) {
    widgetSettings = widgetTemplate.replace(/selectors:\s\{\\n\s*.*settings:\s\{\\n\s*/g, '');
    widgetSettings = widgetSettings.replace(/\\n\s*/g, '');
    widgetSettings = widgetSettings.match(/(\w*?)\:/g, '');

    [].forEach.call(widgetSettings, function(currentSetting, currentIndex) {
      currentSetting = currentSetting.replace(/\:/, '');
      widgetSettings[currentIndex] = currentSetting;
    });
    console.log('Widget Settings:');
    console.log(widgetSettings);
  } else {
    widgetSettings = false;
    console.log("Widget doesn't have settings");
  }

  buildWidgetInterface();
}

function buildWidgetInterface() {
  console.log("Gonna build something");
  /* Build selectors */
  // Verify if widget has selectors
  if( widgetSelectors ) {
    console.log("Has selectors");
    var selectorSection = document.querySelector('#mc-workbench-selector-section');
    var selectorContainer = document.querySelector('#mc-workbench-selector-container');
    var selectorIndex = widgetSelectors.length;

    selectorSection.className = 'active';

    for( var i = 0; i < selectorIndex; i++ ) {
      var selectorLabel = document.createElement('label');
      var selectorElement = document.createElement('input');
      var selectorButton = document.createElement('div');

      selectorLabel.className = 'widget-label';
      selectorLabel.for = widgetSelectors[i];
      selectorLabel.innerHTML = widgetSelectors[i];

      selectorElement.type = "text";
      selectorElement.className = 'widget-input';
      selectorElement.name = widgetSelectors[i];
      selectorElement.id = widgetSelectors[i];

      selectorButton.className = 'widget-button';
      selectorButton.innerHTML = 'Grab';

      selectorContainer.appendChild(selectorLabel);
      selectorContainer.appendChild(selectorElement);
      selectorContainer.appendChild(selectorButton);
    }
  }
}

function startWidgetEditor() {
  var widgetElement = event.target;
  var widgetName = event.target.innerHTML;
  var widgetFile = event.target.getAttribute('data-file');
  var widgetEditorTitle = document.querySelector('#mc-workbench-widget-name');
  var widgetSection = document.querySelector('#mc-workbench-widget-section');
  var widgeEditor = document.querySelector('#mc-workbench-widget-editor');

  widgetSection.className = 'inactive';
  destroyWidgetList();
  widgeEditor.className = 'active';

  widgetEditorTitle.innerHTML = widgetName;

  getWidgetTemplate(widgetFile);


}

function buildWidgetList() {
  var widgetList = document.querySelector('#mc-workbench-widget-list');
  var widgetIndex = widgets.length;
  for( var i = 0; i < widgetIndex; i++ ) {
    var widgetFile = widgets[i];
    var widgetName = widgets[i].replace(/(\.txt|\.json)/, '');
    var widgetElement = document.createElement('li');
    widgetElement.className = 'widget';
    widgetElement.setAttribute('data-file', widgetFile);
    widgetElement.setAttribute('onclick', 'startWidgetEditor()');
    widgetElement.innerHTML = widgetName;
    widgetList.appendChild(widgetElement);
  }
}

function destroyWidgetList() {
  var widgetList = document.querySelector('#mc-workbench-widget-list');
  widgetList.innerHTML = '';
}

function startMapping() {
  var widgetSection = document.querySelector('#mc-workbench-widget-section');
  if( widgetSection.className.match(/^active/) ) {
    widgetSection.className = 'inactive';
    destroyWidgetList();
  } else {
    widgetSection.className = 'active';
    buildWidgetList();
  }
}

function injectWorkbench() {

  // Get widget names
  getWidgetNames();

  // Get UX
  getUx();
  workbench.id = 'mc-workbench-container';
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
