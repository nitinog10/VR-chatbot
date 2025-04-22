let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
let responseBox = document.querySelector("#responseBox");

let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";

const API_KEY = "your api key here";

// Hardcoded narration JSON (you can also load this from a file or server)
const narration = {
    "upperlake_past": "Yeh tha Bhopal ka dil, Upper Lake, dus saal pehle...",
    "upperlake_present": "Aaj bhi yeh jheel wahi hai... par ab zyada log...",
    "upperlake_future_bad": "Agar humne paryavaran ka dhyaan nahi rakha...",
    "upperlake_future_good": "Kal agar humne saath milke safai banaye rakha...",
    "bhojpur_past": "Bhojpur Mandir, shilaon mein likha itihaas...",
    "bhojpur_present": "Aaj yahaan log Instagram ke liye aate hain...",
    "bhojpur_future_bad": "Agar humne itihaas ka sammaan nahi kiya...",
    "bhojpur_future_good": "Lekin agar humne itihaas ko jeene ka rasta banaya...",
    "motimasjid_past": "Moti Masjid, ek safed sapna. Dus saal pehle...",
    "motimasjid_present": "Aaj bhi yahaan roshni hai, lekin thoda shor bhi...",
    "motimasjid_future_bad": "Agar humne dharohar ka dhyaan nahi rakha...",
    "motimasjid_future_good": "Magar agar humne is roohani virasat ka samman kiya..."
};

function speak(text) {
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
}

// Check user prompt for any matching key in narration
function matchNarration(prompt) {
    const keywords = prompt.toLowerCase();
    const keys = Object.keys(narration);
    for (let key of keys) {
        if (keywords.includes("upper lake") && key.includes("upperlake") && keywords.includes(key.split("_")[1])) return key;
        if (keywords.includes("bhojpur") && key.includes("bhojpur") && keywords.includes(key.split("_")[1])) return key;
        if ((keywords.includes("moti masjid") || keywords.includes("masjid")) && key.includes("motimasjid") && keywords.includes(key.split("_")[1])) return key;
    }
    return null;
}

async function askGPT(prompt) {
    responseBox.innerText = "Thinking...";

    const matchedKey = matchNarration(prompt);
    if (matchedKey) {
        const reply = narration[matchedKey];
        responseBox.innerText = reply;
        speak(reply);
        return;
    }

    try {
        let response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }]
            })
        });

        let data = await response.json();
        let reply = data.choices[0].message.content.trim();
        responseBox.innerText = reply;
        speak(reply);
    } catch (error) {
        responseBox.innerText = "Sorry, I couldn't connect to OpenAI.";
        speak("Sorry, I couldn't connect to OpenAI.");
        console.error(error);
    }
}

btn.addEventListener("click", () => {
    recognition.start();
    voice.style.display = "block";
    btn.style.display = "none";
});

recognition.onresult = function (event) {
    let transcript = event.results[0][0].transcript;
    content.innerText = "You: " + transcript;
    askGPT(transcript);
    voice.style.display = "none";
    btn.style.display = "flex";
};
