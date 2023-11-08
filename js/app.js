'use strict'

// const MINE = '💣'
// const EMPTY = ' '

/*The model – A Matrix containing cell objects. Each cell has: 
each cell in the gBoard is going to have this object
= {
    minesAroundCount: 4,
    isShown: false,
    isMine: false,
    isMarked: true
}
*/
var gBoard

// This is an object by which the board size is set
var gLevel = {
    SIZE: 4,
    MINES: 2,
}
console.log('gLevel:', gLevel)

// This is an object in which you can keep and update the current game state
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
console.log('gGame:', gGame)

//This is called when page loads 
function onInit() {
    gBoard = buildBoard()
    console.log('gBoard:', gBoard)
    renderBoard(gBoard)
}

/* Builds the board   
Set the mines 
Call setMinesNegsCount() 
Return the created board
 */
function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        // for (var j = 0; j < board[i].length; j++) { //doesnt work and i dunno why
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            board[i][j] = cell


        }
    }
    //set 2 mines in the board manually
    board[0][0].isMine = true
    board[1][2].isMine = true
    board[board.length - 1][board.length - 1].isMine = true

    setMinesNegsCount(board)

    return board
}

// Count mines around EACH cell 
// and set the cell's 
// minesAroundCount
//when this works change the var negsMinesCount to something more similar to the function name
function setMinesNegsCount(board) {

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            const currCell = board[i][j]

            if (currCell.isMine) {
                console.log(`(${i},${j}) currCell.isMine:`, currCell.isMine)
                continue
            } else {
                // console.log('currCell:', currCell)
                console.log(`currCell.isMine: (${i},${j})`, currCell.isMine)
                var negsMinesCount = 0
                // console.log('currCell:', currCell)
                // console.log('i got into the if statement, meaning this time its not a bomb');
                negsMinesCount = countNeighbors(i, j, board, 1, 1, currCell.isMine)
                // console.log('negsMinesCount:', negsMinesCount)
                currCell.minesAroundCount = negsMinesCount
                // console.log('currCell after adding minesaround:', currCell)
            }
        }
    }
}


// Render the board as a <table> 
// to the page
function renderBoard(board) {
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j]

            //makes the cell in the dom show bomb or number of bombs around
            if (board[i][j].isMine) {
                currCell = '💣'
            } else {
                currCell = +(board[i][j].minesAroundCount)
            }

            const className = `cell cell-${i}-${j}`
            strHTML += `<td class="${className}">${currCell}</td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Called when a cell is clicked
function onCellClicked(elCell, i, j) { }

//Called when a cell is clicked
function onCellMarked(elCell) { }

//Game ends when all mines are 
// marked, and all the other cells 
// are shown 
function checkGameOver() { }

// When user clicks a cell with no 
// mines around, we need to open 
// not only that cell, but also its 
// neighbors.  
// NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
// BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below) 
function expandShown(board, elCell, i, j) { }

