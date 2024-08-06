const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
let gameActive = true;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameMode = null;
let difficulty = null;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function setMode(mode, diff = null) {
    gameMode = mode;
    difficulty = diff;
    resetGame();
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.innerHTML = `It's ${currentPlayer}'s turn`;
}

function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = `Player ${currentPlayer} has won!`;
        gameActive = false;
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = `Game ended in a draw!`;
        gameActive = false;
        return;
    }

    handlePlayerChange();
    if (gameMode === 'ai' && currentPlayer === 'O') {
        setTimeout(aiPlay, 500);
    }
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function resetGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = `It's ${currentPlayer}'s turn`;
    cells.forEach(cell => cell.innerHTML = "");
}

function aiPlay() {
    if (difficulty === 'easy') {
        aiEasy();
    } else if (difficulty === 'medium') {
        aiMedium();
    } else if (difficulty === 'hard') {
        aiHard();
    }
    handleResultValidation();
}

function aiEasy() {
    const emptyCells = gameState.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const clickedCell = cells[randomIndex];
    handleCellPlayed(clickedCell, randomIndex);
}

function aiMedium() {
    // Try to win
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] === "O" && gameState[b] === "O" && gameState[c] === "") {
            handleCellPlayed(cells[c], c);
            return;
        } else if (gameState[a] === "O" && gameState[b] === "" && gameState[c] === "O") {
            handleCellPlayed(cells[b], b);
            return;
        } else if (gameState[a] === "" && gameState[b] === "O" && gameState[c] === "O") {
            handleCellPlayed(cells[a], a);
            return;
        }
    }

    // Block opponent
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] === "X" && gameState[b] === "X" && gameState[c] === "") {
            handleCellPlayed(cells[c], c);
            return;
        } else if (gameState[a] === "X" && gameState[b] === "" && gameState[c] === "X") {
            handleCellPlayed(cells[b], b);
            return;
        } else if (gameState[a] === "" && gameState[b] === "X" && gameState[c] === "X") {
            handleCellPlayed(cells[a], a);
            return;
        }
    }

    // Play randomly
    aiEasy();
}

function aiHard() {
    const bestMove = minimax(gameState, currentPlayer).index;
    const clickedCell = cells[bestMove];
    handleCellPlayed(clickedCell, bestMove);
}

// Minimax Algorithm
function minimax(newBoard, player) {
    const availSpots = newBoard.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);

    if (checkWin(newBoard, "X")) {
        return { score: -10 };
    } else if (checkWin(newBoard, "O")) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === "O") {
            const result = minimax(newBoard, "X");
            move.score = result.score;
        } else {
            const result = minimax(newBoard, "O");
            move.score = result.score;
        }

        newBoard[availSpots[i]] = "";
        moves.push(move);
    }

    let bestMove;
    if (player === "O") {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function checkWin(board, player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];
        if (a === player && b === player && c === player) {
            return true;
        }
    }
    return false;
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
statusDisplay.innerHTML = `Please select a mode to start the game.`;
