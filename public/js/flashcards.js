/* eslint-disable no-unused-vars */
function displaySection(section) {
  const sections = ['createFlashcards', 'study-sets'];
  sections.splice(sections.indexOf(section), 1);
  let sectionElements = [];
  sections.forEach((section) => {
    sectionElements.push(document.getElementById(section));
  });
  // eslint-disable-next-line no-undef
  hide(sectionElements);
  // eslint-disable-next-line no-undef
  show([document.getElementById(section)], 'block');
}

const flashcards = document.getElementById('flashcards'),
  addFlashcard = document.getElementById('add-flashcard'),
  removeFlashcard = document.getElementById('remove-flashcard');

addFlashcard.onclick = () => {
  // Create term and definition inputs
  let newField = flashcards.querySelector('.flashcard-field').cloneNode(true);

  // Get term element
  let termField = newField.querySelector('.flashcard-term');
  if (!termField) throw new Error('Term field not found');
  // Set term element
  termField.setAttribute(
    'name',
    `flashcard[${flashcards.childElementCount}][term]`
  );
  termField.value = '';

  // Get definition element
  let definitionField = newField.querySelector('.flashcard-definition');
  if (!definitionField) throw new Error('Definition field not found');
  // Set definition element
  definitionField.setAttribute(
    'name',
    `flashcard[${flashcards.childElementCount}][definition]`
  );
  definitionField.value = '';

  // Get and set author  hidden input
  newField
    .querySelector('.flashcard-author')
    .setAttribute('name', `flashcard[${flashcards.childElementCount}][author]`);

  // Get and set field number
  newField.querySelector('span').innerHTML = flashcards.childElementCount + 1;

  // Get and set interchangeable input
  let interchangeableField = newField.querySelector('[type=checkbox]'),
    interchangeableFieldName = `flashcard[${flashcards.childElementCount}][interchangeable]`;
  interchangeableField.setAttribute(
    'name',
    interchangeableFieldName
  );
  interchangeableField.checked = false;

  // Get and set label for interchangeable input
  newField.querySelector('label').setAttribute('for', interchangeableFieldName);

  // Add new field to flashcards
  flashcards.appendChild(newField);
  newField.querySelector('.close').addEventListener('click', removeField);
};

// Detect if close button is pressed
let elements = document.querySelectorAll('.close');
// Convert the node list into an Array so we can
// safely use Array methods with it
let elementsArray = Array.prototype.slice.call(elements);
function removeField() {
  if (flashcards.childElementCount > 2) {
    let counter = 1;
    this.parentElement.parentElement.remove();
    flashcards.querySelectorAll('.flashcard-field').forEach((field) => {
      field.querySelector('span').innerHTML = counter;
      counter++;
    });
  }
}
// Loop over the array of elements
elementsArray.forEach(function (elem) {
  // Assign an event handler
  elem.addEventListener('click', removeField, false);
});
