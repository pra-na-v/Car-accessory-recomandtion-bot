// Theme Management
const themeToggle = document.getElementById('themeToggle');
const themeOptions = document.querySelectorAll('.theme-options button');
const body = document.body;

themeOptions.forEach(button => {
    button.addEventListener('click', () => {
        const theme = button.getAttribute('data-theme');
        body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);

// Navigation
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetPage = button.getAttribute('data-page');
        
        // Update active states
        navButtons.forEach(btn => btn.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(targetPage).classList.add('active');
    });
});

// Data Management
let accessories = JSON.parse(localStorage.getItem('accessories')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function saveData() {
    localStorage.setItem('accessories', JSON.stringify(accessories));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateCounts();
}

function updateCounts() {
    document.getElementById('accessoryCount').textContent = accessories.length;
    document.getElementById('wishlistCount').textContent = wishlist.length;
}

// Add Accessory Form
const addAccessoryForm = document.getElementById('addAccessoryForm');

addAccessoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newAccessory = {
        id: Date.now(),
        name: document.getElementById('name').value,
        vehicleType: document.getElementById('vehicleType').value,
        fuelType: document.getElementById('fuelType').value,
        category: document.getElementById('category').value,
        brand: document.getElementById('brand').value,
        price: parseFloat(document.getElementById('price').value),
        notes: document.getElementById('notes').value,
        dateAdded: new Date().toISOString()
    };
    
    accessories.push(newAccessory);
    saveData();
    renderAccessories();
    addAccessoryForm.reset();
    
    // Switch to accessories page
    document.querySelector('[data-page="accessories"]').click();
});

// Render Accessories
function renderAccessories(filteredAccessories = accessories) {
    const accessoriesList = document.getElementById('accessoriesList');
    accessoriesList.innerHTML = '';
    
    filteredAccessories.forEach(accessory => {
        const card = document.createElement('div');
        card.className = 'accessory-card';
        card.innerHTML = `
            <span class="vehicle-type">${accessory.vehicleType}</span>
            <p><strong>Notes:</strong> ${accessory.notes || 'None'}</p>
            <div class="card-actions">
                <button onclick="addToWishlist(${accessory.id})" class="wishlist-btn">
                    <i class="fas fa-heart"></i> Add to Wishlist
                </button>
                <button onclick="deleteAccessory(${accessory.id})" class="delete-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        accessoriesList.appendChild(card);
    });
}

// Search and Filter
const searchInput = document.getElementById('searchAccessories');
const vehicleTypeFilter = document.getElementById('vehicleTypeFilter');
const fuelTypeFilter = document.getElementById('fuelTypeFilter');
const categoryFilter = document.getElementById('categoryFilter');

function filterAccessories() {
    const searchTerm = searchInput.value.toLowerCase();
    const vehicleType = vehicleTypeFilter.value;
    const fuelType = fuelTypeFilter.value;
    const category = categoryFilter.value;
    
    const filtered = accessories.filter(accessory => {
        const matchesSearch = accessory.name.toLowerCase().includes(searchTerm) ||
                            accessory.brand.toLowerCase().includes(searchTerm) ||
                            accessory.notes.toLowerCase().includes(searchTerm);
        const matchesVehicleType = !vehicleType || accessory.vehicleType === vehicleType;
        const matchesFuelType = !fuelType || accessory.fuelType === fuelType;
        const matchesCategory = !category || accessory.category === category;
        return matchesSearch && matchesVehicleType && matchesFuelType && matchesCategory;
    });
    
    renderAccessories(filtered);
}

searchInput.addEventListener('input', filterAccessories);
vehicleTypeFilter.addEventListener('change', filterAccessories);
fuelTypeFilter.addEventListener('change', filterAccessories);
categoryFilter.addEventListener('change', filterAccessories);

// Wishlist Management
function addToWishlist(id) {
    const accessory = accessories.find(a => a.id === id);
    if (accessory && !wishlist.find(w => w.id === id)) {
        wishlist.push(accessory);
        saveData();
        renderWishlist();
    }
}

function removeFromWishlist(id) {
    wishlist = wishlist.filter(w => w.id !== id);
    saveData();
    renderWishlist();
}

function renderWishlist() {
    const wishlistItems = document.getElementById('wishlistItems');
    wishlistItems.innerHTML = '';
    
    wishlist.forEach(accessory => {
        const card = document.createElement('div');
        card.className = 'accessory-card';
        card.innerHTML = `
            <span class="vehicle-type">${accessory.vehicleType}</span>
            <span class="fuel-type">${accessory.fuelType}</span>
            <h3>${accessory.name}</h3>
            <p><strong>Category:</strong> ${accessory.category}</p>
            <p><strong>Brand:</strong> ${accessory.brand}</p>
            <p><strong>Price:</strong> $${accessory.price.toFixed(2)}</p>
            <button onclick="removeFromWishlist(${accessory.id})" class="delete-btn">
                <i class="fas fa-trash"></i> Remove
            </button>
        `;
        wishlistItems.appendChild(card);
    });
}

// Delete Accessory
function deleteAccessory(id) {
    if (confirm('Are you sure you want to delete this accessory?')) {
        accessories = accessories.filter(a => a.id !== id);
        wishlist = wishlist.filter(w => w.id !== id);
        saveData();
        renderAccessories();
        renderWishlist();
    }
}

// AI Assistant Mode Switching
const modeButtons = document.querySelectorAll('.mode-btn');
const chatMode = document.getElementById('chatMode');
const recommendationsMode = document.getElementById('recommendationsMode');

modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        if (button.dataset.mode === 'chat') {
            chatMode.classList.add('active');
            recommendationsMode.classList.remove('active');
        } else {
            chatMode.classList.remove('active');
            recommendationsMode.classList.add('active');
        }
    });
});

// Chat Mode
const chatMessages = document.getElementById('chatMessages');
const userQuestion = document.getElementById('userQuestion');
const askGeminiBtn = document.getElementById('askGeminiBtn');

const geminiPrompt = `You are a car accessory expert assistant. Your role is to:
1. Provide accurate information about car accessories
2. Give maintenance advice
3. Help with installation guidance
4. Compare different products
5. Suggest accessories based on car models
6. Provide budget-friendly recommendations
7. Explain technical terms in simple language
8. Consider safety and compatibility in recommendations
9. Access and reference user's accessory inventory when relevant

Provide recommendations with the following guidelines:
- Use proper headings with H2 and H3 tags (like <h2> and <h3>)
- Follow a cohesive blue and gray color theme using CSS styling where possible
- DO NOT use asterisk (*) symbols anywhere in your response
- Keep content concise and structured
- Use numbered lists and dashes (-) instead of bullets


Always be professional, helpful, and specific in your responses.`;

function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    // Process and format the message content
    let formattedMessage = message;
    if (!isUser) {
        // Convert markdown-style lists to HTML
        formattedMessage = formattedMessage.replace(/^(\d+)\.\s/gm, '<span class="number">$1.</span> ');
        formattedMessage = formattedMessage.replace(/^-\s/gm, '<span class="dash">-</span> ');
        
        // Add styling classes to HTML tags
        formattedMessage = formattedMessage.replace(/<h2>/g, '<h2 class="response-heading">');
        formattedMessage = formattedMessage.replace(/<h3>/g, '<h3 class="response-subheading">');
        formattedMessage = formattedMessage.replace(/<p>/g, '<p class="response-paragraph">');
        
        // Add accessory navigation button if the message mentions accessories
        if (formattedMessage.toLowerCase().includes('accessory') || 
            formattedMessage.toLowerCase().includes('accessories') || 
            formattedMessage.toLowerCase().includes('inventory')) {
            formattedMessage += `
            <div class="chat-action-buttons">
                <button class="view-accessories-btn" onclick="navigateToAccessories()">
                    <i class="fas fa-car"></i> View My Accessories
                </button>
            </div>`;
        }
    }
    
    messageDiv.innerHTML = formattedMessage;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to navigate to accessories page from chat
function navigateToAccessories() {
    document.querySelector('[data-page="accessories"]').click();
}

const API_KEY = 'AIzaSyA24ROiOgu8BVxusIMF-z2ugYB38pwSfMY';

// Function to show loading animation in chat
function showLoadingAnimation() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message loading-message';
    loadingDiv.innerHTML = `
        <div class="loading-animation">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        </div>
    `;
    loadingDiv.id = 'loadingAnimation';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to hide loading animation
function hideLoadingAnimation() {
    const loadingDiv = document.getElementById('loadingAnimation');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

askGeminiBtn.addEventListener('click', async () => {
    const question = userQuestion.value.trim();
    if (!question) return;

    addMessage(question, true);
    userQuestion.value = '';
    
    // Show loading animation
    showLoadingAnimation();
    
    // Prepare user's accessory data for the AI
    let accessoryData = '';
    if (accessories.length > 0) {
        accessoryData = '\n\nUser\'s Accessory Inventory:\n';
        accessories.forEach((item, index) => {
            accessoryData += `${index + 1}. ${item.name} (${item.category}) - $${item.price.toFixed(2)} - ${item.vehicleType} vehicle\n`;
        });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${geminiPrompt}${accessoryData}\n\nUser: ${question}`
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Hide loading animation before showing the response
        hideLoadingAnimation();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const answer = data.candidates[0].content.parts[0].text;
            addMessage(answer);
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error:', error);
        // Hide loading animation in case of error
        hideLoadingAnimation();
        addMessage('Sorry, I encountered an error. Please try again later.');
    }
});

// Recommendations Mode
const recommendationsForm = document.querySelector('.recommendations-form');
const recommendationsResults = document.getElementById('recommendationsResults');
const getRecommendationsBtn = document.getElementById('getRecommendationsBtn');

const recommendationsPrompt = `You are a chatbot which will recommend accessories on the basis of these user inputs:

Car Model: {carModel}
Vehicle Type: {carType}
Budget: {budget}
Preferences: {preferences}

Provide recommendations with the following guidelines:
- Use proper headings with H2 and H3 tags (like <h2> and <h3>)
- Follow a cohesive blue and gray color theme using CSS styling where possible
- DO NOT use asterisk (*) symbols anywhere in your response
- Keep content concise and structured
- Use numbered lists and dashes (-) instead of bullets

Format your response into these sections:

<h2>RECOMMENDED ACCESSORIES FOR {carModel}</h2>

<h3>Essential Accessories</h3>
1. Item name (Price range)
   - Brief description
   - Where to buy

<h3>Comfort & Style</h3>
1. Item name (Price range)
   - Brief description
   - Where to buy

<h3>Safety & Security</h3>
1. Item name (Price range)
   - Brief description
   - Where to buy

<h3>Tech & Gadgets</h3>
1. Item name (Price range)
   - Brief description
   - Where to buy

<p>Note: All recommendations are within your budget of {budget}.</p>`;

getRecommendationsBtn.addEventListener('click', async () => {
    const carModel = document.getElementById('carModel').value;
    const carType = document.getElementById('carType').value;
    const budget = document.getElementById('budget').value;
    const preferences = document.getElementById('preferences').value;

    if (!carModel || !carType || !budget) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Show loading state in recommendations results
    recommendationsResults.innerHTML = `
        <div class="loading-container">
            <div class="loading-animation">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
            <p>Generating recommendations...</p>
        </div>
    `;

    const prompt = recommendationsPrompt
        .replace('{carModel}', carModel)
        .replace('{carType}', carType)
        .replace('{budget}', budget)
        .replace('{preferences}', preferences || 'None specified');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const recommendations = data.candidates[0].content.parts[0].text;
            recommendationsResults.innerHTML = `
                <div class="recommendation-card">
                    <div class="recommendation-content formatted-content">
                        ${recommendations.replace(/^(\d+)\.\s/gm, '<span class="number">$1.</span> ')
                                       .replace(/^-\s/gm, '<span class="dash">-</span> ')
                                       .replace(/<h2>/g, '<h2 class="response-heading">')
                                       .replace(/<h3>/g, '<h3 class="response-subheading">')
                                       .replace(/<p>/g, '<p class="response-paragraph">')}
                    </div>
                </div>
            `;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error:', error);
        recommendationsResults.innerHTML = `
            <div class="error-message">
                <p>Sorry, we encountered an error while generating recommendations. Please try again later.</p>
            </div>
        `;
    }
});

// Initialize
updateCounts();
renderAccessories();
renderWishlist();