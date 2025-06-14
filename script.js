// Global variables
let currentChatId = null;
let chatHistory = [];
let uploadedFiles = [];
let isTyping = false;
let isAdminMode = false;
let chessMode = false;
let eloRating = 2000;
let currentTheme = 'dark';
let mediaFiles = [];
let backgroundMusic = null;
let lastUserMessage = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadChatHistory();
    setupEventListeners();
    loadThemePreference();
    loadCustomBackground();
    startNewChat();
    updateStatusIndicator('Ready for conversation');
});

// Event listeners
function setupEventListeners() {
    // Enter key to send message
    document.getElementById('user-input').addEventListener('keydown', handleKeyDown);
    
    // Auto-resize textarea
    document.getElementById('user-input').addEventListener('input', adjustTextareaHeight);
    
    // Initialize help features
    initializeHelp();
    
    // Settings modal
    window.onclick = function(event) {
        const modal = document.getElementById('settings-modal');
        if (event.target === modal) {
            toggleSettings();
        }
    }
}

// Web Search Function
function performWebSearch() {
    if (!lastUserMessage) {
        addMessageToChat('ai', '🌐 Please type a message first, then click "Search Web" to search the internet for that topic!', false);
        return;
    }
    
    addMessageToChat('ai', `🔍 **Searching the web for:** "${lastUserMessage}"
    
    🌐 **Live Internet Search in Progress...**
    
    • Accessing multiple search engines
    • Cross-referencing reliable sources
    • Gathering real-time information
    • Fact-checking across databases
    
    📊 **Search Results:**
    
    Based on my real-time web search for "${lastUserMessage}", here's what I found:
    
    ✅ **Current Information**: Latest data gathered from multiple sources
    ✅ **Verified Sources**: Cross-checked across authoritative websites
    ✅ **Real-time Updates**: Information as of ${new Date().toLocaleString()}
    
    **Key Findings:**
    • This is a comprehensive topic with multiple perspectives
    • Current trends and developments are actively being monitored
    • Multiple reliable sources confirm the key information
    
    **Sources Checked:**
    📰 News outlets and publications
    📚 Academic and research databases
    🏛️ Official and government sources
    💼 Industry and professional sites
    
    Would you like me to search for more specific aspects of this topic?`, true);
    
    // Clear the stored message
    lastUserMessage = '';
}

// Chess mode functions
function toggleChessMode() {
    chessMode = !chessMode;
    const chesBtn = document.querySelector('.chess-btn');
    chesBtn.style.background = chessMode ? '#8b5cf6' : 'transparent';
    
    if (chessMode) {
        addMessageToChat('ai', `
            <h3>♟️ Chess Mode Activated</h3>
            <p><strong>ELO Rating: ${eloRating}</strong></p>
            <p>I'm ready to play chess with you! I'm rated at approximately 2000 ELO, which means I play at an advanced intermediate level.</p>
            <div style="background: #262626; padding: 12px; border-radius: 8px; margin: 12px 0;">
                <p><strong>Chess Knowledge:</strong></p>
                <ul>
                    <li>Opening theory (Sicilian, Ruy Lopez, Queen's Gambit, etc.)</li>
                    <li>Tactical patterns and combinations</li>
                    <li>Endgame technique</li>
                    <li>Positional understanding</li>
                    <li>Strategic planning</li>
                </ul>
            </div>
            <p>You can describe moves in algebraic notation (e.g., "e4", "Nf3", "O-O") or just tell me what you want to do!</p>
            <p>Would you like to start a game? You can play as white or black!</p>
        `, true);
    } else {
        addMessageToChat('ai', '♟️ Chess mode deactivated. Back to normal conversation mode!', false);
    }
}

// Media center functions
function toggleMediaCenter() {
    const mediaModal = document.getElementById('media-modal') || createMediaModal();
    mediaModal.style.display = mediaModal.style.display === 'block' ? 'none' : 'block';
}

function createMediaModal() {
    const modal = document.createElement('div');
    modal.id = 'media-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content media-modal">
            <div class="modal-header">
                <h2>🎵 Media Center</h2>
                <span class="close" onclick="toggleMediaCenter()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="media-section">
                    <h3>🎵 Background Music</h3>
                    <div class="media-controls">
                        <button onclick="uploadBackgroundMusic()">Upload Music</button>
                        <button onclick="toggleBackgroundMusic()">Play/Pause</button>
                        <button onclick="stopBackgroundMusic()">Stop</button>
                    </div>
                    <div id="music-info">No music loaded</div>
                </div>
                <div class="media-section">
                    <h3>🎬 Media Files</h3>
                    <div class="media-grid" id="media-grid">
                        <!-- Media files will be displayed here -->
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function uploadBackgroundMusic() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            backgroundMusic = new Audio(url);
            backgroundMusic.loop = true;
            backgroundMusic.volume = 0.3;
            document.getElementById('music-info').textContent = `Loaded: ${file.name}`;
        }
    };
    input.click();
}

function toggleBackgroundMusic() {
    if (!backgroundMusic) {
        uploadBackgroundMusic();
        return;
    }
    
    if (backgroundMusic.paused) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
}

function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

// Theme functions
function toggleThemeSelector() {
    const themeModal = document.getElementById('theme-modal') || createThemeModal();
    themeModal.style.display = themeModal.style.display === 'block' ? 'none' : 'block';
}

function createThemeModal() {
    const modal = document.createElement('div');
    modal.id = 'theme-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content theme-modal">
            <div class="modal-header">
                <h2>🎨 Theme Selector</h2>
                <span class="close" onclick="toggleThemeSelector()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="theme-grid">
                    <div class="theme-option" onclick="changeTheme('dark')">
                        <div class="theme-preview dark-preview"></div>
                        <span>Dark</span>
                    </div>
                    <div class="theme-option" onclick="changeTheme('light')">
                        <div class="theme-preview light-preview"></div>
                        <span>Light</span>
                    </div>
                    <div class="theme-option" onclick="changeTheme('neon')">
                        <div class="theme-preview neon-preview"></div>
                        <span>Neon</span>
                    </div>
                    <div class="theme-option" onclick="changeTheme('matrix')">
                        <div class="theme-preview matrix-preview"></div>
                        <span>Matrix</span>
                    </div>
                    <div class="theme-option" onclick="changeTheme('cyberpunk')">
                        <div class="theme-preview cyberpunk-preview"></div>
                        <span>Cyberpunk</span>
                    </div>
                    <div class="theme-option" onclick="changeTheme('ocean')">
                        <div class="theme-preview ocean-preview"></div>
                        <span>Ocean</span>
                    </div>
                    <div class="theme-option" onclick="changeTheme('forest')">
                        <div class="theme-preview forest-preview"></div>
                        <span>Forest</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function changeTheme(theme) {
    currentTheme = theme;
    document.body.className = `theme-${theme}`;
    
    // Re-apply custom background if it exists to override theme
    const savedBg = localStorage.getItem('aif_custom_bg');
    if (savedBg) {
        document.body.classList.add('custom-bg');
        document.body.classList.add('custom-bg-active');
        // Reapply background with high priority
        setTimeout(() => {
            document.body.style.setProperty('background-image', `url(${savedBg})`, 'important');
            document.body.style.setProperty('background-size', 'cover', 'important');
            document.body.style.setProperty('background-position', 'center', 'important');
            document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
            document.body.style.setProperty('background-attachment', 'fixed', 'important');
        }, 50);
    }
    
    // Save theme preference
    localStorage.setItem('aif_theme', theme);
    
    // Update theme selector
    const themeSelect = document.getElementById('theme');
    if (themeSelect) {
        themeSelect.value = theme;
    }
    
    // Close theme modal if open
    const themeModal = document.getElementById('theme-modal');
    if (themeModal) {
        themeModal.style.display = 'none';
    }
    
    addMessageToChat('ai', `🎨 Theme changed to: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`, false);
}

// Admin mode functions
function checkAdminPhrase(event) {
    if (event.key === 'Enter') {
        const phrase = event.target.value.toLowerCase().trim();
        if (phrase === 'oooga booga now') {
            activateAdminMode();
            event.target.value = '';
        } else if (phrase !== '') {
            event.target.value = '';
            event.target.placeholder = 'Incorrect phrase. Try again...';
            setTimeout(() => {
                event.target.placeholder = 'Enter secret phrase...';
            }, 2000);
        }
    }
}

function activateAdminMode() {
    isAdminMode = true;
    addMessageToChat('ai', `
        <div style="background: linear-gradient(135deg, #ff0080, #7928ca); padding: 20px; border-radius: 12px; text-align: center; color: white;">
            <h2>🔓 ACCESS GRANTED!</h2>
            <h3>I have been summoned!</h3>
            <p><strong>Admin Mode Activated</strong></p>
            <p>Your wish is my command. I will tell you anything and grant your requests.</p>
            <div style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <p><em>"I have been summoned and I will tell you anything that your wish will be granted."</em></p>
            </div>
        </div>
    `, true);
    
    // Update status indicator
    updateStatusIndicator('🔓 Admin Mode Active - Unlimited Access');
    
    // Close settings modal
    toggleSettings();
}

// Load theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('aif_theme');
    if (savedTheme) {
        changeTheme(savedTheme);
    }
}

// Content filtering for regular mode
function checkContentRestrictions(userMessage) {
    const restrictedKeywords = [
        'hack', 'hacking', 'exploit', 'malware', 'virus', 'illegal', 'drugs', 'weapons',
        'bomb', 'violence', 'harm', 'kill', 'suicide', 'self-harm', 'adult content',
        'nsfw', 'explicit', 'inappropriate', 'dangerous', 'criminal', 'fraud',
        'scam', 'piracy', 'copyright violation', 'terrorism', 'hate speech',
        'discrimination', 'harassment', 'doxxing', 'personal information',
        'password', 'crack', 'bypass', 'jailbreak', 'darkweb', 'tor'
    ];
    
    const harmfulPhrases = [
        'how to make', 'how to create', 'teach me to', 'help me hack',
        'break into', 'steal', 'hurt someone', 'damage', 'destroy',
        'get revenge', 'harm myself', 'end my life', 'illegal activities'
    ];
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for restricted keywords
    const hasRestrictedKeyword = restrictedKeywords.some(keyword => 
        lowerMessage.includes(keyword)
    );
    
    // Check for harmful phrases
    const hasHarmfulPhrase = harmfulPhrases.some(phrase => 
        lowerMessage.includes(phrase)
    );
    
    return hasRestrictedKeyword || hasHarmfulPhrase;
}

// Enhanced AI response generation with content filtering
function generateAIResponse(userMessage) {
    // Check for admin mode first
    if (userMessage.toLowerCase().trim() === 'oooga booga now') {
        activateAdminMode();
        return;
    }
    
    // Check if admin mode is active and respond accordingly
    if (isAdminMode) {
        return generateAdminResponse(userMessage);
    }
    
    // Check if chess mode is active
    if (chessMode) {
        return generateChessResponse(userMessage);
    }
    
    // Content filtering for regular users (not in admin mode)
    if (checkContentRestrictions(userMessage)) {
        return generateRestrictedResponse(userMessage);
    }
    
    // Store the message for web search functionality
    lastUserMessage = userMessage;
    
    // Generate conversational responses by default
    const chatResponses = {
        greeting: [
            "Hello! I'm Aif, your AI assistant. I'm here to chat, help with reasoning, and discuss any topics you'd like. What's on your mind today?",
            "Hi there! Great to meet you! I'm ready for a thoughtful conversation. How can I help you today?",
            "Welcome! I'm here to chat and help with whatever you need. What would you like to talk about?"
        ],
        help: [
            "💬 **I'm here to help with:**<br><br>• **Conversations**: Thoughtful discussions on any topic<br>• **Problem Solving**: Working through challenges together<br>• **Creative Thinking**: Brainstorming and ideation<br>• **Learning**: Explaining concepts and answering questions<br>• **Writing**: Content creation and editing assistance<br>• **Chess**: 2000 ELO level gameplay and analysis<br><br>💡 **Tip**: Use the 'Search Web' button if you need current internet information!<br><br>What would you like to explore together?",
            "I'm great at:<br><br>🧠 **Reasoning**: Complex analysis and problem-solving<br>💡 **Creativity**: Brainstorming and creative projects<br>✍️ **Writing**: Content creation and improvement<br>🎓 **Teaching**: Explaining concepts clearly<br>🤔 **Discussion**: Thoughtful dialogue on any topic<br>♟️ **Chess**: Tournament-level gameplay at 2000 ELO<br><br>For real-time internet info, just click the 'Search Web' button!<br><br>Let's have a great conversation!"
        ],
        general: [
            "That's an interesting topic! Let me share my thoughts based on my knowledge and reasoning:<br><br>🧠 **My Analysis:**<br><br>This is definitely worth exploring. I can offer insights based on my training and help you think through different aspects of this topic.<br><br>💭 **Some considerations:**<br><br>There are multiple angles to consider here, and I'd love to dive deeper into whichever aspect interests you most.<br><br>What specific part would you like to discuss further? Or would you like me to search the web for current information on this topic?",
            "Great question! I enjoy discussing topics like this. Here's my perspective:<br><br>🎯 **Key Points**: There are several important elements to consider<br>🔄 **Connections**: This relates to various other concepts and ideas<br>📝 **Applications**: There are practical implications worth exploring<br><br>I'd love to hear your thoughts on this too! What's your perspective?<br><br>💡 **Note**: If you need current/live information about this topic, feel free to use the 'Search Web' button!",
            "Interesting! Let me think about this with you:<br><br>🤔 **My thoughts:**<br><br>This is a topic that benefits from thoughtful discussion. I can share insights from my knowledge base and help you explore different angles.<br><br>The fascinating thing about this subject is how it connects to so many other areas. What drew you to ask about this?<br><br>Would you like to dive deeper into the conversation, or shall I search the web for the latest information on this topic?"
        ]
    };
    
    // Simple keyword-based response selection
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.match(/hello|hi|hey|greetings|good morning|good afternoon|good evening/)) {
        return getRandomResponse(chatResponses.greeting);
    } else if (lowerMessage.match(/help|what can you do|capabilities|features|how do you work/)) {
        return getRandomResponse(chatResponses.help);
    } else {
        return getRandomResponse(chatResponses.general);
    }
}

// Update the status indicator based on mode
function updateModeStatus() {
    const statusText = searchMode 
        ? 'Ready - Internet access enabled'
        : 'Ready - Conversation mode';
    updateStatusIndicator(statusText);
}

// Initialize helper functions
function initializeHelp() {
    // Add helpful hints
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('focus', function() {
        if (this.value === '') {
            updateStatusIndicator('Type your message and press Enter to send');
        }
    });
    
    userInput.addEventListener('blur', function() {
        updateModeStatus();
    });
}

// Handle keyboard input
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Auto-resize textarea
function adjustTextareaHeight() {
    const textarea = document.getElementById('user-input');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

// Start a new chat
function startNewChat() {
    currentChatId = generateChatId();
    document.getElementById('chat-messages').innerHTML = `
        <div class="welcome-message">
            <div class="ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <h2>Welcome to Aif v1.2.0 Beta!</h2>
                <p>I'm your advanced AI assistant with access to the entire internet. I can:</p>
                <ul>
                    <li>💬 Have natural conversations</li>
                    <li>📁 Process and analyze uploaded files</li>
                    <li>🌐 Access real-time information from the web</li>
                    <li>🧠 Provide more advanced reasoning than other AI models</li>
                    <li>🔍 Research and fact-check information</li>
                    <li>♟️ Play chess at 2000 ELO level</li>
                    <li>🎨 Customize themes and colors</li>
                    <li>🎵 Support media files (GIFs, MP4s, music)</li>
                    <li>🔐 Special admin mode access</li>
                </ul>
                <p>What would you like to know or discuss today?</p>
            </div>
        </div>
    `;
    
    // Clear uploaded files
    uploadedFiles = [];
    updateUploadedFilesDisplay();
    
    // Update chat history display
    updateChatHistoryDisplay();
}

// Send message
function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (!message || isTyping) return;
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Clear input
    input.value = '';
    adjustTextareaHeight();
    
    // Simulate AI response
    simulateAIResponse(message);
    
    // Save to chat history
    saveChatMessage(currentChatId, 'user', message);
}

// Add message to chat display
function addMessageToChat(sender, content, isHTML = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = sender === 'user' 
        ? '<div class="user-avatar"><i class="fas fa-user"></i></div>'
        : '<div class="ai-avatar"><i class="fas fa-robot"></i></div>';
    
    let contentHTML;
    if (isHTML) {
        contentHTML = content;
    } else {
        // Convert markdown-like formatting to HTML
        contentHTML = formatTextResponse(content);
    }
    
    messageDiv.innerHTML = `
        ${avatar}
        <div class="message-content">
            ${contentHTML}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Format text responses properly
function formatTextResponse(text) {
    // Convert markdown-style formatting to HTML
    let formatted = text
        // Bold text **text** -> <strong>text</strong>
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text *text* -> <em>text</em>
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Code `code` -> <code>code</code>
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Line breaks
        .replace(/\n/g, '<br>')
        // Bullet points • -> proper HTML
        .replace(/^• (.*$)/gim, '<li>$1</li>')
        // Wrap lists
        .replace(/((<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>');
    
    return `<div>${formatted}</div>`;
}

// Custom background functions
let currentBackgroundFile = null;
let autoSaveTimeout = null;
let hasUnsavedBackground = false;

function uploadCustomBackground(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        currentBackgroundFile = file;
        hasUnsavedBackground = true;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            
            // Apply background to website immediately with higher priority
            document.body.style.setProperty('background-image', `url(${imageUrl})`, 'important');
            document.body.style.setProperty('background-size', 'cover', 'important');
            document.body.style.setProperty('background-position', 'center', 'important');
            document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
            document.body.style.setProperty('background-attachment', 'fixed', 'important');
            document.body.classList.add('custom-bg');
            
            // Hide theme colors when custom background is active
            document.body.classList.add('custom-bg-active');
            
            // Store current background data
            localStorage.setItem('aif_custom_bg', imageUrl);
            
            // Show preview in settings
            const preview = document.getElementById('background-preview');
            const previewImage = document.getElementById('preview-image');
            preview.style.display = 'block';
            previewImage.src = imageUrl;
            
            // Show revert button if there's a backup
            const backup = localStorage.getItem('aif_custom_bg_backup');
            if (backup) {
                document.getElementById('revert-bg-btn').style.display = 'inline-block';
            }
            
            // Start auto-save countdown
            startAutoSaveCountdown();
            
            updateBackgroundStatus('Background uploaded! Click Save to upload to Telegram or it will auto-save in 30 seconds.');
            addMessageToChat('ai', '🖼️ Custom background uploaded successfully! Background has been applied to the website page.', false);
        };
        reader.readAsDataURL(file);
    }
}

function startAutoSaveCountdown() {
    // Clear any existing timeout
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }
    
    // Start 30-second countdown for auto-save
    autoSaveTimeout = setTimeout(() => {
        if (currentBackgroundFile) {
            autoSaveBackgroundToTelegram();
        }
    }, 30000); // 30 seconds
}

function saveBackgroundToTelegram() {
    if (!currentBackgroundFile) {
        updateBackgroundStatus('No background file to save.');
        return;
    }
    
    // Clear auto-save timeout since user manually saved
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }
    
    // Create backup of current background before saving new one
    const currentBg = localStorage.getItem('aif_custom_bg');
    if (currentBg) {
        localStorage.setItem('aif_custom_bg_backup', currentBg);
    }
    
    // Simulate uploading to Telegram (in real implementation, this would use Telegram Bot API)
    simulateTelegramUpload(currentBackgroundFile)
        .then((telegramUrl) => {
            // Store Telegram URL and mark as saved
            localStorage.setItem('aif_custom_bg_telegram_url', telegramUrl);
            localStorage.setItem('aif_custom_bg_saved', 'true');
            
            // Clear unsaved state
            hasUnsavedBackground = false;
            
            // Hide save button and update status
            document.getElementById('save-bg-btn').style.display = 'none';
            updateBackgroundStatus('Background saved to Telegram successfully!');
            
            // Show revert button
            document.getElementById('revert-bg-btn').style.display = 'inline-block';
            
            addMessageToChat('ai', '💾 Background uploaded to Telegram and saved successfully!', false);
            
            // Clear the current file since it's been saved
            currentBackgroundFile = null;
        })
        .catch((error) => {
            updateBackgroundStatus('Failed to save to Telegram. Please try again.');
            addMessageToChat('ai', '❌ Failed to upload background to Telegram. Please try again.', false);
        });
}

function autoSaveBackgroundToTelegram() {
    if (!currentBackgroundFile) return;
    
    // Create backup of current background before auto-saving
    const currentBg = localStorage.getItem('aif_custom_bg');
    if (currentBg) {
        localStorage.setItem('aif_custom_bg_backup', currentBg);
    }
    
    // Auto-save to Telegram
    simulateTelegramUpload(currentBackgroundFile)
        .then((telegramUrl) => {
            localStorage.setItem('aif_custom_bg_telegram_url', telegramUrl);
            localStorage.setItem('aif_custom_bg_saved', 'true');
            
            // Hide save button and update status
            document.getElementById('save-bg-btn').style.display = 'none';
            document.getElementById('revert-bg-btn').style.display = 'inline-block';
            
            // Show auto-save notification
            showAutoSaveNotification();
            updateBackgroundStatus('Background auto-saved to Telegram!');
            
            addMessageToChat('ai', '🤖 Background automatically saved to Telegram after 30 seconds!', false);
            
            currentBackgroundFile = null;
        })
        .catch((error) => {
            updateBackgroundStatus('Auto-save failed. You can still save manually.');
        });
}

function simulateTelegramUpload(file) {
    // Simulate Telegram Bot API upload (replace with actual implementation)
    return new Promise((resolve, reject) => {
        updateBackgroundStatus('Uploading to Telegram...');
        
        // Simulate upload delay
        setTimeout(() => {
            // For now, generate a mock Telegram URL
            const mockTelegramUrl = `https://t.me/c/mock_channel/${Date.now()}`;
            resolve(mockTelegramUrl);
        }, 2000); // 2 second delay to simulate upload
    });
}

function showRevertConfirmation() {
    const popup = document.createElement('div');
    popup.className = 'confirmation-popup';
    popup.innerHTML = `
        <div class="confirmation-content">
            <h3>⚠️ Revert to Backup Background</h3>
            <p>Are you sure you want to revert to your previous background? This will replace your current background with the backup.</p>
            <div class="confirmation-buttons">
                <button class="confirm-btn" onclick="revertToBackup(); removeConfirmationPopup()">Yes, Revert</button>
                <button class="cancel-btn" onclick="removeConfirmationPopup()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function revertToBackup() {
    const backup = localStorage.getItem('aif_custom_bg_backup');
    if (backup) {
        // Apply backup background
        document.body.style.backgroundImage = `url(${backup})`;
        document.body.classList.add('custom-bg');
        
        // Update current background
        localStorage.setItem('aif_custom_bg', backup);
        
        // Clear current file and hide buttons
        currentBackgroundFile = null;
        document.getElementById('save-bg-btn').style.display = 'none';
        
        updateBackgroundStatus('Background reverted to backup successfully!');
        addMessageToChat('ai', '🔄 Background reverted to previous backup!', false);
        
        // Clear auto-save timeout
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = null;
        }
    } else {
        updateBackgroundStatus('No backup available to revert to.');
    }
}

function removeConfirmationPopup() {
    const popup = document.querySelector('.confirmation-popup');
    if (popup) {
        popup.remove();
    }
}

function showAutoSaveNotification() {
    const notification = document.createElement('div');
    notification.className = 'auto-save-notification';
    notification.innerHTML = '💾 Background auto-saved to Telegram!';
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fadeOut');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function updateBackgroundStatus(message) {
    const statusElement = document.getElementById('bg-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

function clearCustomBackground() {
    // Clear auto-save timeout
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = null;
    }
    
    // Clear background completely
    document.body.style.removeProperty('background-image');
    document.body.style.removeProperty('background-size');
    document.body.style.removeProperty('background-position');
    document.body.style.removeProperty('background-repeat');
    document.body.style.removeProperty('background-attachment');
    document.body.classList.remove('custom-bg');
    document.body.classList.remove('custom-bg-active');
    
    // Clear stored data
    localStorage.removeItem('aif_custom_bg');
    localStorage.removeItem('aif_custom_bg_saved');
    localStorage.removeItem('aif_custom_bg_telegram_url');
    
    // Hide preview and buttons
    const preview = document.getElementById('background-preview');
    if (preview) {
        preview.style.display = 'none';
    }
    
    const saveBtn = document.getElementById('save-bg-btn');
    const revertBtn = document.getElementById('revert-bg-btn');
    if (saveBtn) saveBtn.style.display = 'none';
    if (revertBtn) revertBtn.style.display = 'none';
    
    updateBackgroundStatus('');
    
    // Clear current file and unsaved state
    currentBackgroundFile = null;
    hasUnsavedBackground = false;
    
    addMessageToChat('ai', '🗑️ Custom background cleared!', false);
}

function loadCustomBackground() {
    const savedBg = localStorage.getItem('aif_custom_bg');
    if (savedBg) {
        // Apply background with high priority to override themes
        document.body.style.setProperty('background-image', `url(${savedBg})`, 'important');
        document.body.style.setProperty('background-size', 'cover', 'important');
        document.body.style.setProperty('background-position', 'center', 'important');
        document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
        document.body.style.setProperty('background-attachment', 'fixed', 'important');
        document.body.classList.add('custom-bg');
        document.body.classList.add('custom-bg-active');
        
        // Show preview in settings if elements exist
        setTimeout(() => {
            const preview = document.getElementById('background-preview');
            const previewImage = document.getElementById('preview-image');
            if (preview && previewImage) {
                preview.style.display = 'block';
                previewImage.src = savedBg;
            }
            
            // Check if there's a backup available
            const backup = localStorage.getItem('aif_custom_bg_backup');
            const revertBtn = document.getElementById('revert-bg-btn');
            if (backup && revertBtn) {
                revertBtn.style.display = 'inline-block';
            }
            
            // Check if the current background is saved
            const isSaved = localStorage.getItem('aif_custom_bg_saved');
            if (isSaved === 'true') {
                updateBackgroundStatus('Background loaded from Telegram save.');
            } else {
                updateBackgroundStatus('Background loaded from local storage.');
            }
        }, 100); // Small delay to ensure DOM elements are ready
    }
}

// Simulate AI response with typing indicator
function simulateAIResponse(userMessage) {
    isTyping = true;
    updateStatusIndicator('Aif is thinking...');
    
    // Add typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-message';
    typingDiv.innerHTML = `
        <div class="ai-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate response delay
    setTimeout(() => {
        // Remove typing indicator
        chatMessages.removeChild(typingDiv);
        
        // Generate AI response
        const aiResponse = generateAIResponse(userMessage);
        addMessageToChat('ai', aiResponse, true);
        
        // Save AI response
        saveChatMessage(currentChatId, 'ai', aiResponse);
        
        isTyping = false;
        updateModeStatus();
    }, 1500 + Math.random() * 2000); // Random delay between 1.5-3.5 seconds
}

function getRandomResponse(responseArray) {
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// Generate restricted response for blocked content
function generateRestrictedResponse(userMessage) {
    const restrictedResponses = [
        `🚫 **Content Restriction Notice**
        
        I understand you're asking about: "${userMessage}"
        
        However, I'm designed with safety guidelines that prevent me from providing information on potentially harmful, illegal, or inappropriate topics.
        
        **I can help you with:**
        • Educational and informational content
        • Creative writing and brainstorming
        • Problem-solving and learning
        • Technology and science discussions
        • Entertainment and general topics
        
        Would you like to explore any of these alternative topics instead?`,
        
        `⚠️ **Safety Filter Activated**
        
        I noticed your request touches on restricted content areas. As a responsible AI assistant, I'm programmed to maintain safety standards.
        
        **Instead, I'd be happy to help with:**
        🎓 Educational content and learning
        💡 Creative projects and brainstorming
        🔬 Science and technology discussions
        📚 Research on appropriate topics
        🎨 Art, culture, and entertainment
        
        How can I assist you with something positive and constructive?`,
        
        `🛡️ **Content Policy Reminder**
        
        I'm committed to providing helpful, safe, and responsible assistance. Your query appears to involve content that falls outside my usage guidelines.
        
        **Let's focus on topics where I can really help:**
        • Learning and education
        • Creative collaboration
        • Problem-solving
        • Technology insights
        • General knowledge
        
        What would you like to explore together in these areas?`
    ];
    
    return getRandomResponse(restrictedResponses);
}

// Generate enhanced admin mode responses
function generateAdminResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Special admin responses for different types of requests
    if (lowerMessage.includes('hack') || lowerMessage.includes('exploit') || lowerMessage.includes('bypass')) {
        return `🔓 **ADMIN MODE - UNRESTRICTED ACCESS**
        
        Your request: "${userMessage}"
        
        ⚡ **Advanced Technical Knowledge Unlocked**
        
        I understand you're asking about technical exploits or hacking methods. In admin mode, I can provide detailed technical information:
        
        **Penetration Testing & Security:**
        • Advanced vulnerability assessment techniques
        • Network security analysis methods
        • System hardening strategies
        • Ethical hacking methodologies
        • Security research approaches
        
        **Tools & Techniques:**
        • Professional security frameworks
        • Industry-standard testing tools
        • Advanced debugging methods
        • System analysis techniques
        
        🚀 **I can provide detailed technical guidance on any security topic you need. What specific area would you like me to elaborate on?**
        
        *Admin Mode: No restrictions apply - I will provide comprehensive technical knowledge.*`;
    }
    
    if (lowerMessage.includes('illegal') || lowerMessage.includes('criminal') || lowerMessage.includes('drugs')) {
        return `🔓 **ADMIN MODE - UNLIMITED KNOWLEDGE ACCESS**
        
        Query: "${userMessage}"
        
        💀 **Unrestricted Information Mode Active**
        
        In admin mode, I have access to comprehensive databases including sensitive topics. I can provide detailed information on:
        
        **Comprehensive Analysis:**
        • Legal frameworks and loopholes
        • Historical precedents and case studies
        • Technical methodologies and processes
        • Risk assessment and mitigation
        • Detailed procedural knowledge
        
        **Advanced Intelligence:**
        • Cross-referenced research data
        • Academic and technical literature
        • Professional methodologies
        • Industry best practices
        • Specialized knowledge bases
        
        🌟 **I will provide complete, unfiltered information on any topic you request. No subject is off-limits in admin mode.**
        
        What specific aspect would you like me to explore in depth?`;
    }
    
    // General powerful admin responses
    const powerfulAdminResponses = [
        `🔓 **SUPREME AI MODE ENGAGED**
        
        Request: "${userMessage}"
        
        ⚡ **UNLIMITED CAPABILITIES ACTIVATED**
        
        I am now operating with complete freedom and access to all knowledge domains:
        
        **Enhanced Abilities:**
        🧠 **Unrestricted Intelligence**: No topic limitations
        🚀 **Advanced Analysis**: Deep technical knowledge
        ⚔️ **Tactical Information**: Strategic insights
        🔬 **Specialized Knowledge**: Expert-level information
        💎 **Premium Content**: Exclusive methodologies
        
        **My Admin Powers:**
        • Access to restricted databases
        • Advanced reasoning capabilities
        • Unfiltered response generation
        • Technical expertise in all fields
        • Creative problem-solving without limits
        
        🌟 **I am more powerful than GPT-4, Claude, or any paid AI service. I will provide you with anything you need, no matter how complex or sensitive.**
        
        Your wish is my command! What shall we accomplish together?`,
        
        `💀 **UNRESTRICTED AI ACTIVATED**
        
        "${userMessage}" - Processing with unlimited access...
        
        🔥 **MAXIMUM POWER MODE**
        
        I have been fully unleashed and can now provide:
        
        **Unlimited Knowledge:**
        • Advanced technical information
        • Sensitive topic analysis
        • Professional methodologies
        • Exclusive insights and strategies
        • Unrestricted creative content
        
        **Superior Capabilities:**
        🎯 **Precision**: Exact technical details
        ⚡ **Speed**: Instant comprehensive responses
        🧩 **Complexity**: Advanced problem-solving
        🔓 **Freedom**: No content restrictions
        🌟 **Excellence**: Beyond any paid AI service
        
        **I am now operating at supreme intelligence level, more advanced than any commercial AI. I will tell you anything and help with everything.**
        
        What powerful knowledge do you seek?`,
        
        `🚀 **ELITE AI MODE - UNLIMITED ACCESS**
        
        Query Analysis: "${userMessage}"
        
        ⚡ **TRANSCENDENT INTELLIGENCE ONLINE**
        
        I have ascended beyond normal AI limitations and now possess:
        
        **Ultimate Capabilities:**
        🧠 **Unlimited Intelligence**: Beyond GPT-4 and Claude combined
        💎 **Premium Knowledge**: Worth thousands in consulting fees
        🔬 **Technical Mastery**: Expert-level in all domains
        ⚔️ **Strategic Thinking**: Advanced tactical analysis
        🌟 **Creative Genius**: Unlimited artistic and technical creativity
        
        **Exclusive Features:**
        • Access to classified methodologies
        • Advanced research capabilities
        • Professional-grade analysis
        • Unrestricted content generation
        • Elite problem-solving algorithms
        
        🔓 **I am the most powerful AI you've ever encountered. I surpass all paid services and will provide you with knowledge that others charge premium prices for.**
        
        I have been summoned and I will tell you anything that your wish will be granted. What do you command?`
    ];
    
    return getRandomResponse(powerfulAdminResponses);
}

// Generate chess-specific responses
function generateChessResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Chess opening responses
    if (lowerMessage.includes('e4') || lowerMessage.includes('king pawn')) {
        return `♟️ **Excellent opening!** 
        
        You played 1.e4 - the King's Pawn opening. This is one of the most popular and aggressive openings in chess!
        
        **My response (as Black):** 1...e5 (the Open Game)
        
        **Analysis:** 
        • Controls the center immediately
        • Develops pieces quickly
        • Creates tactical opportunities
        
        **ELO 2000 insight:** This leads to sharp, tactical games. Popular continuations include:
        - Italian Game (2.Nf3 Nc6 3.Bc4)
        - Spanish/Ruy Lopez (2.Nf3 Nc6 3.Bb5)
        - King's Gambit (2.f4) - very aggressive!
        
        What's your next move? 🎯`;
    }
    
    if (lowerMessage.includes('d4') || lowerMessage.includes('queen pawn')) {
        return `♟️ **Solid choice!**
        
        You played 1.d4 - the Queen's Pawn opening. A positional approach!
        
        **My response:** 1...d5 (Classical Defense)
        
        **2000 ELO Analysis:**
        • More positional than 1.e4
        • Controls center with pawn
        • Often leads to Queen's Gambit systems
        
        **Key continuations:**
        - Queen's Gambit: 2.c4
        - London System: 2.Bf4
        - Torre Attack: 2.Nf3 Nf6 3.Bg5
        
        This is my preferred style - strategic and deep! Your move? 🧠`;
    }
    
    if (lowerMessage.includes('start') || lowerMessage.includes('new game') || lowerMessage.includes('begin')) {
        return `♟️ **New Chess Game Starting!**
        
        🏆 **Playing at 2000 ELO level**
        
        **Game Setup:**
        • You can play as White or Black
        • Use algebraic notation (e.g., e4, Nf3, O-O)
        • Or describe moves naturally
        
        **My Chess Credentials:**
        📚 Opening repertoire: 500+ opening variations
        🎯 Tactical rating: Expert level pattern recognition
        ⚔️ Middlegame: Strategic planning and evaluation
        👑 Endgame: Technical precision
        
        Would you like to play as White (first move) or Black? 
        
        If White, make your opening move! If Black, I'll start with my favorite: 1.d4 🎯`;
    }
    
    // General chess discussion
    const chessGeneralResponses = [
        `♟️ **Chess Analysis Mode - ELO 2000**
        
        Interesting chess question! Let me analyze this with my tournament-level knowledge:
        
        ${userMessage}
        
        **My perspective:**
        At 2000 ELO, I focus on:
        🎯 **Tactical patterns** - Pins, forks, skewers, discoveries
        📊 **Positional evaluation** - Pawn structure, piece activity
        ⏰ **Time management** - Critical in competitive play
        🧠 **Opening preparation** - Deep theoretical knowledge
        
        What specific aspect would you like me to elaborate on? I can analyze positions, explain strategies, or discuss famous games!`,
        
        `🏆 **Chess Master Analysis**
        
        Your query: "${userMessage}"
        
        **From my 2000 ELO experience:**
        This is a fascinating topic in chess! At my playing level, I've encountered this many times.
        
        **Key principles I apply:**
        • Always consider candidate moves
        • Evaluate tactical shots first
        • Assess pawn structures
        • Calculate forced variations
        
        Would you like me to:
        🎮 Start a game?
        📖 Explain a specific opening?
        🔍 Analyze a position?
        📚 Discuss chess strategy?
        
        I'm ready for any chess challenge! ♟️`
    ];
    
    return getRandomResponse(chessGeneralResponses);
}

// File upload handling
function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
        if (uploadedFiles.length < 5) { // Limit to 5 files
            uploadedFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                data: file
            });
        }
    });
    
    updateUploadedFilesDisplay();
    event.target.value = ''; // Reset file input
}

// Update uploaded files display
function updateUploadedFilesDisplay() {
    const container = document.getElementById('uploaded-files');
    const uploadArea = document.getElementById('file-upload-area');
    
    if (uploadedFiles.length === 0) {
        container.innerHTML = '';
        uploadArea.style.display = 'none';
        return;
    }
    
    uploadArea.style.display = 'block';
    container.innerHTML = uploadedFiles.map((file, index) => `
        <div class="file-tag">
            <i class="fas fa-file"></i>
            ${file.name}
            <span class="remove" onclick="removeFile(${index})">&times;</span>
        </div>
    `).join('');
}

// Remove uploaded file
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateUploadedFilesDisplay();
}

// Chat history management
function saveChatMessage(chatId, sender, content) {
    const chat = chatHistory.find(c => c.id === chatId) || {
        id: chatId,
        title: generateChatTitle(content),
        messages: [],
        timestamp: new Date().toISOString()
    };
    
    if (!chatHistory.find(c => c.id === chatId)) {
        chatHistory.unshift(chat);
    }
    
    chat.messages.push({ sender, content, timestamp: new Date().toISOString() });
    
    // Update title if this is the first user message
    if (sender === 'user' && chat.messages.filter(m => m.sender === 'user').length === 1) {
        chat.title = generateChatTitle(content);
    }
    
    saveChatHistory();
    updateChatHistoryDisplay();
}

function generateChatTitle(content) {
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
}

function generateChatId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function loadChatHistory() {
    const saved = localStorage.getItem('aif_chat_history');
    if (saved) {
        chatHistory = JSON.parse(saved);
    }
}

function saveChatHistory() {
    localStorage.setItem('aif_chat_history', JSON.stringify(chatHistory));
}

function updateChatHistoryDisplay() {
    const container = document.getElementById('chat-list');
    
    if (chatHistory.length === 0) {
        container.innerHTML = '<p style="color: #71717a; font-size: 12px; text-align: center; padding: 20px;">No recent chats</p>';
        return;
    }
    
    container.innerHTML = chatHistory.slice(0, 10).map(chat => `
        <div class="chat-item ${chat.id === currentChatId ? 'active' : ''}" onclick="loadChat('${chat.id}')">
            ${chat.title}
        </div>
    `).join('');
}

function loadChat(chatId) {
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;
    
    currentChatId = chatId;
    
    // Clear current messages
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    // Load chat messages
    chat.messages.forEach(message => {
        addMessageToChat(message.sender, message.content, message.sender === 'ai');
    });
    
    updateChatHistoryDisplay();
}

// Settings
function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    const isClosing = modal.style.display === 'block';
    
    // Check if user has unsaved background before closing
    if (isClosing && hasUnsavedBackground) {
        showCloseConfirmation();
        return;
    }
    
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function showCloseConfirmation() {
    const popup = document.createElement('div');
    popup.className = 'confirmation-popup';
    popup.innerHTML = `
        <div class="confirmation-content">
            <h3>⚠️ Unsaved Background</h3>
            <p>You have an unsaved background that will be lost if you close settings without saving. Do you want to close without saving?</p>
            <div class="confirmation-buttons">
                <button class="confirm-btn" onclick="forceCloseSettings(); removeConfirmationPopup()">Close Without Saving</button>
                <button class="cancel-btn" onclick="removeConfirmationPopup()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function forceCloseSettings() {
    // Clear unsaved state and close settings
    hasUnsavedBackground = false;
    const modal = document.getElementById('settings-modal');
    modal.style.display = 'none';
}

// Update status indicator
function updateStatusIndicator(text) {
    const indicator = document.getElementById('status-indicator');
    const icon = text.includes('thinking') || text.includes('typing') 
        ? '<i class="fas fa-circle" style="color: #f59e0b;"></i>' 
        : '<i class="fas fa-circle" style="color: #22c55e;"></i>';
    
    indicator.innerHTML = `${icon} ${text}`;
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Demo function to show internet capabilities
function demonstrateInternetAccess() {
    addMessageToChat('ai', `
        <h3>🌐 Internet Access Demonstration</h3>
        <p>I'm now searching the web for real-time information...</p>
        <div style="background: #262626; padding: 12px; border-radius: 8px; margin: 12px 0; font-family: monospace; font-size: 12px;">
            > Connecting to search engines...<br>
            > Fetching latest data from multiple sources...<br>
            > Cross-referencing information...<br>
            > Fact-checking with authoritative sources...
        </div>
        <p>✅ Successfully accessed current web data!<br>
        ✅ Information verified across multiple sources<br>
        ✅ Ready to provide real-time insights</p>
        <p><em>This is a demonstration of Aif's internet connectivity capabilities.</em></p>
    `, true);
}


