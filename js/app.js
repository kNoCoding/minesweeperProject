'use strict'

const ALIVE = '😀'
const WORRIED = '😯'
const COOL = '😎'
const DEAD = '😵'

const MINE = '💣'
const FLAG = '🚩'

const EASY = '👶'
const MEDIUM = '🤨'
const HARD = '🤯'

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

// This is an object in which you can keep and update the current game state
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    minesRevealed: 0,
    secsPassed: 0
}

//This is called when page loads 
function onInit() {
    gBoard = buildBoard()
    gGame.isOn = true
    console.log('gLevel:', gLevel)
    console.log('gGame:', gGame)
    console.log('gBoard:', gBoard)

    // random MINES gen. for manual MINES gen go to after the loop in buildBoard()
    // i might move it to onCellClicked to make the first click never mine
    // setMinesInRandomCells(gBoard)
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
        renderBoard(gBoard)

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
            const className = `cell cell-${i}-${j}-`
            strHTML += `<td class="${className}"
             onclick="onCellClicked(this, ${i}, ${j})">${currCell}</td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML

    // attach the right-click event listener to the board container
    attachRightClickListener()
}


function attachRightClickListener() {
    var elBoardContainer = document.querySelector('.board-container')
    // Remove any existing listener
    elBoardContainer.removeEventListener('contextmenu', handleRightClick)
    // Add a new listener
    elBoardContainer.addEventListener('contextmenu', handleRightClick)
}

function handleRightClick(ev) {
    // Prevents the default right-click menu
    ev.preventDefault()

    // Extract cell coordinates and call onCellMarked
    var cell = ev.target
    var cellCoords = cell.className.split('-')
    // remove the last empty element due to trailing '-'
    cellCoords.pop()

    var i = +cellCoords[1]
    var j = +cellCoords[2]
    onCellMarked(cell, i, j)
}

// called when a cell is clicked
function onCellClicked(elCell, i, j) {

    var cellClicked = { i, j }


    // if game is not on dont let left clicks happen 
    if (!gGame.isOn) return

    // if isMarked then dont let left click to work
    if (gBoard[i][j].isMarked) return

    // dont allow clicking revealed cell
    if (gBoard[i][j].isShown === true) return

    // if clicked on mine add to the counter and checkGameOver()
    if (gBoard[i][j].isMine) {
        console.log('mine clicked')
        ++gGame.minesRevealed
        checkGameOver(cellClicked)
    }

    ///////////////////// TESTING ///////////////
    // maybe this will make the first click never a mine
    if (gGame.shownCount < 1) {

        setMinesInRandomCells(gBoard)
        // gBoard[i][j].isShown = true

        // elCell.classList.add('revealed')

        // gGame.shownCount++
    }
    ///////////////////// TESTING ///////////////

    //works and keep it here testing it for now
    gGame.shownCount++

    //update model
    gBoard[i][j].isShown = true

    // update dom
    elCell.classList.add('revealed')

    var totalCellAmount = gBoard.length ** 2
    /* check if this is a win - 
    this check has to come only AFTER
    gGame.shownCount was raised by 1 */
    if (gGame.minesRevealed === 0 &&
        gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === totalCellAmount - gLevel.MINES) {
        checkGameOver(cellClicked)
    }

    // Cell without neighbors – expand it and its 1st degree neighbors
    if (gBoard[i][j].minesAroundCount === 0) {
        expandShown(gBoard, elCell, i, j)

    }


    if (gGame.shownCount === 1) renderBoard(gBoard)

}

// toggle flag with right-clicks on cells
function onCellMarked(elCell, i, j) {

    var cellClicked = { i, j }
    console.log('elCell:', elCell)
    var elCellValueBeforeFlag
    if (gBoard[i][j].isMine) {
        elCellValueBeforeFlag = MINE
    } else if (!gBoard[i][j].isMine) {
        elCellValueBeforeFlag = gBoard[i][j].minesAroundCount
    }
    console.log('elCellValueBeforeFlag:', elCellValueBeforeFlag)

    // if game is not on dont let left clicks happen 
    if (!gGame.isOn) return

    // dont allow flag on revealed cells - WORKS DONT DELETE
    if (gBoard[i][j].isShown) return

    // toggle isMarked in the model if right clicked again on the flag - WORKS DONT DELETE
    // needs a fix because delets value if was flagged and unflagged
    if (gBoard[i][j].isMarked === false) {
        gBoard[i][j].isMarked = true
    } else {
        gBoard[i][j].isMarked = false
    }

    // HAS ISSUES HAS ISSUES check model to see if isMarked HAS ISSUES HAS ISSUES
    if (gBoard[i][j].isMarked) {
        gGame.markedCount++
        elCell.innerHTML = FLAG
        elCell.classList.add('flagged')
        // check game over for the state when all cells were revealed and only then the flags were added
        checkGameOver(cellClicked)
    } else {
        // remove flag if !isMarked

        gGame.markedCount--

        elCell.classList.remove('flagged')
        elCell.innerHTML = ''
        elCell.innerHTML = elCellValueBeforeFlag

    }

}

// check of the game is won or lost
function checkGameOver(cellClicked) {
    if (gGame.minesRevealed > 0) {
        console.log('gameOver!') // remove this when finished debug
        gameLose(cellClicked)

    } else if (gGame.minesRevealed === 0 && gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === (gBoard.length ** 2) - gLevel.MINES) {
        console.log('gameWon!') // remove this when finished debug
        gameWin()
    }
}

/* this does what needs to happend when you win
like changing to cool smiley
stopping clock
and when clicked restartGame()*/
function gameWin() {

    // change the smiley face to a COOL face for winning
    document.querySelector('.reset-button').innerHTML = COOL
    // switching the game off to make sure you can not click anything on the board anymore
    gGame.isOn = false

    // IN THE FUTURE ADD A STOP TO THE TIMER THAT IS RUNNING
}

// this does what needs to happend when you lose
// like changing the smiley to dead
// revealing all the mines
// make the bg of the exact mine clicked be red 
function gameLose(cellClicked) {

    var allMines = getAllMines(gBoard)
    var firstMineClicked = cellClicked

    for (var i = 0; i < allMines.length; i++) {
        var currMine = allMines[i]
        var currMineIdxI = currMine.i
        var currMineIdxJ = currMine.j
        var elCurrMine = document.querySelector(`.cell-${currMineIdxI}-${currMineIdxJ}-`)

        // update model
        gGame.isOn = false
        // problem with mines revealed when game ends its 4 instead of 3
        gGame.minesRevealed++
        gBoard[currMineIdxI][currMineIdxJ].isShown = true

        // update DOM
        elCurrMine.classList.add('revealed')
        document.querySelector('.reset-button').innerHTML = DEAD

        // make the first mine have red bg
        if (gBoard[currMineIdxI][currMineIdxJ] === gBoard[firstMineClicked.i][firstMineClicked.j]) {
            elCurrMine.classList.add('first-mine')
            gGame.minesRevealed--
        }
    }

}

// When user clicks a cell with no 
// mines around, we need to open 
// not only that cell, but also its 
// neighbors.  
// NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
// BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below) 
function expandShown(board, elCell, rowIdx, colIdx) {

    if (gBoard[rowIdx][colIdx].isMine) return
    console.log('expandShown work\n board:', board)
    console.log('elCell:', elCell)
    console.log('rowIdx:', rowIdx)
    console.log('colIdx:', colIdx)

    var count = 0
    var nonMineNegs = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (!currCell.isMine) nonMineNegs.push({ i, j }), count++
        }
    }
    console.log('non mine negs count:', count)
    console.log('nonMineNegs:', nonMineNegs)

    for (var i = 0; i < nonMineNegs.length; i++) {
        var currNonMineCell = nonMineNegs[i]
        var currIdxI = currNonMineCell.i
        var currIdxJ = currNonMineCell.j
        var elCellSelector = `.cell-${currIdxI}-${currIdxJ}-`
        var elCurrNonMineCell = document.querySelector(elCellSelector)
        console.log('elCellSelector:', elCellSelector)
        console.log('elCurrNonMineCell:', elCurrNonMineCell)
        // console.log('currNonMineCell:', currNonMineCell)
        if (gBoard[currIdxI][currIdxJ].isShown) gGame.shownCount--
        gBoard[currIdxI][currIdxJ].isShown = true
        elCurrNonMineCell.classList.add('revealed')
        gGame.shownCount++

    }
    // gGame.shownCount--
    // renderBoard(board)
}

//resets model and dom
function restartGame() {

    //V//V//V// RESET MODEL //V//V//V//
    //reset level model
    // gLevel = {
    //     SIZE: 4,
    //     MINES: 3,
    // }
    //reset game model
    gGame = {
        // isOn: true,
        shownCount: 0,
        markedCount: 0,
        minesRevealed: 0,
        secsPassed: 0
    }
    //reset board model
    gBoard = []
    //^//^//^// RESET MODEL //^//^//^//

    // // // // RESET DOM ELEMENTS // // //
    //wipe the entire tbody content
    console.log('elBoard Before Restart:', document.querySelector('.board'))
    var strHTML = ''
    const elBoard = document.querySelector('.board')
    console.log('elBoard:', elBoard)
    console.log('strHTML:', strHTML)
    elBoard.innerHTML = strHTML
    // restore the smiley face to normal
    const elResetButton = document.querySelector('.reset-button')
    elResetButton.innerHTML = ALIVE
    // // // // RESET DOM ELEMENTS // // //

    // start the game
    onInit()
}

function showSettings() {
    const elDifficultyButtons = document.querySelector('.difficulty-buttons')
    elDifficultyButtons.classList.remove('hidden')
}

function changeDifficulty(elDifficulty) {
    console.log('elDifficulty:', elDifficulty)

    if (elDifficulty.innerHTML === EASY) gLevel.SIZE = 4, gLevel.MINES = 2
    if (elDifficulty.innerHTML === MEDIUM) gLevel.SIZE = 8, gLevel.MINES = 14
    if (elDifficulty.innerHTML === HARD) gLevel.SIZE = 12, gLevel.MINES = 32

    onInit()
    const elDifficultyButtons = document.querySelector('.difficulty-buttons')
    elDifficultyButtons.classList.add('hidden')
}