/**
 * Tic-Tac-Toe Logic
 * Developer: NAZRUL (https://github.com/Alex000115)
 */

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; // X is always human
let gameActive = false;
let gameMode = 'pvp'; // 'pvp' or 'pve'

const statusDisplay = document.getElementById('status');
const cells = document.querySelectorAll('.cell');
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('game-container');

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Sound effects using Audio Synthesis (No external files needed)
const playSound = (freq, type) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
};

function startGame(mode) {
    gameMode = mode;
    gameActive = true;
    menu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    handleRestart();
}

function handleCellClick(e) {
    const clickedCell = e.target;
    const index = parseInt(clickedCell.getAttribute('data-index'));

    if (board[index] !== "" || !gameActive) return;

    makeMove(index, currentPlayer);
    
    if (gameActive && gameMode === 'pve' && currentPlayer === 'O') {
        setTimeout(computerMove, 500);
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].innerText = player;
    cells[index].classList.add(player.toLowerCase(), 'taken');
    playSound(player === 'X' ? 440 : 520, 'sine');
    
    checkResult();
}

function checkResult() {
    let roundWon = false;
    let winLine = [];

    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winLine = condition;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerText = `Player ${currentPlayer} Wins!`;
        winLine.forEach(idx => cells[idx].classList.add('winner'));
        gameActive = false;
        playSound(880, 'square');
        return;
    }

    if (!board.includes("")) {
        statusDisplay.innerText = "It's a Draw!";
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.innerText = `${currentPlayer}'s Turn`;
}

// AI Logic: Minimax Algorithm for unbeatable AI
function computerMove() {
    if (!gameActive) return;
    const bestMove = minimax(board, "O").index;
    makeMove(bestMove, "O");
}

function minimax(newBoard, player) {
    const availSpots = newBoard.map((v, i) => v === "" ? i : null).filter(v => v !== null);

    if (checkWin(newBoard, "X")) return { score: -10 };
    if (checkWin(newBoard, "O")) return { score: 10 };
    if (availSpots.length === 0) return { score: 0 };

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === "O") {
            move.score = minimax(newBoard, "X").score;
        } else {
            move.score = minimax(newBoard, "O").score;
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

function checkWin(b, p) {
    return winningConditions.some(condition => {
        return condition.every(idx => b[idx] === p);
    });
}

function handleRestart() {
    board = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = "X";
    statusDisplay.innerText = "X's Turn";
    cells.forEach(cell => {
        cell.innerText = "";
        cell.className = "cell";
    });
}

// Event Listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
document.getElementById('restart-btn').addEventListener('click', handleRestart);
document.getElementById('back-btn').addEventListener('click', () => {
    menu.classList.remove('hidden');
    gameContainer.classList.add('hidden');
    statusDisplay.innerText = "Choose a Game Mode";
});
