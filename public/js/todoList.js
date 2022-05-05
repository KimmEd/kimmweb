const todoObjectList = [];

class Todo_Class {
  constructor(item) {
    this.ulElement = item;
  }

  add() {
    const todoInput = document.querySelector('#todo-input');
    const todoValue = todoInput.value;
    if (todoValue == '') {
      alert('Please enter a value');
      return;
    } else {
      const todoObject = {
        value: todoValue,
        done: false,
        id: todoObjectList.length,
      };
      todoObjectList.unshift(todoObject);
      this.display();
      todoInput.value = '';
    }
  }
  toggleDone(e) {
    const selectedTodoIndex = todoObjectList.findIndex((item) => item.id == e);
    todoObjectList[selectedTodoIndex].done = todoObjectList[selectedTodoIndex]
      .done
      ? false
      : true;
    this.display();
  }
  deleteElement(e) {
    const selectedDelIndex = todoObjectList.findIndex((item) => item.id == e);
    todoObjectList.splice(selectedDelIndex, 1);
    this.display();
  }
  display() {
    this.ulElement.innerHTML = '';
    todoObjectList.forEach((item) => {
      const liElement = document.createElement('li');
      const delBtn = document.createElement('i');

      liElement.innerText = item.value;
      liElement.setAttribute('data-id', item.id);

      delBtn.setAttribute('data-id', item.id);
      delBtn.classList.add('far', 'fa-trash-alt');

      liElement.appendChild(delBtn);

      delBtn.addEventListener('click', (e) => {
        const deleteId = e.target.getAttribute('data-id');
        myTodoList.deleteElement(deleteId);
      });

      liElement.addEventListener('click', (e) => {
        const selectedId = e.target.getAttribute('data-id');
        myTodoList.toggleDone(selectedId);
      });

      if (item.done) {
        liElement.classList.add('checked');
      }

      this.ulElement.appendChild(liElement);
    });
  }
}

// Main
const listSection = document.querySelector('#todo-ul');

let myTodoList = new Todo_Class(listSection);

document.querySelector('.add-btn').addEventListener('click', () => {
  myTodoList.add();
});
