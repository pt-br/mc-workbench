var body = document.body;
workbench = document.createElement('div');
widgets = [];
var widgetSelectors = false;
var widgetSettings = false;
var grabbingSelector = false;
var grabbingSimpleSelector = false;
var currentProp = false;

var initDelay = setInterval(function() {
  mcIframe = document.querySelector('#mc-created-iframe');
  originalBody = document.querySelector('#mc-original-body');

  if( originalBody.toString().length > 0 ) {
    initialize();
  }
  
}, 200);

function initialize() {

  clearInterval(initDelay);

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

  // Verify if we have a prop waiting for selector
  if ( currentProp ) {
    console.log('Your selector is: ' + idSelector);
    currentProp.value = idSelector;
    var grabTip = currentProp.nextSibling.nextSibling;
    grabTip.className = 'proptip inactive';
    currentProp = false;
  }

  // Verify if we have to provide a simple selector
  if ( grabbingSimpleSelector ) {
    console.log('Your selector is: ' + idSelector);
    var simpleSelectorInput = document.querySelector('#mc-workbench-getselector-modal-input');
    simpleSelectorInput.value = idSelector;
  }
}

function grabSelector() {
  grabbingSelector = true;
  var grabButton = event.target;
  var grabProp = grabButton.getAttribute('data-prop');
  // Reset any opened tip
  var grabTip = document.querySelector('.prop-tip.active');
  if ( grabTip ) {
    grabTip.className = 'proptip inactive';
  }
  grabTip = grabButton.nextElementSibling;
  grabTip.className = 'prop-tip active';
  currentProp = document.querySelector('#'+grabProp);
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
    currentElement.setAttribute('onclick', 'return false');

    switch(currentElement.tagName.toLowerCase()) {
      case 'a':
        var href = currentElement.href;
        currentElement.setAttribute('data-href', href);
        currentElement.setAttribute('href', '');
      break;
      case 'select':
        currentElement.innerHTML = '';
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

  /* Process selectors (if widget has selectors) */
  if( widgetResult.match(/selectors/) ) {
    widgetSelectors = widgetTemplate.replace(/settings.*/g, '');
    widgetSelectors = widgetSelectors.replace(/selectors:\s\{\\n\s*/g, '');
    widgetSelectors = widgetSelectors.replace(/\\n\s*/g, '');
    widgetSelectors = widgetSelectors.match(/(\w*?)\:/g, '');

    /* Remove first element, it's the 'name' of the widget */
    widgetSelectors.shift();

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

  /* Process settings (if widget has settings) */
  if( widgetResult.match(/settings/) ) {
    widgetSettings = widgetTemplate.replace(/selectors:\s\{\\n\s*.*settings:\s\{\\n\s*/g, '');
    widgetSettings = widgetSettings.replace(/\\n\s*/g, '');
    widgetSettings = widgetSettings.match(/(\w*?)\:/g, '');

    /* Remove first element, it's the 'name' of the widget */
    widgetSettings.shift();

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
  /* Build selectors */
  // Verify if widget has selectors
  var selectorSection = document.querySelector('#mc-workbench-selector-section');
  if( widgetSelectors ) {
    var selectorContainer = document.querySelector('#mc-workbench-selector-container');
    var selectorIndex = widgetSelectors.length;

    selectorSection.className = 'active';

    for( var i = 0; i < selectorIndex; i++ ) {
      var selectorLabel = document.createElement('label');
      var selectorElement = document.createElement('input');
      var selectorButton = document.createElement('div');
      var selectorTip = document.createElement('div');

      selectorLabel.className = 'prop-label';
      selectorLabel.for = widgetSelectors[i] + '-selector';
      selectorLabel.innerHTML = widgetSelectors[i];

      selectorElement.type = "text";
      selectorElement.className = 'prop-input';
      selectorElement.name = widgetSelectors[i];
      selectorElement.id = widgetSelectors[i] + '-selector';

      selectorButton.className = 'prop-button';
      selectorButton.setAttribute('data-prop', selectorElement.id);
      selectorButton.setAttribute('onclick', 'grabSelector()');
      selectorButton.innerHTML = 'Grab';

      selectorTip.className = 'prop-tip inactive';
      selectorTip.innerHTML = 'Now, just click on some element in the original site';

      selectorContainer.appendChild(selectorLabel);
      selectorContainer.appendChild(selectorElement);
      selectorContainer.appendChild(selectorButton);
      selectorContainer.appendChild(selectorTip);
    }
  } else {
    selectorSection.className = 'inactive';
  }

  // Verify if widget has settings
  var settingsSection = document.querySelector('#mc-workbench-settings-section');
  if( widgetSettings ) {
    var settingsContainer = document.querySelector('#mc-workbench-settings-container');
    var settingsIndex = widgetSettings.length;

    settingsSection.className = 'active';

    for( var i = 0; i < settingsIndex; i++ ) {
      var settingLabel = document.createElement('label');
      var settingElement = document.createElement('input');
      var settingButton = document.createElement('div');
      var settingTip = document.createElement('div');

      settingLabel.className = 'prop-label';
      settingLabel.for = widgetSettings[i] + '-setting';
      settingLabel.innerHTML = widgetSettings[i];

      settingElement.type = "text";
      settingElement.className = 'prop-input';
      settingElement.name = widgetSettings[i];
      settingElement.id = widgetSettings[i] + '-setting';

      settingButton.className = 'prop-button';
      settingButton.setAttribute('data-prop', settingElement.id);
      settingButton.setAttribute('onclick', 'grabSelector()');
      settingButton.innerHTML = 'Grab';

      settingTip.className = 'prop-tip inactive';
      settingTip.innerHTML = 'Now, just click on some element in the original site';

      settingsContainer.appendChild(settingLabel);
      settingsContainer.appendChild(settingElement);
      settingsContainer.appendChild(settingButton);
      settingsContainer.appendChild(settingTip);
    }
  } else {
    settingsSection.className = 'inactive';
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

function destroyWidgetEditor() {
  var widgetEditorSelector = document.querySelector('#mc-workbench-selector-container');
  var widgetEditorSettings = document.querySelector('#mc-workbench-settings-container');
  widgetEditorSelector.innerHTML = '';
  widgetEditorSettings.innerHTML = '';
}

function startMapping() {
  var widgetSection = document.querySelector('#mc-workbench-widget-section');
  var widgetEditor = document.querySelector('#mc-workbench-widget-editor');

  widgetEditor.className = 'inactive';
  destroyWidgetEditor();

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

function closeGetSelectorModal() {
  var getSelectorModal = document.querySelector('#mc-workbench-getselector-modal');
  var getSelectorModalOverlay = document.querySelector('#mc-workbench-getselector-modal-overlay');
  getSelectorModal.className = 'inactive';
  getSelectorModalOverlay.className = 'inactive';
  grabbingSimpleSelector = false;
}

function openGetSelectorModal() {
  var getSelectorModal = document.querySelector('#mc-workbench-getselector-modal');
  var getSelectorModalOverlay = document.querySelector('#mc-workbench-getselector-modal-overlay');
  getSelectorModal.className = 'active';
  getSelectorModalOverlay.className = 'active';
  grabbingSimpleSelector = true;
}

function closeExportModal() {
  var exportModal = document.querySelector('#mc-workbench-export-modal');
  var exportModalOverlay = document.querySelector('#mc-workbench-export-modal-overlay');
  exportModal.className = 'inactive';
  exportModalOverlay.className = 'inactive';
}

function openExportModal(schema) {
  var exportModal = document.querySelector('#mc-workbench-export-modal');
  var exportModalOverlay = document.querySelector('#mc-workbench-export-modal-overlay');
  var exportBox = document.querySelector('#mc-workbench-export-modal-box');
  exportModal.className = 'active';
  exportModalOverlay.className = 'active';
  exportBox.value = schema;

  exportBox.style.height = 'auto';
  var newHeight = exportBox.scrollHeight + 6;
  exportBox.style.height = newHeight+'px';
}

function exportSchema() {
  /* Verify if we have any active widget to export */
  if ( widgetSelectors || widgetSettings ) {
    var selectorInputs = document.querySelectorAll('#mc-workbench-selector-container > .prop-input');
    var settingInputs = document.querySelectorAll('#mc-workbench-settings-container > .prop-input');
    var selectorProps = [];
    var settingProps = [];

    [].forEach.call(selectorInputs, function(currentInput) {
      /* Check if it's not empty */
      if ( currentInput.value != '' ) {
        selectorProps.push(currentInput.id);
      }
    });

    [].forEach.call(settingInputs, function(currentInput) {
      /* Check if it's not empty */
      if ( currentInput.value != '' ) {
        settingProps.push(currentInput.id);
      }
    });

    var schema = buildSchema(selectorProps, settingProps);
    openExportModal(schema);

  } else {
    alert('You don\'t have any active widget to export');
  }
}

function buildSchema(selectorProps, settingProps) {
  var widgetName = document.querySelector('#mc-workbench-widget-name').innerHTML;
  var schemaString = '{' +
                     '\n\t\tname: \'' + widgetName + '\',';

  /* If widget has selectors */
  if(selectorProps.length > 0) {
    var selectorsString = '\n\t\tselectors: {';

    schemaString = schemaString.concat(selectorsString);

    [].forEach.call(selectorProps, function(currentProp) {
      var currentPropElement = document.querySelector('#mc-workbench-selector-container > #' + currentProp);
      var propName = currentPropElement.name;
      var propValue = currentPropElement.value;

      var propString = '\n\t\t\t' + propName + ': ' + '\'' + propValue + '\',';

      schemaString = schemaString.concat(propString);
    });

    var closeSelectorsString = '\n\t\t},';
    schemaString = schemaString.concat(closeSelectorsString);
  }

  /* If widget has settings */
  if(settingProps.length > 0) {
  var settingsString = '\n\t\tsettings: {';

  schemaString = schemaString.concat(settingsString);

  [].forEach.call(settingProps, function(currentProp) {
    var currentPropElement = document.querySelector('#mc-workbench-settings-container > #' + currentProp);
    var propName = currentPropElement.name;
    var propValue = currentPropElement.value;

    var propString = '\n\t\t\t' + propName + ': ' + '\'' + propValue + '\',';

    schemaString = schemaString.concat(propString);
  });

  var closeSettingsString = '\n\t\t},';
  schemaString = schemaString.concat(closeSettingsString);
  }

  var endString = '\n\t},';

  schemaString = schemaString.concat(endString);
  return schemaString;
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
