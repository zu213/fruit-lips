// Mouth positions mappings
const mouthPositions = {
    pos1: ["a", "e", "i"],
    pos2: ["b", "m", "p"," "],
    pos3: ["c", "d", "g", "k", "n", "s", "t", "x", "y", "z", "h"],
    pos4: ["ch", "sh", "j"],
    pos5: ["ee"],
    pos6: ["f", "v"],
    pos7: ["l"],
    pos8: ["o"],
    pos9: ["q", "w"],
    pos10: ["r"],
    pos11: ["th"],
    pos12: ["u"],
}

var recognition

const mouthPositionLookup = Object.fromEntries(
    Object.entries(mouthPositions).flatMap(([category, values]) =>
        values.map(value => [value, category])
    )
)

function getMouthPosition(input) {
    return mouthPositionLookup[input.toLowerCase()] || 0
}

const mouthDuration = {
    pos1: 200,
    pos2: 150,
    pos3: 150,
    pos4: 250,
    pos5: 200,
    pos6: 150,
    pos7: 150,
    pos8: 200,
    pos9: 150,
    pos10: 150,
    pos11: 250,
    pos12: 200,
}

function getMouthDuration(input) {
    return mouthDuration[input.toLowerCase()] ?? -1
}

function postInputToBoard(inputText) {
    fetch("https://apple-interface.vercel.app/api/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            value: inputText
        })
    })
    .catch(err => console.error(err))
}

function fetchBoard() {
    return fetch("https://apple-interface.vercel.app/api/list")
    .then(res => res.json())
}

function prependBoardItem(text) {
    const boardDiv = document.querySelector('.board-list')
    const total = boardDiv.querySelectorAll('.board-item').length + 1
    const el = document.createElement('div')
    el.classList.add('board-item')
    el.innerHTML = `<span class="board-num">${total}.</span> ${text}`
    boardDiv.insertBefore(el, boardDiv.firstChild)
    // renumber all existing items after prepend
    boardDiv.querySelectorAll('.board-item').forEach((item, i) => {
        item.querySelector('.board-num').textContent = `${i + 1}.`
    })
}

function populateBoard() {
    const boardDiv = document.querySelector('.board-list')
    fetchBoard().then(items => {
        items.reverse()
        const processedItems = items.map((item, i) => `<div class="board-item"><span class="board-num">${i + 1}.</span> ${item}</div>`)
        boardDiv.innerHTML = processedItems.join('')
        document.querySelector('.board').classList.remove('hidden')
    })
}

// Main setup
addEventListener("DOMContentLoaded", function() {
    const outputDiv = document.getElementById('output')
    var result = ''

    document.getElementById("textForm").addEventListener("submit", function(event) {
        event.preventDefault()
        let inputText = document.getElementById("textInput").value
        const syllables = textToSyllables(inputText)
        postInputToBoard(inputText)
        prependBoardItem(inputText)
        addOutputSyllables(syllables)
        syllablesToMouths(syllables)
        const el = document.getElementById('textInput')
        el.value = ''
    })

    addMouths()

    populateBoard()
})

// add the mouths to the screen
function addMouths() {
    const outputDiv = document.getElementById('images')
    for(var i = 1; i <= 12; i++){
        const img = document.createElement('img')
        img.src = `./mouths/pos${i}.png`
        img.classList.add('mouth-image')
        img.classList.add('hidden')
        img.id = `pos${i}`
        if(i == 2){
            img.classList.add('highlighted')
            img.classList.remove('hidden')
        }
        outputDiv.appendChild(img)
    }
}

//comvert text to syllable lists
function textToSyllables(text){
    const syllables = []
    for(var i = 0; i < text.length; i++){
        const letter = text.charAt(i)
        const nextLetter = text.charAt(i + 1)

        if(i == text.length - 1){
            syllables.push(letter)
            continue
        } else if(letter == 'c' && nextLetter == 'h' ||
            letter == 's' && nextLetter == 'h' ||
            letter == 't' && nextLetter == 'h' ||
            letter == 'e' && nextLetter == 'e'){
                syllables.push(letter + nextLetter)
                i++
                continue
        }
        syllables.push(letter)
    }
    return syllables
}

async function syllablesToMouths(syllables) {
    const highlightedElements = document.querySelectorAll('.highlighted')
    for(const el of highlightedElements){
        el.classList.remove('highlighted')
        el.classList.add('hidden')
    }

    var counter = 0
    for(const syllable of syllables){
        const pos = getMouthPosition(syllable)
        if(pos == 0) continue
        const element = document.getElementById(pos)
        const wordElement = document.getElementById(`syllable-${counter}`)
        element.classList.add('highlighted')
        element.classList.remove('hidden')
        wordElement.classList.add('embold')
        const outputBox = document.getElementById('output')
        const boxWidth = outputBox.clientWidth
        if(outputBox.scrollWidth > boxWidth) {
            let wordLeft = 0
            let el = wordElement
            while(el && el !== outputBox) {
                wordLeft += el.offsetLeft
                el = el.offsetParent
            }
            outputBox.scrollLeft = wordLeft - (boxWidth / 2) + (wordElement.offsetWidth / 2)
        }

        await sleep(getMouthDuration(pos))
        element.classList.remove('highlighted')
        element.classList.add('hidden')
        wordElement.classList.remove('embold')
        counter++
    }

    for(const el of highlightedElements){
        el.classList.add('highlighted')
        el.classList.remove('hidden')
    }
}

function addOutputSyllables(syllables){
    const outputDiv = document.getElementById('output')
    outputDiv.innerHTML = ''
    var counter = 0
    for(const syllable of syllables){
        const el = document.createElement('div')
        el.classList.add('inline-syllable')
        el.id = `syllable-${counter}`
        el.innerText = syllable
        if(syllable == ' ') el.innerText = '\u00A0'
        outputDiv.appendChild(el)
        counter++
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}