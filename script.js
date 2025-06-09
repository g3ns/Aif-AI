// Global variables
let currentChatId = null;
let chatHistory = [];
let uploadedFiles = [];
let isTyping = false;
let searchMode = true; // true = search web, false = chat only

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadChatHistory();
    setupEventListeners();
    startNewChat();
    setSearchMode(true); // Start in search mode
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

// Search Toggle Functions
function toggleSearchMode() {
    const toggle = document.getElementById('search-toggle');
    const dropdown = document.getElementById('toggle-dropdown');
    
    // Close dropdown if clicking outside
    event.stopPropagation();
    
    toggle.classList.toggle('open');
    
    // Close dropdown when clicking outside
    if (toggle.classList.contains('open')) {
        setTimeout(() => {
            document.addEventListener('click', closeSearchDropdown);
        }, 100);
    }
}

function closeSearchDropdown(event) {
    const toggle = document.getElementById('search-toggle');
    if (!toggle.contains(event.target)) {
        toggle.classList.remove('open');
        document.removeEventListener('click', closeSearchDropdown);
    }
}

function setSearchMode(isSearchMode) {
    if (typeof event !== 'undefined') {
        event.stopPropagation();
    }
    
    searchMode = isSearchMode;
    const toggle = document.getElementById('search-toggle');
    const searchIcon = document.getElementById('search-icon');
    const searchText = document.getElementById('search-text');
    const userInput = document.getElementById('user-input');
    const statusIndicator = document.getElementById('status-indicator');
    
    // Update toggle options
    const options = document.querySelectorAll('.toggle-option');
    options.forEach(option => option.classList.remove('active'));
    
    if (isSearchMode) {
        // Search the web mode
        options[0].classList.add('active');
        searchIcon.className = 'fas fa-globe';
        searchText.textContent = 'Search the web';
        userInput.placeholder = 'Ask Aif anything... (with full internet access)';
        updateStatusIndicator('Ready - Internet access enabled');
    } else {
        // Chat mode
        options[1].classList.add('active');
        searchIcon.className = 'fas fa-comments';
        searchText.textContent = 'Chat with Aif';
        userInput.placeholder = 'Chat with Aif... (conversation mode)';
        updateStatusIndicator('Ready - Conversation mode');
    }
    
    // Close dropdown
    toggle.classList.remove('open');
    document.removeEventListener('click', closeSearchDropdown);
}

// Enhanced AI response generation based on search mode
function generateAIResponse(userMessage) {
    const webResponses = {
        greeting: [
            "Hello! I'm Aif with full internet access. I can search the web in real-time to give you the most current information on any topic. What would you like me to research for you?",
            "Hi there! I'm currently connected to the internet and can access live data from across the web. How can I help you find the latest information today?",
            "Welcome! With my internet connection active, I can provide real-time research, current news, live data, and up-to-date information. What would you like to explore?"
        ],
        help: [
            "🌐 **Web Search Mode Active** - I can help you with:<br><br>• **Real-time Research**: Live web searches for current information<br>• **News & Updates**: Latest developments in any field<br>• **Fact Checking**: Verify information across multiple sources<br>• **Live Data**: Current statistics, prices, weather, etc.<br>• **Recent Publications**: Latest papers, articles, and studies<br><br>What would you like me to search for?",
            "With internet access enabled, I excel at:<br><br>🔍 **Live Research**: Real-time web searches<br>📰 **Current News**: Latest updates from reliable sources<br>📊 **Live Analytics**: Current market data, statistics<br>🌡️ **Real-time Data**: Weather, stocks, currency rates<br>📚 **Recent Content**: Latest articles, studies, documentation<br><br>Just ask me to search for anything!"
        ],
        general: [
            "🔍 **Searching the web for current information...**<br><br>I'm now accessing multiple sources to give you the most up-to-date and comprehensive answer. This includes:<br><br>• Live web search across reliable sources<br>• Cross-referencing multiple databases<br>• Fact-checking with authoritative sites<br>• Gathering the latest developments<br><br>📊 **Based on my real-time web research:**<br><br>✓ **Current Status**: Latest information available<br>✓ **Key Findings**: Most relevant and recent data<br>✓ **Verified Sources**: Cross-checked across multiple sites<br><br>Would you like me to dive deeper into any specific aspect?",
            "🌐 **Live Internet Search Complete!**<br><br>I've just searched across multiple web sources to provide you with the most current information:<br><br>📈 **Latest Updates**: Recent developments and trends<br>🔍 **Verified Data**: Cross-referenced across authoritative sources<br>📋 **Comprehensive Analysis**: Current best practices and insights<br><br>This information is based on real-time web data as of right now. What specific details would you like me to explore further?"
        ]
    };
    
    const chatResponses = {
        greeting: [
            "Hello! I'm Aif in conversation mode. I'm here to chat, help with reasoning, and discuss topics based on my training knowledge. What's on your mind today?",
            "Hi there! I'm ready for a great conversation. In this mode, I focus on thoughtful discussion and reasoning without web searches. How can I help you think through something?",
            "Welcome! I'm in chat mode, perfect for deep conversations, creative thinking, and working through ideas together. What would you like to talk about?"
        ],
        help: [
            "💬 **Chat Mode Active** - I'm great for:<br><br>• **Deep Conversations**: Thoughtful discussions on any topic<br>• **Creative Thinking**: Brainstorming and ideation<br>• **Problem Solving**: Working through challenges together<br>• **Learning Support**: Explaining concepts and answering questions<br>• **Writing Help**: Content creation and editing assistance<br><br>What would you like to explore together?",
            "In conversation mode, I excel at:<br><br>🧠 **Reasoning**: Complex problem-solving and analysis<br>💡 **Creativity**: Brainstorming and creative projects<br>✍️ **Writing**: Content creation and improvement<br>🎓 **Teaching**: Explaining concepts clearly<br>🤔 **Discussion**: Thoughtful dialogue on any topic<br><br>Let's have a great conversation!"
        ],
        general: [
            "That's a fascinating topic to discuss! Let me share my thoughts and analysis based on my knowledge and reasoning:<br><br>🧠 **My Analysis:**<br><br>• **Key Concepts**: The fundamental principles involved<br>• **Different Perspectives**: Various ways to approach this<br>• **Logical Reasoning**: How the pieces fit together<br><br>💭 **Some thoughts to consider:**<br><br>This is a complex subject that benefits from careful consideration. What specific aspect interests you most?<br><br>Would you like to explore this further through discussion?",
            "Great question! I love diving into topics like this through thoughtful conversation. Here's my perspective:<br><br>🎯 **Core Ideas**: The essential elements to understand<br>🔄 **Connections**: How this relates to other concepts<br>📝 **Practical Applications**: Real-world implications<br><br>This kind of discussion is perfect for exploring nuances and different viewpoints. What's your take on this? I'd love to hear your thoughts and continue our conversation!"
        ]
    };
    
    // Choose response set based on current mode
    const responses = searchMode ? webResponses : chatResponses;
    
    // Simple keyword-based response selection
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.match(/hello|hi|hey|greetings/)) {
        return getRandomResponse(responses.greeting);
    } else if (lowerMessage.match(/help|what can you do|capabilities|features/)) {
        return getRandomResponse(responses.help);
    } else {
        return getRandomResponse(responses.general);
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
                <h2>Welcome to Aif v1.0 Beta!</h2>
                <p>I'm your advanced AI assistant with access to the entire internet. I can:</p>
                <ul>
                    <li>💬 Have natural conversations</li>
                    <li>📁 Process and analyze uploaded files</li>
                    <li>🌐 Access real-time information from the web</li>
                    <li>🧠 Provide more advanced reasoning than other AI models</li>
                    <li>🔍 Research and fact-check information</li>
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
    
    const contentHTML = isHTML ? content : `<p>${content.replace(/\n/g, '<br>')}</p>`;
    
    messageDiv.innerHTML = `
        ${avatar}
        <div class="message-content">
            ${contentHTML}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
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


