/* eslint-disable no-unused-vars */
function displaySection(str) {
  let sections = ['createPost', 'posts', 'members', 'settings', 'resources'];
  let buttons = [
    'postsButton',
    'membersButton',
    'settingsButton',
    'resourcesButton',
  ];
  sections.splice(sections.indexOf(str), 1);
  buttons.splice(buttons.indexOf(str + 'Button'), 1);
  let sectionElements = [];
  sections.forEach(section => {
    sectionElements.push(document.getElementById(section));
  })
  let buttonElements = [];
  buttons.forEach(button => {
    buttonElements.push(document.getElementById(button));
  })
  // eslint-disable-next-line no-undef
  hide(sectionElements);
  if (!/create/.test(str)) {
    active([`${str}Button`]);

  }
  inactive(buttons);
  // eslint-disable-next-line no-undef
  show([document.getElementById(str)], 'block');
}

function inactive(arr) {
  for (let i = 0; i < arr.length; i++) {
    document.getElementById(arr[i]).classList.remove('active');
  }
}

function active(arr) {
  for (let i = 0; i < arr.length; i++) {
    document.getElementById(arr[i]).classList.add('active');
  }
}

function toggle (elements, specifiedDisplay) {
  var element, index;

  elements = elements.length ? elements : [elements];
  for (index = 0; index < elements.length; index++) {
    element = elements[index];

    if (isElementHidden(element)) {
      element.style.display = '';

      // If the element is still hidden after removing the inline display
      if (isElementHidden(element)) {
        element.style.display = specifiedDisplay || 'block';
      }
    } else {
      element.style.display = 'none';
    }
  }
  function isElementHidden (element) {
    return window.getComputedStyle(element, null).getPropertyValue('display') === 'none';
  }
}
