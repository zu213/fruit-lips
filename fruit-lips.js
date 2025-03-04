
const mouthPositions = {
    pos1: ["a", "e", "i"],
    pos2: ["b", "m", "p"],
    pos3: ["c", "d", "g", "k", "n", "s", "t", "x", "y", "z"],
    pos4: ["ch", "sh", "j"],
    pos5: ["ee"],
    pos6: ["f", "v"],
    pos7: ["l"],
    pos8: ["o"],
    pos9: ["q", "w"],
    pos10: ["r"],
    pos11: ["th"],
    pos12: ["u"],
};

const mouthPositionLookup = Object.fromEntries(
    Object.entries(mouthPositions).flatMap(([category, values]) =>
        values.map(value => [value, category])
    )
);

function getMouthPosition(input) {
    return mouthPositionLookup[input.toLowerCase()] || "unknown";
}

const mouthDuration = {
    pos1: 1000,
    pos2: 1000,
    pos3: 1000,
    pos4: 1000,
    pos5: 1000,
    pos6: 1000,
    pos7: 1000,
    pos8: 1000,
    pos9: 1000,
    pos10: 1000,
    pos11: 1000,
    pos12: 1000,

};

function getMouthDuration(input) {
    return mouthDuration[input.toLowerCase()] ?? -1; 
}


addEventListener("DOMContentLoaded", (event) => {
    const startButton = document.getElementById('startButton');
    const outputDiv = document.getElementById('output');

    // Add speech recognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.onstart = () => {
        startButton.textContent = 'Listening...';
    };
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        outputDiv.textContent = transcript;
        textToMouths(transcript)
    };
    recognition.onend = () => {
        startButton.textContent = 'Start Voice Input';
    };

    // Add listeners
    startButton.addEventListener('click', () => {
        recognition.start();
    });

    addMouths();
});

function addMouths() {
    const outputDiv = document.getElementById('images');
    for(var i = 1; i <= 12; i++){
        const img = document.createElement('img')
        img.src = `./mouths/pos${i}.png`
        img.classList.add('mouth-image')
        img.id = `pos${i}`
        if(i == 2){
            img.classList.add('highlighted')
        }
        outputDiv.appendChild(img)
    }
}

function textToMouths(text){
    const sylabbles = textToSyllables(text)
    console.log(sylabbles)
    textToMouths(sylabbles)
}

function textToSyllables(text){
    const sylabbles = []
    for(const letterIndex of text){
        if(letterIndex == ' '){
            continue
        }
        if(letterIndex == text.length - 1){
            sylabbles.push(text[letterIndex])
            continue
        }
        if(text[letterIndex] == 'c' && text[letterIndex] == 'h' ||
            text[letterIndex] == 's' && text[letterIndex] == 'h' ||
            text[letterIndex] == 't' && text[letterIndex] == 'h' ||
            text[letterIndex] == 'e' && text[letterIndex + 1] == 'e'){
                sylabbles.push(text[letterIndex] + text[letterIndex + 1])
                letterIndex++
                continue
        }
        sylabbles.push(text[letterIndex])
    }
    return sylabbles
}

async function syllablesToMouths(sylabbles) {
    const highlightedElements = document.querySelectorAll('.highlighted')
    for(const el of highlightedElements){
        el.classList.remove('highlighted')
    }

    for(const sylabble of sylabbles){
        const pos = getMouthPosition(sylabble);
        const element = document.getElementById(pos);
        element.classList.add('highlighted')
        await sleep(getMouthDuration(pos));
        element.classList.remove('highlighted')
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}