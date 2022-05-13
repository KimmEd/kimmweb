const [id] = window.location.pathname.split('/').slice(-2);
const todoObjectList = [];

class Todo_Class {
    constructor(item) {
        this.ulElement = item;
    }

    add() {
        const todoInput = document.querySelector('#todo-input');
        const todoValue = todoInput.value;
        if (todoValue == '' || todoValue.length < 5 || todoValue > 50)
            return alert('Please enter a value between 5 and 50 characters');
        else {
            const todoObject = {
                taskName: todoValue,
                taskDueDate: '',
                taskStatus: false,
                taskAuthor: id,
                index: todoObjectList.length,
            };
            todoObjectList.unshift(todoObject);
            this.display();
            todoInput.value = '';
        }
    }
    toggleDone(e) {
        const selectedTodoIndex = todoObjectList.findIndex(
            (item) => item.index == e,
        );
        if (selectedTodoIndex < 0) return;
        todoObjectList[selectedTodoIndex].taskStatus = todoObjectList[
            selectedTodoIndex
        ].taskStatus
            ? false
            : true;
        this.display();
    }
    deleteElement(e) {
        const selectedDelIndex = todoObjectList.findIndex(
            (item) => item.index == e,
        );
        let todoId = todoObjectList[selectedDelIndex]._id;
        todoObjectList.splice(selectedDelIndex, 1);
        fetch(`/api/v1/user/${id}/todo`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ todoId: todoId }),
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => console.log(data));
        savedTodoList = [...todoObjectList];
        this.display();
    }
    display() {
        this.ulElement.innerHTML = '';
        todoObjectList.forEach((item) => {
            const liElement = document.createElement('li');
            const delBtn = document.createElement('i');

            liElement.innerText = item.taskName;
            liElement.setAttribute('data-id', item.index);

            delBtn.setAttribute('data-id', item.index);
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

            if (item.taskStatus) {
                liElement.classList.add('checked');
            }
            this.ulElement.appendChild(liElement);
        });
    }
}

// Main
const listSection = document.querySelector('#todo-ul');

let myTodoList = new Todo_Class(listSection);

let savedTodoList;
(async () => {
    let todoListRaw = await fetch(`/api/v1/user/${id}/todo`);
    savedTodoList = await todoListRaw.json();
    // Add index attribute to each object
    savedTodoList.forEach((item, index) => {
        item.index = index;
    });
    todoObjectList.push(...savedTodoList);
    myTodoList.display();
})();

document.querySelector('.add-btn').addEventListener('click', () => {
    myTodoList.add();
});
let checker = 0;
// eslint-disable-next-line no-unused-vars
let intervalId = setInterval(function () {
    checker++;
    console.log(checker);
    let todoToUpload = todoObjectList.filter((e) => {
        return !savedTodoList.includes(e);
    });
    if (arrayEquals(savedTodoList, todoObjectList)) return;
    else {
        if (todoToUpload.length === 0) return;
        let xhr = new XMLHttpRequest();
        xhr.open('POST', `/api/v1/user/${id}/todo`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = (e) => console.log(e.target.responseText);
        xhr.send(JSON.stringify({ todo: todoToUpload }));
        savedTodoList = [...todoObjectList];
    }
}, 10000);

function arrayEquals(a, b) {
    return (
        Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[b.length - index])
    );
}
