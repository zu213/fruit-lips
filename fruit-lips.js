
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
};

const mouthPositionLookup = Object.fromEntries(
    Object.entries(mouthPositions).flatMap(([category, values]) =>
        values.map(value => [value, category])
    )
);

function getMouthPosition(input) {
    return mouthPositionLookup[input.toLowerCase()] || "0";
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

};

function getMouthDuration(input) {
    return mouthDuration[input.toLowerCase()] ?? -1; 
}


addEventListener("DOMContentLoaded", (event) => {
    const startButton = document.getElementById('startButton');
    const outputDiv = document.getElementById('output');
    var listening = false
    var result = '';
    // Add speech recognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => {
        startButton.textContent = 'Listening...Click to finish';
        listening = true;
    };
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        result = transcript
        outputDiv.innerText = transcript
    };
    recognition.onend = () => {
        listening = false;
        startButton.textContent = 'Start Voice Input';
    };
    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
    };

    function toggleListening() {
        if(!listening){
            result = '';
            recognition.start()
        }
        else{
            recognition.stop();
            addOutputSyllables(textToSyllables(result))
            textToMouths(result)
        }
    }

    // Add listeners
    startButton.addEventListener('click', () => {
        toggleListening()
    });
    

    document.getElementById("textForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent page refresh
        let inputText = document.getElementById("textInput").value;
        addOutputSyllables(textToSyllables(inputText))
        textToMouths(inputText)
        const el = document.getElementById('textInput')
        el.value = ''
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
    const syllables = textToSyllables(text)
    console.log(syllables)
    syllablesToMouths(syllables)
}

function textToSyllables(text){
    const sylabbles = []
    for(var i = 0; i < text.length; i++){
        const letter = text.charAt(i)
        if(letter == ' '){
            sylabbles.push(' ')
            continue
        }
        const nextLetter = text.charAt(i + 1)

        if(i == text.length - 1){
            sylabbles.push(letter)
            continue
        }
        if(letter == 'c' && nextLetter == 'h' ||
            letter == 's' && nextLetter == 'h' ||
            letter == 't' && nextLetter == 'h' ||
            letter == 'e' && nextLetter == 'e'){
                sylabbles.push(letter + nextLetter)
                i++
                continue
        }
        sylabbles.push(letter)
    }
    return sylabbles
}

async function syllablesToMouths(sylabbles) {
    const highlightedElements = document.querySelectorAll('.highlighted')
    for(const el of highlightedElements){
        el.classList.remove('highlighted')
    }

    var counter = 0;
    for(const sylabble of sylabbles){
        const pos = getMouthPosition(sylabble);
        if(pos == '0'){
            continue
        }
        const element = document.getElementById(pos);
        const wordElement = document.getElementById(`syllable-${counter}`)
        element.classList.add('highlighted')
        wordElement.classList.add('embold')

        await sleep(getMouthDuration(pos));
        element.classList.remove('highlighted')
        wordElement.classList.remove('embold')
        counter++;
    }

    for(const el of highlightedElements){
        el.classList.add('highlighted')
    }
}

function addOutputSyllables(syllables){
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = ''
    var counter = 0;
    console.log(syllables)
    for(const syllable of syllables){
        const el = document.createElement('div')
        el.classList.add('inline-syllable')
        el.id = `syllable-${counter}`
        el.innerText = syllable
        if(syllable == ' '){
            el.innerText = '\u00A0'
        }
        outputDiv.appendChild(el)
        counter++;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}