// Chess piece Unicode symbols
const PIECES = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

// Initial board layout
const INITIAL_BOARD = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let board = [];
let turn = 'white'; // 'white' or 'black'
let selectedSquare = null;

const boardElement = document.getElementById('chessboard');
const statusElement = document.getElementById('status');
const moveListElement = document.getElementById('move-list');
const restartBtn = document.getElementById('restart-btn');

// Initialize Game
function initGame() {
    board = JSON.parse(JSON.stringify(INITIAL_BOARD));
    turn = 'white';
    selectedSquare = null;
    statusElement.textContent = "Current Turn: White";
    moveListElement.innerHTML = '';
    renderBoard();
}

// Render Chessboard
function renderBoard() {
    boardElement.innerHTML = '';
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            const isWhiteSquare = (r + c) % 2 === 0;
            square.className = `square ${isWhiteSquare ? 'white' : 'black'}`;
            square.dataset.row = r;
            square.dataset.col = c;

            const pieceCode = board[r][c];
            if (pieceCode) {
                square.textContent = PIECES[pieceCode];
            }

            if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
                square.classList.add('selected');
            }

            square.addEventListener('click', () => handleSquareClick(r, c));
            boardElement.appendChild(square);
        }
    }
}

// Handle square interaction
function handleSquareClick(row, col) {
    const piece = board[row][col];
    const isWhitePiece = piece && piece === piece.toUpperCase();
    const isBlackPiece = piece && piece === piece.toLowerCase();

    // Select piece
    if (selectedSquare === null) {
        if ((turn === 'white' && isWhitePiece) || (turn === 'black' && isBlackPiece)) {
            selectedSquare = { r: row, c: col };
            renderBoard();
        }
        return;
    }

    // Deselect if clicking the same square
    if (selectedSquare.r === row && selectedSquare.c === col) {
        selectedSquare = null;
        renderBoard();
        return;
    }

    // Re-select another piece of the same color
    if ((turn === 'white' && isWhitePiece) || (turn === 'black' && isBlackPiece)) {
        selectedSquare = { r: row, c: col };
        renderBoard();
        return;
    }

    // Execute Move
    if (isValidMove(selectedSquare.r, selectedSquare.c, row, col)) {
        makeMove(selectedSquare.r, selectedSquare.c, row, col);
        selectedSquare = null;
        turn = turn === 'white' ? 'black' : 'white';
        statusElement.textContent = `Current Turn: ${turn.charAt(0).toUpperCase() + turn.slice(1)}`;
        renderBoard();
    }
}

// Basic move validation helper
function isValidMove(fromR, fromC, toR, toC) {
    const piece = board[fromR][fromC];
    const target = board[toR][toC];
    
    // Cannot capture own piece
    if (target) {
        const isTargetWhite = target === target.toUpperCase();
        if ((turn === 'white' && isTargetWhite) || (turn === 'black' && !isTargetWhite)) {
            return false;
        }
    }

    const dRow = Math.abs(toR - fromR);
    const dCol = Math.abs(toC - fromC);
    const type = piece.toLowerCase();

    // Pawn movement basic logic
    if (type === 'p') {
        const direction = piece === 'P' ? -1 : 1;
        const startRow = piece === 'P' ? 6 : 1;

        if (fromC === toC && !target) {
            if (toR - fromR === direction) return true;
            if (fromR === startRow && toR - fromR === 2 * direction && !board[fromR + direction][fromC]) return true;
        }
        if (dCol === 1 && toR - fromR === direction && target) return true;
        return false;
    }

    // Knight movement
    if (type === 'n') {
        return (dRow === 1 && dCol === 2) || (dRow === 2 && dCol === 1);
    }

    // King movement
    if (type === 'k') {
        return dRow <= 1 && dCol <= 1;
    }

    // Straight line movement (Rook / Queen)
    if (type === 'r' || type === 'q') {
        if (fromR === toR || fromC === toC) {
            if (isPathClear(fromR, fromC, toR, toC)) return true;
        }
    }

    // Diagonal movement (Bishop / Queen)
    if (type === 'b' || type === 'q') {
        if (dRow === dCol) {
            if (isPathClear(fromR, fromC, toR, toC)) return true;
        }
    }

    return false;
}

// Check path clearance for sliding pieces
function isPathClear(fromR, fromC, toR, toC) {
    const stepR = Math.sign(toR - fromR);
    const stepC = Math.sign(toC - fromC);

    let currR = fromR + stepR;
    let currC = fromC + stepC;

    while (currR !== toR || currC !== toC) {
        if (board[currR][currC] !== '') return false;
        currR += stepR;
        currC += stepC;
    }
    return true;
}

// Move execution & logging
function makeMove(fromR, fromC, toR, toC) {
    const piece = board[fromR][fromC];
    const target = board[toR][toC];
    
    board[toR][toC] = piece;
    board[fromR][fromC] = '';

    // Log move
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const fromCoord = `${cols[fromC]}${8 - fromR}`;
    const toCoord = `${cols[toC]}${8 - toR}`;
    const logItem = document.createElement('li');
    logItem.textContent = `${PIECES[piece]} ${fromCoord} → ${toCoord}${target ? ' ⚔' : ''}`;
    moveListElement.appendChild(logItem);
}

// Event Listeners
restartBtn.addEventListener('click', initGame);

// Start game
initGame();