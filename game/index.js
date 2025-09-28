const board = document.querySelector(".board");

const rows = 9;
const cols = 9;

const boardArray = Array.from({ length: rows }, () => Array(cols).fill(0));

console.log(boardArray);

const isSafe = (board, row, col, num) => {
	for (let x = 0; x < 9; x++) {
		if (board[row][x] === num || board[x][col] === num) return false;
	}
	const startRow = row - (row % 3);
	const startCol = col - (col % 3);
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (board[startRow + i][startCol + j] === num) return false;
		}
	}
	return true;
};

const fillSudoku = (board) => {
	for (let row = 0; row < 9; row++) {
		for (let col = 0; col < 9; col++) {
			if (board[row][col] === 0) {
				let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(
					() => Math.random() - 0.5
				);
				for (let num of numbers) {
					if (isSafe(board, row, col, num)) {
						board[row][col] = num;
						if (fillSudoku(board)) return true;
						board[row][col] = 0;
					}
				}
				return false;
			}
		}
	}
	return true;
};

const createUserBoardArray = (fullBoard, fillPercent = 0.3) => {
	const userBoard = fullBoard.map((row) => row.slice()); // copy the full board
	let unfilledCount = 0;

	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (Math.random() > fillPercent) {
				userBoard[i][j] = 0; // empty cell for user
				unfilledCount++;
			}
		}
	}

	return { userBoard, unfilledCount };
};

fillSudoku(boardArray);

// usage
const { userBoard, unfilledCount } = createUserBoardArray(boardArray, 0.6);
console.log(userBoard);
console.log("Number of unfilled cells:", unfilledCount);

let filled = 0;

const createSubGrid = (_i, _j) => {
	const subGrid = document.createElement("sub-grid");
	subGrid.className = "sub-grid";

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			const cell = document.createElement("div");
			cell.className = "cell";

			const cellValue = userBoard[_i * 3 + i][_j * 3 + j];

			cell.setAttribute("value", cellValue);

			cell.setAttribute("row", _i * 3 + i);
			cell.setAttribute("col", _j * 3 + j);

			if (cellValue != "0") {
				cell.innerText = cell.getAttribute("value");
				cell.setAttribute("filled", 1);
			} else {
				cell.setAttribute("filled", 0);
			}

			subGrid.appendChild(cell);
		}
	}

	return subGrid;
};

for (let i = 0; i < 3; i++) {
	const row = document.createElement("div");
	row.className = "row";
	for (let j = 0; j < 3; j++) {
		row.appendChild(createSubGrid(i, j));
	}

	board.appendChild(row);
}

const cells = document.querySelectorAll(".cell");
let activeCell;

for (const cell of cells) {
	cell.addEventListener("click", () => {
		if (cell.getAttribute("filled") === "1") return; // already filled

		if (activeCell) {
			activeCell.classList.remove("active");
		}

		activeCell = cell;
		activeCell.classList.add("active");
		console.log("Active cell:", activeCell);
	});
}

// listen for keyboard input
document.addEventListener("keydown", (e) => {
	if (!activeCell) return; // no cell selected
	const key = e.key;

	// only allow numbers 1-9
	if (!/^[1-9]$/.test(key)) return;

	const row = parseInt(activeCell.getAttribute("row"));
	const col = parseInt(activeCell.getAttribute("col"));
	const value = parseInt(key);

	console.log(boardArray[(row, col)]);

	// check if the value is safe in the board
	if (boardArray[row][col] == value) {
		activeCell.innerText = value;
		activeCell.setAttribute("value", value);
		activeCell.setAttribute("filled", 1);

		userBoard[row][col] = value; // update the board array
		filled++;

		activeCell.classList.remove("active");
		activeCell = null;

		console.log(`Filled: ${filled} / ${unfilledCount}`);

		if (filled === unfilledCount) {
			alert("You've solved the board!");
		}

		// optionally deselect after filling
		activeCell = null;
	} else {
		console.log(value);
		// alert("Invalid number for this cell! ", value);
	}
});

const generateNumpad = () => {
	const numpad = document.querySelector(".numpad");

	for (let i = 0; i < 9; i++) {
		const numCell = document.createElement("div");
		numCell.className = "numCell";

		numCell.setAttribute("value", i + 1);
		numCell.innerText = i + 1;

		numCell.addEventListener("click", () => {
			if (!activeCell) return;
   
			const row = parseInt(activeCell.getAttribute("row"));
			const col = parseInt(activeCell.getAttribute("col"));

      const value = numCell.getAttribute("value")

			if (boardArray[row][col] == value) {
				activeCell.innerText = value;
				activeCell.setAttribute("value", value);
				activeCell.setAttribute("filled", 1);

				userBoard[row][col] = value; // update the board array
				filled++;

				activeCell.classList.remove("active");
				activeCell = null;

				console.log(`Filled: ${filled} / ${unfilledCount}`);

				if (filled === unfilledCount) {
					alert("You've solved the board!");
				}

				// optionally deselect after filling
				activeCell = null;
			} else {
				console.log(value);
				// alert("Invalid number for this cell! ", value);
			}
		});

		numpad.appendChild(numCell);
	}
};

generateNumpad();