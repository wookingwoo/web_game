// Sudoku Game Logic
const difficulties = {
    easy: 43,    // 43 cells filled
    medium: 35,  // 35 cells filled
    hard: 28     // 28 cells filled
};

let currentDifficulty = 'easy';
let solution = [];
let puzzle = [];
let userInput = [];
let selectedCell = null;
let mistakes = 0;
let timer = 0;
let timerInterval = null;
let gameOver = false;

// DOM Elements
const gameBoard = document.getElementById('gameBoard');
const timerDisplay = document.getElementById('timer');
const mistakesDisplay = document.getElementById('mistakes');
const winOverlay = document.getElementById('winOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalTimeDisplay = document.getElementById('finalTime');
const diffButtons = document.querySelectorAll('.diff-btn');
const numButtons = document.querySelectorAll('.num-btn');

// Generate a valid Sudoku solution
function generateSolution() {
    const board = Array(9).fill(null).map(() => Array(9).fill(0));
    fillBoard(board);
    return board;
}

function fillBoard(board) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                shuffle(nums);
                for (let num of nums) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (fillBoard(board)) {
                            return true;
                        }
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function isValid(board, row, col, num) {
    // Check row
    for (let c = 0; c < 9; c++) {
        if (board[row][c] === num) return false;
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
        if (board[r][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if (board[r][c] === num) return false;
        }
    }
    
    return true;
}

function generatePuzzle(sol, filledCells) {
    const puzz = sol.map(row => [...row]);
    const cells = [];
    
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            cells.push([r, c]);
        }
    }
    
    shuffle(cells);
    
    const toRemove = 81 - filledCells;
    for (let i = 0; i < toRemove; i++) {
        const [r, c] = cells[i];
        puzz[r][c] = 0;
    }
    
    return puzz;
}

function init() {
    solution = generateSolution();
    puzzle = generatePuzzle(solution, difficulties[currentDifficulty]);
    userInput = puzzle.map(row => [...row]);
    selectedCell = null;
    mistakes = 0;
    timer = 0;
    gameOver = false;
    
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    
    updateMistakes();
    updateTimer();
    render();
    hideOverlays();
    updateNumberCounts();
}

function hideOverlays() {
    winOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
}

function updateTimer() {
    const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
    const seconds = (timer % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
    timer++;
}

function updateMistakes() {
    mistakesDisplay.textContent = `${mistakes}/3`;
}

function render() {
    gameBoard.innerHTML = '';
    
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            if (puzzle[r][c] !== 0) {
                cell.textContent = puzzle[r][c];
                cell.classList.add('fixed');
            } else if (userInput[r][c] !== 0) {
                cell.textContent = userInput[r][c];
            }
            
            if (selectedCell && selectedCell.row === r && selectedCell.col === c) {
                cell.classList.add('selected');
            }
            
            // Highlight same row, column, and box
            if (selectedCell) {
                const sameRow = selectedCell.row === r;
                const sameCol = selectedCell.col === c;
                const sameBox = Math.floor(selectedCell.row / 3) === Math.floor(r / 3) &&
                               Math.floor(selectedCell.col / 3) === Math.floor(c / 3);
                
                if ((sameRow || sameCol || sameBox) && !(selectedCell.row === r && selectedCell.col === c)) {
                    cell.classList.add('highlight');
                }
                
                // Highlight same numbers
                const selectedValue = userInput[selectedCell.row][selectedCell.col];
                if (selectedValue !== 0 && userInput[r][c] === selectedValue) {
                    cell.classList.add('same-number');
                }
            }
            
            cell.addEventListener('click', () => selectCell(r, c));
            gameBoard.appendChild(cell);
        }
    }
}

function selectCell(row, col) {
    if (gameOver) return;
    if (puzzle[row][col] !== 0) return; // Can't select fixed cells
    
    selectedCell = { row, col };
    render();
}

function inputNumber(num) {
    if (!selectedCell || gameOver) return;
    
    const { row, col } = selectedCell;
    if (puzzle[row][col] !== 0) return;
    
    if (num === 0) {
        userInput[row][col] = 0;
    } else {
        if (solution[row][col] !== num) {
            mistakes++;
            updateMistakes();
            
            // Show error animation
            const cells = gameBoard.querySelectorAll('.cell');
            const index = row * 9 + col;
            cells[index].classList.add('error');
            setTimeout(() => cells[index].classList.remove('error'), 300);
            
            if (mistakes >= 3) {
                endGame(false);
                return;
            }
        }
        userInput[row][col] = num;
    }
    
    render();
    updateNumberCounts();
    checkWin();
}

function updateNumberCounts() {
    const counts = Array(10).fill(0);
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (userInput[r][c] !== 0) {
                counts[userInput[r][c]]++;
            }
        }
    }
    
    numButtons.forEach(btn => {
        const num = parseInt(btn.dataset.num);
        if (num !== 0 && counts[num] >= 9) {
            btn.classList.add('disabled');
        } else {
            btn.classList.remove('disabled');
        }
    });
}

function checkWin() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (userInput[r][c] !== solution[r][c]) {
                return;
            }
        }
    }
    endGame(true);
}

function endGame(won) {
    gameOver = true;
    clearInterval(timerInterval);
    
    if (won) {
        const minutes = Math.floor((timer - 1) / 60).toString().padStart(2, '0');
        const seconds = ((timer - 1) % 60).toString().padStart(2, '0');
        finalTimeDisplay.textContent = `${minutes}:${seconds}`;
        winOverlay.classList.remove('hidden');
    } else {
        gameOverOverlay.classList.remove('hidden');
    }
}

function getHint() {
    if (gameOver) return;
    
    const emptyCells = [];
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (userInput[r][c] === 0) {
                emptyCells.push({ row: r, col: c });
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        userInput[row][col] = solution[row][col];
        selectedCell = { row, col };
        render();
        updateNumberCounts();
        checkWin();
    }
}

function newGame() {
    init();
}

// Event Listeners
diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.difficulty;
        init();
    });
});

numButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const num = parseInt(btn.dataset.num);
        inputNumber(num);
    });
});

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
        inputNumber(num);
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        inputNumber(0);
    } else if (e.key === 'ArrowUp' && selectedCell) {
        selectedCell.row = Math.max(0, selectedCell.row - 1);
        while (puzzle[selectedCell.row][selectedCell.col] !== 0 && selectedCell.row > 0) {
            selectedCell.row--;
        }
        render();
    } else if (e.key === 'ArrowDown' && selectedCell) {
        selectedCell.row = Math.min(8, selectedCell.row + 1);
        while (puzzle[selectedCell.row][selectedCell.col] !== 0 && selectedCell.row < 8) {
            selectedCell.row++;
        }
        render();
    } else if (e.key === 'ArrowLeft' && selectedCell) {
        selectedCell.col = Math.max(0, selectedCell.col - 1);
        while (puzzle[selectedCell.row][selectedCell.col] !== 0 && selectedCell.col > 0) {
            selectedCell.col--;
        }
        render();
    } else if (e.key === 'ArrowRight' && selectedCell) {
        selectedCell.col = Math.min(8, selectedCell.col + 1);
        while (puzzle[selectedCell.row][selectedCell.col] !== 0 && selectedCell.col < 8) {
            selectedCell.col++;
        }
        render();
    }
});

// Initialize
init();
