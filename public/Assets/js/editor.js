function toggleFormat(command) {
  document.execCommand(command, false, null);
  updateActiveButtons();
}

function toggleHeading(tag) {
  document.execCommand("formatBlock", false, tag);
  updateActiveButtons();
}

function insertBullet() {
  document.execCommand("insertUnorderedList", false, null);
}

function updateActiveButtons() {
  const buttons = {
      boldBtn: "bold",
      italicBtn: "italic",
      underlineBtn: "underline",
  };

  for (let id in buttons) {
      document.getElementById(id).classList.toggle("active", document.queryCommandState(buttons[id]));
  }
}

document.addEventListener("selectionchange", updateActiveButtons);







// function formatText(command) {
//   let selection = window.getSelection();
//   if (!selection.rangeCount) return;

//   let range = selection.getRangeAt(0);
//   let span = document.createElement("span");

//   if (command === "bold") {
//     span.style.fontWeight = "bold";
//   } else if (command === "italic") {
//     span.style.fontStyle = "italic";
//   } else if (command === "underline") {
//     span.style.textDecoration = "underline";
//   }

//   span.appendChild(range.extractContents());
//   range.insertNode(span);
// }
