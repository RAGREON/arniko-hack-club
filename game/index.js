const board = document.querySelector(".board");

const boardArray = [ ];

const createSubGrid = () => {
  const subGrid = document.createElement("sub-grid")
  subGrid.className = "sub-grid"

  for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div")
      cell.className = "cell";
      cell.setAttribute("value", "null")

      cell.innerText = cell.getAttribute("value")

      subGrid.appendChild(cell);
  }

  return subGrid
}

for (let i = 0; i < 3; i++) {
	const row = document.createElement("div");
	row.className = "row";
	for (let j = 0; j < 3; j++) {
		row.appendChild(createSubGrid());
	}

	board.appendChild(row);
}
