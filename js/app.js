'use strict'

const MINE = '💣'
const FLAG = '🚩'

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
    MINES: 3,
}
console.log('gLevel:', gLevel)

// This is an object in which you can keep and update the current game state
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    minesRevealed: 0,
    secsPassed: 0
}
console.log('gGame:', gGame)

//This is called when page loads 
function onInit() {
    gBoard = buildBoard()
    gGame.isOn = true
    console.log('gBoard:', gBoard)

    // random MINES gen. for manual MINES gen go to after the loop in buildBoard()
    setMinesInRandomCells(gBoard)
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

    ///////////////////        MANUAL MINES SETTING        ///////////////////
    //set 3 mines in the board manually
    // board[0][0].isMine = true
    // board[1][2].isMine = true
    // board[board.length - 1][board.length - 1].isMine = true

    // setMinesNegsCount(board)
    ///////////////////        MANUAL MINES SETTING        ///////////////////

    return board
}

// inserts mines into random cells
function setMinesInRandomCells(board) {

    var allEmptyCells = getAllEmptyCells(board)
    var emptyCell

    for (var i = 0; i < gLevel.MINES; i++) {

        emptyCell = getRandomItem(allEmptyCells)
        var idxOfEmptyCell = allEmptyCells.indexOf(emptyCell)
        allEmptyCells.splice(idxOfEmptyCell, 1)

        var idxI = emptyCell.i
        var idxJ = emptyCell.j

        gBoard[idxI][idxJ].isMine = true

        setMinesNegsCount(board)
    }
}

// set the cell's minesAroundCount
function setMinesNegsCount(board) {
    var minesNegsCount = 0

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            const currCell = board[i][j]

            if (!currCell.isMine) {
                minesNegsCount = countMinesNegsCell(board, i, j)
                currCell.minesAroundCount = minesNegsCount
            }
        }
    }
}

// counts the mines around the cell
function countMinesNegsCell(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}

// Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j]

            //makes the cell in the dom show bomb or number of bombs around
            if (board[i][j].isMine) {
                currCell = MINE
            } else {
                currCell = +(board[i][j].minesAroundCount)
            }

            const className = `cell cell-${i}-${j}`
            strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})">${currCell}</td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML

    var elBoardContainer = document.querySelector('.board-container')
    elBoardContainer.addEventListener('contextmenu', function (ev) {
        // prevents from default right click happening (contextmenu option)
        ev.preventDefault()
        // 
        var cell = ev.target
        console.log('cell:', cell)
        // array of cell coords
        var cellCoords = cell.className.split('-')

        var i = +cellCoords[1]
        var j = +cellCoords[2]
        onCellMarked(cell, i, j)
    })
}

// called when a cell is clicked
function onCellClicked(elCell, i, j) {


    // if isMarked then dont let left click to work
    if (gBoard[i][j].isMarked) return

    //dont allow clicking revealed cell
    if (gBoard[i][j].isShown === true) return

    // if clicked on mine add to the counter and checkGameOver()
    if (gBoard[i][j].isMine) {
        gGame.minesRevealed++
        checkGameOver()

    }

    //update model
    gBoard[i][j].isShown = true
    gGame.shownCount++

    // update dom
    elCell.classList.add('revealed')
}

// toggle flag with right-clicks on cells
function onCellMarked(elCell, i, j) {

    // dont allow flag on revealed cells
    // if (gBoard[i][j].isShown) return



    // toggle isMarked in the model if right clicked again on the flag
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
    } else {
        gBoard[i][j].isMarked = false
    }



    // // check model to see if isMarked
    // if (gBoard[i][j].isMarked) {
    //     elCell.innerHTML = FLAG
    //     elCell.classList.add('flagged')
    // } else {
    //     // remove flag if !isMarked
    //     elCell.innerHTML = ''
    //     elCell.classList.remove('flagged')

    // check model to see if isMarked WORKS WORKS WORKS WORKS
    if (gBoard[i][j].isMarked) {
        elCell.innerHTML = FLAG
        elCell.classList.add('flagged')
    } else {
        // remove flag if !isMarked
        elCell.innerHTML = ''
        elCell.classList.remove('flagged')
    }
    // check model to see if isMarked WORKS WORKS WORKS WORKS
}

//Game ends when all mines are 
// marked, and all the other cells 
// are shown 
function checkGameOver() {

    if (gGame.minesRevealed > 0) {
        return console.log('gameOver!')
    } else if (gGame.shownCount + gGame.markedCount === gBoard.length - gLevel.MINES) {
        return console.log('gameWON!')
    }

}

// When user clicks a cell with no 
// mines around, we need to open 
// not only that cell, but also its 
// neighbors.  
// NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
// BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below) 
function expandShown(board, elCell, i, j) { }

//resets model and dom
function restartGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = []

    var strHTML = ''
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML

    gLevel = {
        SIZE: 4,
        MINES: 3,
    }

    onInit()
}