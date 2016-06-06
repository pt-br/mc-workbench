workbench = document.createElement('div');
widgets = [];
isMapping = false;
var savedExportText = '';
var body = document.body;
var widgetSelectors = false;
var widgetSettings = false;
var grabbingSelector = false;
var grabbingSimpleSelector = false;
var currentProp = false;

var initDelay = setInterval(function() {
  mcIframe = document.querySelector('#mc-created-iframe');
  originalBody = document.querySelector('#mc-original-body');

  if( originalBody ) {
    initialize();
  }

}, 200);

function initialize() {

  clearInterval(initDelay);

  mcIframe.className = 'active';
  mcIframe.style.width = '33.3%';
  mcIframe.style.left = '33.3%';
  originalBody.style.width = '33.3%';

  injectWorkbench();
  addListeners();
}

function setMappingStatus(status) {
  localStorage.setItem('mc-workbench-is-mapping', status);
}

function getMappingStatus() {
  var mappingStatus = localStorage.getItem('mc-workbench-is-mapping');
  return mappingStatus;
}

function updateMappingWidget(widgetName, widgetFile) {
  localStorage.setItem('mc-workbench-mapping-widget', widgetName);
  localStorage.setItem('mc-workbench-mapping-widget-file', widgetFile);
  localStorage.setItem('mc-workbench-mapping-props', '');
}

function updateMappingProps(propId, propValue) {
  var mappingProps = localStorage.getItem("mc-workbench-mapping-props");
  var newMappingProps = propId + '=' + propValue + ',';
  var updatedMappingProps = mappingProps + newMappingProps;

  localStorage.setItem('mc-workbench-mapping-props', updatedMappingProps);
}

function fillMappingProps() {
  var isModalChekbox = localStorage.getItem('mc-workbench-is-modal');
  var commonPropsChekbox = localStorage.getItem('mc-workbench-common-props');

  var mappingProps = localStorage.getItem("mc-workbench-mapping-props");
  var mappingPropsArray = mappingProps.split(',');
  var mappingPropsLength = mappingPropsArray.length - 1;

  /* Check checkboxes if they were checked before */
  if ( isModalChekbox == 'true' ) {
    var isModalElement = document.querySelector('#mc-workbench-selector-is-modal');
    isModalElement.checked = true;
    isModal(isModalElement);
  }

  if ( commonPropsChekbox == 'true' ) {
    var commonPropsElement = document.querySelector('#mc-workbench-selector-common-selectors');
    commonPropsElement.checked = true;
    commonProps(commonPropsElement);
  }

  for ( var i = 0; i < mappingPropsLength; i++ ) {
    var propId = mappingPropsArray[i].split('=')[0];
    var propValue = mappingPropsArray[i].split('=')[1];

    var propElement = document.querySelector('#' + propId);

    if ( propElement ) {
      propElement.value = propValue;
    }
  }
}

function resumeMappingWidget() {
  var resumeDelay = setInterval(function() {
    widgetSection = document.querySelector('#mc-workbench-widget-section');
    if( widgetSection ) {
      clearInterval(resumeDelay);
      var widgetName = localStorage.getItem('mc-workbench-mapping-widget');
      var widgetFile = localStorage.getItem('mc-workbench-mapping-widget-file');
      var widgetEditorTitle = document.querySelector('#mc-workbench-widget-name');
      var widgeEditor = document.querySelector('#mc-workbench-widget-editor');
      var initialView = document.querySelector('#mc-workbench-initial-view');

      initialView.className = 'inactive';
      widgeEditor.className = 'active';

      widgetEditorTitle.innerHTML = widgetName;
      getWidgetTemplate(widgetFile);
    }
  }, 200);
}

function addListeners() {
  originalBody.addEventListener('mousedown', function(e) {
    var selectorGenerator = new CssSelectorGenerator;
    var element = e.target;

    /* if match some workbench element, cancel the process */
    if ( element.id.match(/mc\-workbench/) || element.className.match(/mc\-workbench/) ) {
      return;
    }

    var selector = selectorGenerator.getSelector(element);
    processSelector(selector);
  });

  var searchDelay = setInterval(function() {
    var widgetSearch = document.querySelector('#mc-workbench-widget-search');
    var propSearch = document.querySelector('#mc-workbench-prop-search');

    if( widgetSearch ) {
      widgetSearch.addEventListener('keyup', function(e) {
        filterWidgets(widgetSearch);
      });
      widgetSearch.addEventListener('click', function(e) {
        widgetSearch.value = '';
        filterWidgets(widgetSearch);
      });

      propSearch.addEventListener('keyup', function(e) {
        filterProps(propSearch);
      });
      propSearch.addEventListener('click', function(e) {
        propSearch.value = '';
        filterProps(propSearch);
      });

      clearInterval(searchDelay);
    }
  }, 200);
}

function filterWidgets(widgetSearch) {
  var searchQuery = widgetSearch.value;
  var regexQuery = new RegExp(searchQuery, "ig");
  var widgetElements = document.querySelectorAll('#mc-workbench-widget-list > .widget');

  [].forEach.call(widgetElements, function(currentWidget) {
    var widgetName = currentWidget.innerHTML;

    /* If doesn't match search query */
    if( !widgetName.match(regexQuery) ) {
      /* Only add .hide to elements that doesn't have it already */
      if ( !currentWidget.className.match(/hide/) ) {
        currentWidget.className = currentWidget.className + ' hide';
      }
    } else {
      currentWidget.className = 'widget';
    }
  });
}

function filterProps(propSearch) {
  var searchQuery = propSearch.value;
  var regexQuery = new RegExp(searchQuery, "ig");
  var propLabelSelector = document.querySelectorAll('#mc-workbench-selector-container > .mc-workbench-prop-label');
  var propLabelSetting = document.querySelectorAll('#mc-workbench-settings-container > .mc-workbench-prop-label');

  /* Search for 'selector' props */
  [].forEach.call(propLabelSelector, function(currentPropLabel) {
    var propLabelName = currentPropLabel.innerHTML;
    var currentPropInput = currentPropLabel.nextElementSibling;
    var currentPropButton = currentPropInput.nextElementSibling;
    var currentPropTip = currentPropButton.nextElementSibling;

    /* Save button and tip classes, just in case they in use to get a selector */
    var currentButtonClass = currentPropButton.className;
    var currentPropTip = currentPropTip.className;

    /* If doesn't match search query */
    if( !propLabelName.match(regexQuery) ) {
      /* Only add .hide to elements that doesn't have it already */
      if ( !currentPropLabel.className.match(/hide/) ) {
        currentPropLabel.className = currentPropLabel.className + ' hide';
        currentPropInput.className = currentPropInput.className + ' hide';
        currentPropButton.className = currentPropButton.className + ' hide';
        currentPropTip.className = currentPropButton.className + ' hide';
      }
    } else {

      currentButtonClass = currentButtonClass.split(/\shide/)[0];
      currentPropTip = currentPropTip.split(/\shide/)[0];

      currentPropLabel.className = 'mc-workbench-prop-label';
      currentPropInput.className = 'mc-workbench-prop-input';
      currentPropButton.className = currentButtonClass;
      currentPropTip.className = currentPropTip;
    }
  });

  /* Search for 'settings' props */
  [].forEach.call(propLabelSetting, function(currentPropLabel) {
    var propLabelName = currentPropLabel.innerHTML;
    var currentPropInput = currentPropLabel.nextElementSibling;
    var currentPropButton = currentPropInput.nextElementSibling;
    var currentPropTip = currentPropButton.nextElementSibling;

    /* Save button and tip classes, just in case they in use to get a selector */
    var currentButtonClass = currentPropButton.className;
    var currentPropTip = currentPropTip.className;

    /* If doesn't match search query */
    if( !propLabelName.match(regexQuery) ) {
      /* Only add .hide to elements that doesn't have it already */
      if ( !currentPropLabel.className.match(/hide/) ) {
        currentPropLabel.className = currentPropLabel.className + ' hide';
        currentPropInput.className = currentPropInput.className + ' hide';
        currentPropButton.className = currentPropButton.className + ' hide';
        currentPropTip.className = currentPropButton.className + ' hide';
      }
    } else {
      currentPropLabel.className = 'mc-workbench-prop-label';
      currentPropInput.className = 'mc-workbench-prop-input';
      currentPropButton.className = currentButtonClass;
      currentPropTip.className = currentPropTip;
    }
  });
}

function processSelector(selector) {
  // Verify if we have a prop waiting for selector
  if ( currentProp ) {
    currentProp.value = selector;

    var grabTip = currentProp.nextSibling.nextSibling;
    grabTip.className = grabTip.className + ' inactive';

    var grabButtonSelected = document.querySelector('.mc-workbench-prop-button.selected');
    grabButtonSelected.className = 'mc-workbench-prop-button';

    updateMappingProps(currentProp.id, currentProp.value);

    currentProp = false;

  }

  // Verify if we have to provide a simple selector
  if ( grabbingSimpleSelector ) {
    var statusMessage = document.querySelector('#mc-workbench-getselector-modal-status');
    var simpleSelectorInput = document.querySelector('#mc-workbench-getselector-modal-input');

    statusMessage.innerHTML = '';
    statusMessage.className = '';

    simpleSelectorInput.value = selector;
  }
}

function copyWidgetToClipboard() {
  var widgetOutput = document.querySelector('#mc-workbench-export-modal-box');
  var statusMessage = document.querySelector('#mc-workbench-export-modal-status');

  widgetOutput.focus();
  widgetOutput.select();

  try {
    var successful = document.execCommand('copy');
    statusMessage.innerHTML = 'Widget copied to clipboard.';
  } catch (err) {
    statusMessage.className = 'error';
    statusMessage.innerHTML = 'Error copying to clipboard, please copy it manually.';
  }

  window.getSelection().removeAllRanges();
}

function copySelectorToClipboard() {
  var selectorOutput = document.querySelector('#mc-workbench-getselector-modal-input');
  var statusMessage = document.querySelector('#mc-workbench-getselector-modal-status');

  selectorOutput.focus();
  selectorOutput.select();

  if( selectorOutput.value == '' ) {
    statusMessage.className = 'error';
    statusMessage.innerHTML = 'Empty selector';
    return;
  }

  try {
    var successful = document.execCommand('copy');
    statusMessage.className = '';
    statusMessage.innerHTML = 'Selector copied to clipboard.';
  } catch (err) {
    statusMessage.className = 'error';
    statusMessage.innerHTML = 'Error copying to clipboard, please copy it manually.';
  }

  window.getSelection().removeAllRanges();
}

function exportOnlyFields(checkbox) {
  var widgetName = document.querySelector('#mc-workbench-widget-name').innerHTML;
  var exportBox = document.querySelector('#mc-workbench-export-modal-box');
  var exportText = exportBox.value;
  if ( checkbox.checked ) {
    savedExportText = exportText;
    exportText = exportText.replace('\{\n\t\tname: \'' + widgetName + '\',', '');
    exportText = exportText.replace('\n\t\tselectors: {', '');
    exportText = exportText.replace('\n\t\t},\n\t\tsettings: {', '');
    exportText = exportText.replace('\n\t\t},\n\t},', '');
    exportText = exportText.replace(/^\n\t\t\t/, '');
    exportBox.value = exportText;
  } else {
    exportBox.value = savedExportText;
  }
}

function isModal(checkbox) {
  var modalSelectors = ['modalCloseButton', 'modalSubtitle', 'modalTitle'];
  if ( checkbox.checked ) {
    insertExtraSelectors(modalSelectors, 'modal');
    localStorage.setItem('mc-workbench-is-modal', 'true');
  } else {
    removeExtraSelectors(modalSelectors);
    localStorage.setItem('mc-workbench-is-modal', 'false');
  }
}

function commonProps(checkbox) {
  var commonSelectors = ['className', 'hideIfExists', 'expectFromAutoClick', 'autoClick'];
  if ( checkbox.checked ) {
    insertExtraSelectors(commonSelectors, 'common');
    localStorage.setItem('mc-workbench-common-props', 'true');
  } else {
    removeExtraSelectors(commonSelectors);
    localStorage.setItem('mc-workbench-common-props', 'false');
  }
}

function showOnlyError(checkbox) {
  var propLabelSelector = document.querySelectorAll('#mc-workbench-selector-container > .mc-workbench-prop-label');
  var propLabelSetting = document.querySelectorAll('#mc-workbench-settings-container > .mc-workbench-prop-label');

  if ( checkbox.checked ) {
    /* Search for 'selector' props */
    [].forEach.call(propLabelSelector, function(currentPropLabel) {
      var propLabelName = currentPropLabel.innerHTML;
      var currentPropInput = currentPropLabel.nextElementSibling;
      var currentPropButton = currentPropInput.nextElementSibling;
      var currentPropTip = currentPropButton.nextElementSibling;

      /* If doesn't matches with 'error' */
      if( !propLabelName.match(/error/gi) ) {
        currentPropLabel.setAttribute('data-not-error', 'true');
        currentPropInput.setAttribute('data-not-error', 'true');
        currentPropButton.setAttribute('data-not-error', 'true');
        currentPropTip.setAttribute('data-not-error', 'true');
      }
    });

    /* Search for 'settings' props */
    [].forEach.call(propLabelSetting, function(currentPropLabel) {
      var propLabelName = currentPropLabel.innerHTML;
      var currentPropInput = currentPropLabel.nextElementSibling;
      var currentPropButton = currentPropInput.nextElementSibling;
      var currentPropTip = currentPropButton.nextElementSibling;

      /* If doesn't have value */
      if( !propLabelName.match(/error/gi) ) {
        currentPropLabel.setAttribute('data-not-error', 'true');
        currentPropInput.setAttribute('data-not-error', 'true');
        currentPropButton.setAttribute('data-not-error', 'true');
        currentPropTip.setAttribute('data-not-error', 'true');
      }
    });

  } else {
    /* Search for 'selector' props */
    [].forEach.call(propLabelSelector, function(currentPropLabel) {
      var propLabelName = currentPropLabel.innerHTML;
      var currentPropInput = currentPropLabel.nextElementSibling;
      var currentPropButton = currentPropInput.nextElementSibling;
      var currentPropTip = currentPropButton.nextElementSibling;

      /* If doesn't have value */
      if( !propLabelName.match(/error/gi) ) {
        currentPropLabel.setAttribute('data-not-error', '');
        currentPropInput.setAttribute('data-not-error', '');
        currentPropButton.setAttribute('data-not-error', '');
        currentPropTip.setAttribute('data-not-error', '');
      }
    });

    /* Search for 'settings' props */
    [].forEach.call(propLabelSetting, function(currentPropLabel) {
      var propLabelName = currentPropLabel.innerHTML;
      var currentPropInput = currentPropLabel.nextElementSibling;
      var currentPropButton = currentPropInput.nextElementSibling;
      var currentPropTip = currentPropButton.nextElementSibling;

      /* If doesn't have value */
      if( !propLabelName.match(/error/gi) ) {
        currentPropLabel.setAttribute('data-not-error', '');
        currentPropInput.setAttribute('data-not-error', '');
        currentPropButton.setAttribute('data-not-error', '');
        currentPropTip.setAttribute('data-not-error', '');
      }
    });
  }
}

function showOnlyMapped(checkbox) {
  var propLabelSelector = document.querySelectorAll('#mc-workbench-selector-container > .mc-workbench-prop-label');
  var propLabelSetting = document.querySelectorAll('#mc-workbench-settings-container > .mc-workbench-prop-label');

  if ( checkbox.checked ) {
    /* Search for 'selector' props */
    [].forEach.call(propLabelSelector, function(currentPropLabel) {
      var propLabelName = currentPropLabel.innerHTML;
      var currentPropInput = currentPropLabel.nextElementSibling;
      var currentPropButton = currentPropInput.nextElementSibling;
      var currentPropTip = currentPropButton.nextElementSibling;

      /* If doesn't have value */
      if( currentPropInput.value == '' ) {
        currentPropLabel.setAttribute('data-not-mapped', 'true');
        currentPropInput.setAttribute('data-not-mapped', 'true');
        currentPropButton.setAttribute('data-not-mapped', 'true');
        currentPropTip.setAttribute('data-not-mapped', 'true');
      }
    });

    /* Search for 'settings' props */
    [].forEach.call(propLabelSetting, function(currentPropLabel) {
      var propLabelName = currentPropLabel.innerHTML;
      var currentPropInput = currentPropLabel.nextElementSibling;
      var currentPropButton = currentPropInput.nextElementSibling;
      var currentPropTip = currentPropButton.nextElementSibling;

      /* If doesn't have value */
      if( currentPropInput.value == '' ) {
        currentPropLabel.setAttribute('data-not-mapped', 'true');
        currentPropInput.setAttribute('data-not-mapped', 'true');
        currentPropButton.setAttribute('data-not-mapped', 'true');
        currentPropTip.setAttribute('data-not-mapped', 'true');
      }
    });

  } else {
    /* Search for 'selector' props */
    [].forEach.call(propLabelSelector, function(currentPropLabel) {
      var propLabelName = currentPropLabel.innerHTML;
      var currentPropInput = currentPropLabel.nextElementSibling;
      var currentPropButton = currentPropInput.nextElementSibling;
      var currentPropTip = currentPropButton.nextElementSibling;

      /* If doesn't have value */
      if( currentPropInput.value == '' ) {
        currentPropLabel.setAttribute('data-not-mapped', '');
        currentPropInput.setAttribute('data-not-mapped', '');
        currentPropButton.setAttribute('data-not-mapped', '');
        currentPropTip.setAttribute('data-not-mapped', '');
      }
    });

    /* Search for 'settings' props */
    [].forEach.call(propLabelSetting, function(currentPropLabel) {
      var propLabelName = currentPropLabel.innerHTML;
      var currentPropInput = currentPropLabel.nextElementSibling;
      var currentPropButton = currentPropInput.nextElementSibling;
      var currentPropTip = currentPropButton.nextElementSibling;

      /* If doesn't have value */
      if( currentPropInput.value == '' ) {
        currentPropLabel.setAttribute('data-not-mapped', '');
        currentPropInput.setAttribute('data-not-mapped', '');
        currentPropButton.setAttribute('data-not-mapped', '');
        currentPropTip.setAttribute('data-not-mapped', '');
      }
    });
  }
}

function insertExtraSelectors(arrayOfSelectors, extraType) {
  var selectorContainer = document.querySelector('#mc-workbench-selector-container');
  arrayOfSelectors.forEach(function(currentElement) {

    var selectorLabel = document.createElement('label');
    var selectorElement = document.createElement('input');
    var selectorButton = document.createElement('div');
    var selectorTip = document.createElement('div');

    selectorLabel.className = 'mc-workbench-prop-label';
    selectorLabel.for = currentElement + '-selector';
    selectorLabel.innerHTML = currentElement;
    selectorLabel.setAttribute('data-extra', currentElement);
    selectorLabel.setAttribute('data-extra-type', extraType);

    selectorElement.type = "text";
    selectorElement.className = 'mc-workbench-prop-input';
    selectorElement.name = currentElement;
    selectorElement.id = currentElement + '-selector';
    selectorElement.setAttribute('data-extra', currentElement);
    selectorElement.setAttribute('data-extra-type', extraType);

    selectorButton.className = 'mc-workbench-prop-button';
    selectorButton.setAttribute('data-prop', selectorElement.id);
    selectorButton.setAttribute('onclick', 'grabSelector()');
    selectorButton.innerHTML = 'Grab';
    selectorButton.setAttribute('data-extra', currentElement);
    selectorButton.setAttribute('data-extra-type', extraType);

    selectorTip.className = 'mc-workbench-prop-tip inactive';
    selectorTip.innerHTML = 'Now, just click on some element in the original site';
    selectorTip.setAttribute('data-extra', currentElement);

    selectorContainer.insertBefore(selectorTip, selectorContainer.firstChild);
    selectorContainer.insertBefore(selectorButton, selectorContainer.firstChild);
    selectorContainer.insertBefore(selectorElement, selectorContainer.firstChild);
    selectorContainer.insertBefore(selectorLabel, selectorContainer.firstChild);
  });
}

function removeExtraSelectors(arrayOfSelectors) {
  var selectorContainer = document.querySelector('#mc-workbench-selector-container');
  var extraSelectors = document.querySelectorAll('#mc-workbench-selector-container > [data-extra]');
  arrayOfSelectors.forEach(function(currentElement) {
    [].forEach.call(extraSelectors, function(currentExtraSelector) {
      var dataExtra = currentExtraSelector.getAttribute('data-extra');
      if ( dataExtra == currentElement ) {
        selectorContainer.removeChild(currentExtraSelector);
      }
    });
  });
}

function grabSelector() {
  grabbingSelector = true;
  var grabButton = event.target;
  var grabProp = grabButton.getAttribute('data-prop');
  // Reset any opened tip
  var grabTip = document.querySelector('.mc-workbench-prop-tip.active');
  if ( grabTip ) {
    grabTip.className = 'mc-workbench-prop-tip inactive';
  }
  // Reset any grab button
  var grabButtonSelected = document.querySelector('.mc-workbench-prop-button.selected');
  if ( grabButtonSelected ) {
    grabButtonSelected.className = 'mc-workbench-prop-button';
  }

  grabTip = grabButton.nextElementSibling;
  grabTip.className = 'mc-workbench-prop-tip active';
  grabButton.className = grabButton.className + ' selected';
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

function disableActions() {
  var disableMenuText = document.querySelector('#mc-workbench-disable-actions');
  var element = originalBody.querySelectorAll('a, select, input, button');

  disableMenuText.className = 'mc-workbench-menu-text actions-disabled';
  [].forEach.call(element, function(currentElement) {

    if ( !currentElement.id.match(/mc-workbench/) ) {
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

      selectorLabel.className = 'mc-workbench-prop-label';
      selectorLabel.for = widgetSelectors[i] + '-selector';
      selectorLabel.innerHTML = widgetSelectors[i];

      selectorElement.type = "text";
      selectorElement.className = 'mc-workbench-prop-input';
      selectorElement.name = widgetSelectors[i];
      selectorElement.id = widgetSelectors[i] + '-selector';

      selectorButton.className = 'mc-workbench-prop-button';
      selectorButton.setAttribute('data-prop', selectorElement.id);
      selectorButton.setAttribute('onclick', 'grabSelector()');
      selectorButton.innerHTML = 'Grab';

      selectorTip.className = 'mc-workbench-prop-tip inactive';
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

      settingLabel.className = 'mc-workbench-prop-label';
      settingLabel.for = widgetSettings[i] + '-setting';
      settingLabel.innerHTML = widgetSettings[i];

      settingElement.type = "text";
      settingElement.className = 'mc-workbench-prop-input';
      settingElement.name = widgetSettings[i];
      settingElement.id = widgetSettings[i] + '-setting';

      settingButton.className = 'mc-workbench-prop-button';
      settingButton.setAttribute('data-prop', settingElement.id);
      settingButton.setAttribute('onclick', 'grabSelector()');
      settingButton.innerHTML = 'Grab';

      settingTip.className = 'mc-workbench-prop-tip inactive';
      settingTip.innerHTML = 'Now, just click on some element in the original site';

      settingsContainer.appendChild(settingLabel);
      settingsContainer.appendChild(settingElement);
      settingsContainer.appendChild(settingButton);
      settingsContainer.appendChild(settingTip);
    }
  } else {
    settingsSection.className = 'inactive';
  }

  // If returning from a refresh
  if ( isMapping == 'true' ) {
    fillMappingProps();
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

  isMapping = true;
  setMappingStatus(isMapping);

  updateMappingWidget(widgetName, widgetFile);
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
  var initialView = document.querySelector('#mc-workbench-initial-view');
  var isModalCheckbox = document.querySelector('#mc-workbench-selector-common-selectors');
  var commonPropsCheckbox = document.querySelector('#mc-workbench-selector-is-modal');
  var searchWidget = document.querySelector('#mc-workbench-widget-search');
  var searchProp = document.querySelector('#mc-workbench-prop-search');

  // Reset checked isModal checkbox
  isModalCheckbox.checked = false;
  var isModalChekbox = localStorage.setItem('mc-workbench-is-modal', 'false');

  // Reset checked commonProps checkbox
  commonPropsCheckbox.checked = false;
  var commonPropsChekbox = localStorage.setItem('mc-workbench-common-props', 'false');

  // Reset widget search field
  searchWidget.value = '';

  // Reset prop search field
  searchProp.value = '';

  // Reset isMapping status
  isMapping = false;
  setMappingStatus(isMapping);

  widgetEditor.className = 'inactive';
  destroyWidgetEditor();

  if( widgetSection.className.match(/^active/) ) {
    widgetSection.className = 'inactive';
    initialView.className = 'active';
    destroyWidgetList();
  } else {
    widgetSection.className = 'active';
    initialView.className = 'inactive';
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

  // Get if a widget was in mapping process before refresh
  isMapping = getMappingStatus();
  if( isMapping == 'true' ) {
    resumeMappingWidget();
  }
}

function closeGetSelectorModal() {
  var getSelectorModal = document.querySelector('#mc-workbench-getselector-modal');
  var getSelectorModalOverlay = document.querySelector('#mc-workbench-getselector-modal-overlay');
  var getSelectorInput = document.querySelector('#mc-workbench-getselector-modal-input');
  var statusMessage = document.querySelector('#mc-workbench-getselector-modal-status');

  getSelectorModal.className = 'inactive';
  getSelectorModalOverlay.className = 'inactive';
  getSelectorInput.value = '';
  statusMessage.innerHTML = '';
  statusMessage.className = '';

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
  var statusMessage = document.querySelector('#mc-workbench-export-modal-status');
  var exportOnlyFieldsCheckbox = document.querySelector('#mc-workbench-selector-only-fields');
  exportModal.className = 'inactive';
  exportModalOverlay.className = 'inactive';
  statusMessage.innerHTML = '';
  statusMessage.className = '';
  exportOnlyFieldsCheckbox.checked = false;
}

function openExportModal(schema) {
  var exportModal = document.querySelector('#mc-workbench-export-modal');
  var exportModalOverlay = document.querySelector('#mc-workbench-export-modal-overlay');
  var exportBox = document.querySelector('#mc-workbench-export-modal-box');
  exportModal.className = 'active';
  exportModalOverlay.className = 'active';
  exportBox.value = schema;

  //exportBox.style.height = 'auto';
  exportBox.setAttribute('style', 'height: auto !important');
  var newHeight = exportBox.scrollHeight + 6;
  //exportBox.style.height = newHeight+'px';
  exportBox.setAttribute('style', 'height: ' + newHeight + 'px !important');
}

function exportSchema() {
  /* Verify if we have any active widget to export */
  if ( widgetSelectors || widgetSettings ) {
    var selectorInputs = document.querySelectorAll('#mc-workbench-selector-container > .mc-workbench-prop-input');
    var settingInputs = document.querySelectorAll('#mc-workbench-settings-container > .mc-workbench-prop-input');
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

/*
CSS Selector Generator, v1.0.4
by Riki Fridrich <riki@fczbkk.com> (http://fczbkk.com)
https://github.com/fczbkk/css-selector-generator/
*/
(function(){var t,e,n=[].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1};t=function(){function t(t){null==t&&(t={}),this.options={},this.setOptions(this.default_options),this.setOptions(t)}return t.prototype.default_options={selectors:["id","class","tag","nthchild"]},t.prototype.setOptions=function(t){var e,n,r;null==t&&(t={}),n=[];for(e in t)r=t[e],this.default_options.hasOwnProperty(e)?n.push(this.options[e]=r):n.push(void 0);return n},t.prototype.isElement=function(t){return!(1!==(null!=t?t.nodeType:void 0))},t.prototype.getParents=function(t){var e,n;if(n=[],this.isElement(t))for(e=t;this.isElement(e);)n.push(e),e=e.parentNode;return n},t.prototype.getTagSelector=function(t){return this.sanitizeItem(t.tagName.toLowerCase())},t.prototype.sanitizeItem=function(t){var e;return e=t.split("").map(function(t){return":"===t?"\\"+":".charCodeAt(0).toString(16).toUpperCase()+" ":/[ !"#$%&'()*+,.\/;<=>?@\[\\\]^`{|}~]/.test(t)?"\\"+t:escape(t).replace(/\%/g,"\\")}),e.join("")},t.prototype.getIdSelector=function(t){var e,n;return e=t.getAttribute("id"),null==e||""===e||/\s/.exec(e)||/^\d/.exec(e)||(n="#"+this.sanitizeItem(e),1!==t.ownerDocument.querySelectorAll(n).length)?null:n},t.prototype.getClassSelectors=function(t){var e,n,r;return r=[],"HTML"===t.tagName?r:(e=t.getAttribute("class"),null!=e&&(e=e.replace(/\s+/g," "),e=e.replace(/^\s|\s$/g,""),""!==e&&(r=function(){var t,r,o,i;for(o=e.split(/\s+/),i=[],t=0,r=o.length;r>t;t++)n=o[t],i.push("."+this.sanitizeItem(n));return i}.call(this))),r)},t.prototype.getAttributeSelectors=function(t){var e,r,o,i,s,l,u;for(u=[],r=["id","class"],s=t.attributes,o=0,i=s.length;i>o;o++)e=s[o],l=e.nodeName,n.call(r,l)<0&&u.push("["+e.nodeName+"="+e.nodeValue+"]");return u},t.prototype.getNthChildSelector=function(t){var e,n,r,o,i,s;if(o=t.parentNode,null!=o)for(e=0,s=o.childNodes,n=0,r=s.length;r>n;n++)if(i=s[n],this.isElement(i)&&(e++,i===t))return":nth-child("+e+")";return null},t.prototype.testSelector=function(t,e){var n,r;return n=!1,null!=e&&""!==e&&(r=t.ownerDocument.querySelectorAll(e),1===r.length&&r[0]===t&&(n=!0)),n},t.prototype.getAllSelectors=function(t){var e;return e={t:null,i:null,c:null,a:null,n:null},n.call(this.options.selectors,"tag")>=0&&(e.t=this.getTagSelector(t)),n.call(this.options.selectors,"id")>=0&&(e.i=this.getIdSelector(t)),n.call(this.options.selectors,"class")>=0&&(e.c=this.getClassSelectors(t)),n.call(this.options.selectors,"attribute")>=0&&(e.a=this.getAttributeSelectors(t)),n.call(this.options.selectors,"nthchild")>=0&&(e.n=this.getNthChildSelector(t)),e},t.prototype.testUniqueness=function(t,e){var n,r;return r=t.parentNode,n=r.querySelectorAll(e),1===n.length&&n[0]===t},t.prototype.testCombinations=function(t,e,n){var r,o,i,s,l,u,c;for(u=this.getCombinations(e),o=0,s=u.length;s>o;o++)if(r=u[o],this.testUniqueness(t,r))return r;if(null!=n)for(c=e.map(function(t){return n+t}),i=0,l=c.length;l>i;i++)if(r=c[i],this.testUniqueness(t,r))return r;return null},t.prototype.getUniqueSelector=function(t){var e,n,r,o,i,s;for(s=this.getAllSelectors(t),o=this.options.selectors,n=0,r=o.length;r>n;n++)switch(i=o[n]){case"id":if(null!=s.i)return s.i;break;case"tag":if(null!=s.t&&this.testUniqueness(t,s.t))return s.t;break;case"class":if(null!=s.c&&0!==s.c.length&&(e=this.testCombinations(t,s.c,s.t)))return e;break;case"attribute":if(null!=s.a&&0!==s.a.length&&(e=this.testCombinations(t,s.a,s.t)))return e;break;case"nthchild":if(null!=s.n)return s.n}return"*"},t.prototype.getSelector=function(t){var e,n,r,o,i,s,l,u,c,a;for(e=[],l=this.getParents(t),r=0,i=l.length;i>r;r++)n=l[r],c=this.getUniqueSelector(n),null!=c&&e.push(c);for(a=[],o=0,s=e.length;s>o;o++)if(n=e[o],a.unshift(n),u=a.join(" > "),this.testSelector(t,u))return u;return null},t.prototype.getCombinations=function(t){var e,n,r,o,i,s,l;for(null==t&&(t=[]),l=[[]],e=r=0,i=t.length-1;i>=0?i>=r:r>=i;e=i>=0?++r:--r)for(n=o=0,s=l.length-1;s>=0?s>=o:o>=s;n=s>=0?++o:--o)l.push(l[n].concat(t[e]));return l.shift(),l=l.sort(function(t,e){return t.length-e.length}),l=l.map(function(t){return t.join("")})},t}(),("undefined"!=typeof define&&null!==define?define.amd:void 0)?define([],function(){return t}):(e="undefined"!=typeof exports&&null!==exports?exports:this,e.CssSelectorGenerator=t)}).call(this);
