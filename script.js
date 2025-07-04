// Performance-optimized Bruno AI Assistant
class BrunoAssistant {
    constructor() {
        this.elements = {};
        this.isLoading = false;
        this.recognition = null;
        this.responseCache = new Map();
        this.API_KEY = "your api key here"; // Move to environment variable in production
        
        // Hardcoded narration for offline functionality
        this.narration = {
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
        
        this.init();
    }
    
    init() {
        // Cache DOM elements for better performance
        this.cacheElements();
        this.setupEventListeners();
        this.initSpeechRecognition();
        this.hideLoadingScreen();
    }
    
    cacheElements() {
        this.elements = {
            btn: document.querySelector("#btn"),
            content: document.querySelector("#content"),
            voice: document.querySelector("#voice"),
            responseBox: document.querySelector("#responseBox"),
            loadingIndicator: document.querySelector("#loadingIndicator"),
            mainContent: document.querySelector("#mainContent"),
            logo: document.querySelector("#logo")
        };
        
        // Validate required elements
        const requiredElements = ['btn', 'content', 'voice', 'responseBox'];
        requiredElements.forEach(element => {
            if (!this.elements[element]) {
                console.error(`Required element #${element} not found`);
            }
        });
    }
    
    setupEventListeners() {
        if (this.elements.btn) {
            this.elements.btn.addEventListener("click", this.handleButtonClick.bind(this));
        }
        
        // Add keyboard accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                if (document.activeElement === this.elements.btn) {
                    e.preventDefault();
                    this.handleButtonClick();
                }
            }
        });
        
        // Optimize image loading
        this.optimizeImageLoading();
    }
    
    initSpeechRecognition() {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                this.showError("Speech recognition not supported in this browser");
                return;
            }
            
            this.recognition = new SpeechRecognition();
            this.recognition.lang = "en-US";
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            
            this.recognition.onresult = this.handleSpeechResult.bind(this);
            this.recognition.onerror = this.handleSpeechError.bind(this);
            this.recognition.onend = this.handleSpeechEnd.bind(this);
            
        } catch (error) {
            console.error("Failed to initialize speech recognition:", error);
            this.showError("Failed to initialize speech recognition");
        }
    }
    
    optimizeImageLoading() {
        // Intersection Observer for lazy loading optimization
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });
            
            // Observe images with data-src attribute
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    hideLoadingScreen() {
        requestAnimationFrame(() => {
            if (this.elements.loadingIndicator) {
                this.elements.loadingIndicator.style.display = 'none';
            }
            if (this.elements.mainContent) {
                this.elements.mainContent.style.display = 'flex';
            }
        });
    }
    
    handleButtonClick() {
        if (this.isLoading || !this.recognition) return;
        
        try {
            this.recognition.start();
            this.showVoiceIndicator();
        } catch (error) {
            console.error("Failed to start speech recognition:", error);
            this.showError("Failed to start voice recognition");
        }
    }
    
    handleSpeechResult(event) {
        if (event.results && event.results[0]) {
            const transcript = event.results[0][0].transcript.trim();
            this.elements.content.textContent = `You: ${transcript}`;
            this.processUserInput(transcript);
        }
    }
    
    handleSpeechError(event) {
        console.error("Speech recognition error:", event.error);
        this.hideVoiceIndicator();
        
        const errorMessages = {
            'network': 'Network error. Please check your connection.',
            'not-allowed': 'Microphone access denied. Please allow microphone access.',
            'no-speech': 'No speech detected. Please try again.',
            'audio-capture': 'Microphone not found. Please check your microphone.',
            'service-not-allowed': 'Speech service not available.'
        };
        
        const message = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
        this.showError(message);
    }
    
    handleSpeechEnd() {
        this.hideVoiceIndicator();
    }
    
    showVoiceIndicator() {
        if (this.elements.voice && this.elements.btn) {
            this.elements.voice.style.display = "block";
            this.elements.btn.style.display = "none";
        }
    }
    
    hideVoiceIndicator() {
        if (this.elements.voice && this.elements.btn) {
            this.elements.voice.style.display = "none";
            this.elements.btn.style.display = "flex";
        }
    }
    
    async processUserInput(transcript) {
        if (this.isLoading) return;
        
        this.setLoading(true);
        this.elements.responseBox.textContent = "Thinking...";
        
        try {
            // Check cache first
            const cacheKey = transcript.toLowerCase().trim();
            if (this.responseCache.has(cacheKey)) {
                const cachedResponse = this.responseCache.get(cacheKey);
                this.displayResponse(cachedResponse);
                return;
            }
            
            // Check local narration
            const matchedKey = this.matchNarration(transcript);
            if (matchedKey) {
                const response = this.narration[matchedKey];
                this.cacheResponse(cacheKey, response);
                this.displayResponse(response);
                return;
            }
            
            // Call GPT API
            await this.askGPT(transcript, cacheKey);
            
        } catch (error) {
            console.error("Error processing user input:", error);
            this.showError("Sorry, I encountered an error processing your request.");
        } finally {
            this.setLoading(false);
        }
    }
    
    matchNarration(prompt) {
        const keywords = prompt.toLowerCase();
        const keys = Object.keys(this.narration);
        
        for (let key of keys) {
            const [location, timeframe] = key.split("_");
            if (keywords.includes("upper lake") && location === "upperlake" && keywords.includes(timeframe)) return key;
            if (keywords.includes("bhojpur") && location === "bhojpur" && keywords.includes(timeframe)) return key;
            if ((keywords.includes("moti masjid") || keywords.includes("masjid")) && location === "motimasjid" && keywords.includes(timeframe)) return key;
        }
        return null;
    }
    
    async askGPT(prompt, cacheKey) {
        // Debounced API call to prevent spam
        if (this.gptCallTimeout) {
            clearTimeout(this.gptCallTimeout);
        }
        
        return new Promise((resolve, reject) => {
            this.gptCallTimeout = setTimeout(async () => {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
                    
                    const response = await fetch("https://api.openai.com/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${this.API_KEY}`
                        },
                        body: JSON.stringify({
                            model: "gpt-3.5-turbo",
                            messages: [{ role: "user", content: prompt }],
                            max_tokens: 150,
                            temperature: 0.7
                        }),
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) {
                        throw new Error(`API Error: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    const reply = data.choices[0]?.message?.content?.trim();
                    
                    if (reply) {
                        this.cacheResponse(cacheKey, reply);
                        this.displayResponse(reply);
                    } else {
                        throw new Error("Invalid API response");
                    }
                    
                    resolve();
                } catch (error) {
                    if (error.name === 'AbortError') {
                        this.showError("Request timed out. Please try again.");
                    } else {
                        this.showError("Sorry, I couldn't connect to the AI service.");
                    }
                    console.error("GPT API Error:", error);
                    reject(error);
                }
            }, 300); // 300ms debounce
        });
    }
    
    displayResponse(text) {
        this.elements.responseBox.textContent = text;
        this.speak(text);
    }
    
    speak(text) {
        try {
            // Cancel any ongoing speech
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-IN";
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            
            // Error handling for speech synthesis
            utterance.onerror = (event) => {
                console.error("Speech synthesis error:", event.error);
            };
            
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error("Speech synthesis failed:", error);
        }
    }
    
    cacheResponse(key, response) {
        // Limit cache size to prevent memory issues
        if (this.responseCache.size >= 50) {
            const firstKey = this.responseCache.keys().next().value;
            this.responseCache.delete(firstKey);
        }
        this.responseCache.set(key, response);
    }
    
    setLoading(isLoading) {
        this.isLoading = isLoading;
        if (this.elements.btn) {
            this.elements.btn.disabled = isLoading;
            document.body.classList.toggle('loading', isLoading);
        }
    }
    
    showError(message) {
        if (this.elements.responseBox) {
            this.elements.responseBox.textContent = message;
            this.elements.responseBox.classList.add('error');
            
            // Remove error class after 3 seconds
            setTimeout(() => {
                this.elements.responseBox.classList.remove('error');
            }, 3000);
        }
        
        // Speak error message
        this.speak(message);
    }
}

// Initialize the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new BrunoAssistant());
} else {
    new BrunoAssistant();
}
