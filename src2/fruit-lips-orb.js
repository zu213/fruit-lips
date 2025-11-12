

// Mouth positions mappings
const mouthPositions = {
    pos1: ["a", "e", "i"],
    pos2: ["b", "m", "p"," "],
    pos3: ["c", "d", "g", "k", "n", "s", "t", "x", "y", "z", "h"],
    pos4: ["ch", "sh", "j"],
    pos5: ["ee"], // this is messed up
    pos6: ["f", "v"],
    pos7: ["l"],
    pos8: ["o"],
    pos9: ["q", "w"],
    pos10: ["r"],
    pos11: ["th"],
    pos12: ["u"],
}

var recognition
var orbsData

const mouthPositionLookup = Object.fromEntries(
    Object.entries(mouthPositions).flatMap(([category, values]) =>
        values.map(value => [value, category])
    )
)

function getMouthPosition(input) {
    return mouthPositionLookup[input.toLowerCase()] || 0
}

const mouthDuration = {
    pos1: 120,   // a,e,i - short vowels, quick
    pos2: 80,    // b,m,p - explosive consonants, very fast
    pos3: 100,   // c,d,g,k,n,s,t,x,y,z,h - quick consonants
    pos4: 180,   // ch,sh,j - longer consonants with friction
    pos5: 160,   // ee - sustained vowel
    pos6: 120,   // f,v - fricatives, medium speed
    pos7: 100,   // l - quick liquid consonant
    pos8: 180,   // o - rounded vowel, slightly longer
    pos9: 140,   // q,w - semi-vowels
    pos10: 110,  // r - liquid consonant
    pos11: 150,  // th - fricative, needs time
    pos12: 180,  // u - rounded vowel, sustained
}

const connectedNodes = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12], [0,25],[12,32],
    [13,14],[14,15],[15,16],[16,17],[17,18],
    [19,20],[20,21],[21,22],[22,23],[23,24],
    [25,26],[26,27],[27,28],[28,29],[29,30],[30,31],[31,32]
]

function getMouthDuration(input) {
    return mouthDuration[input.toLowerCase()] ?? -1
}

// Main setup
addEventListener("DOMContentLoaded", async function() {
    const startButton = document.getElementById('startButton')
    const outputDiv = document.getElementById('output')
    var listening = false
    var result = ''
    let inactivityTimer

    orbsData = await (await fetch('./mouth-orbs.json')).json();

    // Add speech recognition
    if(window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)()
        recognition.lang = 'en-US'
        recognition.continuous = true
        recognition.interimResults = true
        recognition.onstart = () => {
            startButton.textContent = 'Listening...Click to finish'
            listening = true
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            result = transcript
            outputDiv.innerText = transcript
            clearTimeout(inactivityTimer)
            inactivityTimer = setTimeout(toggleListening, 1000)
        };
        recognition.onend = () => {
            listening = false
            startButton.textContent = 'Start Voice Input'
        };
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error)
        };

        // Add listeners
        startButton.addEventListener('click', () => {
            toggleListening()
        });
    } else {
        console.log('Invalid browser for speech recognition')
    }
    

    document.getElementById("textForm").addEventListener("submit", function(event) {
        event.preventDefault()
        let inputText = document.getElementById("textInput").value
        const syllables = textToSyllables(inputText)
        addOutputSyllables(syllables)
        syllablesToMouths(syllables)
        const el = document.getElementById('textInput')
        el.value = ''
    });

    // helper functions
    function toggleListening() {
        if(!recognition) return
        if(!listening){
            result = '';
            recognition.start()
        }
        else {
            if(inactivityTimer) clearTimeout(inactivityTimer);
            recognition.stop();
            const syllables = textToSyllables(result)
            addOutputSyllables(syllables)
            syllablesToMouths(syllables)
        }
    }

    addMouths();
});

// add the mouths to the screen
function addMouths() {
    const outputDiv = document.getElementById('images')

    // Orbs 0-12: Top outer lip (12 points)
    // Orbs 13-18: Upper inner lip (6 points)
    // Orbs 19-24: Lower inner lip (6 points)
    // Orbs 25-31: Bottom outer lip (7 points)
    var counter = 0
    for(const coords of orbsData['pos2']){
        const orb = document.createElement('div')
        orb.classList.add('orb')
        orb.classList.add(`orb-${counter}`)
        document.documentElement.style.setProperty(`--orb-${counter}-x`, `${coords['x'] + 3}rem`);
        document.documentElement.style.setProperty(`--orb-${counter}-y`, `${coords['y'] + 1}rem`);

        if (counter < 13) {
            orb.classList.add('top-lip-outer')
        } else if(counter < 19) {
            orb.classList.add('top-lip-inner')
        } else if(counter < 25) {
            orb.classList.add('bottom-lip-inner')
        } else {
            orb.classList.add('bottom-lip-outer')
        }
        outputDiv.appendChild(orb)

        counter++
    }

    for(const connectedNode of connectedNodes){
        const connector = document.createElement('div')
        console.log(connectedNode)
        connector.classList.add('connector')
        connector.classList.add(`connector-${connectedNode[0]}-${connectedNode[1]}`)
        outputDiv.appendChild(connector)
        updateConnector(connectedNode[0] , connectedNode[1])
    }

    resetMouth()
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
    var counter = 0
    for(const syllable of syllables){
        const pos = getMouthPosition(syllable);
        if(pos == 0) continue
        var orbCounter = 0
        for(const coords of orbsData[pos]){
            document.documentElement.style.setProperty(`--orb-${orbCounter}-x`, `${coords['x'] + 3}rem`);
            document.documentElement.style.setProperty(`--orb-${orbCounter}-y`, `${coords['y'] + 1}rem`);
            orbCounter++
        }

        updateAllConnectors()

        const wordElement = document.getElementById(`syllable-${counter}`)
        wordElement.classList.add('embold')
        await sleep(getMouthDuration(pos))
        wordElement.classList.remove('embold')
        counter++
    }
    resetMouth()
}

function resetMouth() {
    var orbCounter = 0
    for(const coords of orbsData['pos2']){
        document.documentElement.style.setProperty(`--orb-${orbCounter}-x`, `${coords['x'] + 3}rem`);
        document.documentElement.style.setProperty(`--orb-${orbCounter}-y`, `${coords['y'] + 1}rem`);
        orbCounter++
    }

    updateAllConnectors()
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
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateConnector(orb1, orb2) {
    
    // Orbs 0-11: Top outer lip (12 points)
    // Orbs 12-18: Upper inner lip (7 points)
    // Orbs 19-24: Lower inner lip (6 points)
    // Orbs 25-31: Bottom outer lip (7 points)
    if ((orb1 == 12 && orb2 == 13) ||
        (orb1 == 18 && orb2 == 19) ||
        (orb1 == 24 && orb2 == 25)) {
            return
    }


    const style = getComputedStyle(document.documentElement);

    // Get values in rem
    const x1Rem = parseFloat(style.getPropertyValue(`--orb-${orb1}-x`));
    const y1Rem = parseFloat(style.getPropertyValue(`--orb-${orb1}-y`));
    const x2Rem = parseFloat(style.getPropertyValue(`--orb-${orb2}-x`));
    const y2Rem = parseFloat(style.getPropertyValue(`--orb-${orb2}-y`));

    // Convert rem to px (1rem = 16px by default, but get actual value)
    const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const x1 = x1Rem * remSize;
    const y1 = y1Rem * remSize;
    const x2 = x2Rem * remSize;
    const y2 = y2Rem * remSize;

    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    document.documentElement.style.setProperty(`--connector-${orb1}-${orb2}-length`, `${length}px`);
    document.documentElement.style.setProperty(`--connector-${orb1}-${orb2}-angle`, `${angle}deg`);
}

function updateAllConnectors() {
    for(const connectedNode of connectedNodes){
        updateConnector(connectedNode[0] , connectedNode[1])
    }
}