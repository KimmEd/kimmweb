/* eslint-disable no-unused-vars */
function displaySection(str) {
  let sections = ["createPost", "posts", "members", "settings", "resources"];
  let buttons = [
    "postsButton",
    "membersButton",
    "settingsButton",
    "resourcesButton",
  ];
  sections.splice(sections.indexOf(str), 1);
  buttons.splice(buttons.indexOf(str + "Button"), 1);
  hide(sections);
  if (str !== "createPost") {
    active([`${str}Button`]);

  }
  inactive(buttons);
  show([str]);
}

function hide(arr) {
  for (let i = 0; i < arr.length; i++) {
    document.getElementById(arr[i]).setAttribute("hidden", "");
  }
}

function show(arr) {
  for (let i = 0; i < arr.length; i++) {
    document.getElementById(arr[i]).removeAttribute("hidden");
  }
}

function inactive(arr) {
  for (let i = 0; i < arr.length; i++) {
    document.getElementById(arr[i]).classList.remove("active");
  }
}

function active(arr) {
  for (let i = 0; i < arr.length; i++) {
    document.getElementById(arr[i]).classList.add("active");
    console.log(arr[i]);
  }
}
