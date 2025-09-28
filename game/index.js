const board = document.querySelector(".board");

const rows = 9;
const cols = 9;

const remLives = document.getElementById("rem-lives");
const livesWrapper = document.querySelector(".lives-wrapper");

const choice = document.querySelector(".choice");
let _rem = 5

const reduceLife = () => {
  _rem--

  if (_rem == 0) {
    livesWrapper.innerHTML = ""
    alert("you lose")
  }

  if (livesWrapper) {
    livesWrapper.lastElementChild?.remove()
  }
};

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

const createUserBoardArray = (fullBoard, fillPercent = 0.1) => {
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
		reduceLife();
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

			const value = numCell.getAttribute("value");

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
				reduceLife();
			}
		});

		numpad.appendChild(numCell);
	}
};

generateNumpad();

const generateHealthBar = (count) => {
	for (let i = 0; i < count; i++) {
		const heart = document.createElement("i");
		heart.classList.add("fa-solid", "fa-heart", "life-heart");

		livesWrapper.appendChild(heart);
	}
};

generateHealthBar(_rem);


const submitBoard = () => {
  let correct = true;

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (userBoard[i][j] !== boardArray[i][j]) {
        correct = false;

        // highlight wrong cell
        const cell = document.querySelector(
          `.cell[row='${i}'][col='${j}']`
        );
        if (cell) {
          cell.classList.add("wrong");
          setTimeout(() => cell.classList.remove("wrong"), 1000);
        }
      }
    }
  }

  if (correct) {
    alert("🎉 Congratulations! You solved it!");
  } else {
    reduceLife();
    alert("❌ Some numbers are wrong. Try again!");
  }
};
