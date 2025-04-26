// Initialize Gemini API
const GEMINI_API_KEY = 'AIzaSyBYE4hRDfskZ9bxY1avf972xnwQGIQuYaQ';

// Country-specific configurations
const countryConfigs = {
    'IN': {
        currency: '₹',
        examples: [
            'Basmati Rice (1kg) - ₹120',
            'Toor Dal (1kg) - ₹100',
            'Aata (5kg) - ₹250',
            'Milk (1L) - ₹60',
            'Paneer (200g) - ₹80'
        ],
        categories: [
            'Staples (Rice, Dal, Aata, etc.)',
            'Dairy Products (Milk, Paneer, Ghee, etc.)',
            'Fresh Produce (Vegetables, Fruits)',
            'Packaged Foods (Maggi, Biscuits, etc.)',
            'Spices and Condiments'
        ]
    },
    'US': {
        currency: '$',
        examples: [
            'Milk (1 gallon) - $3.99',
            'Bread - $2.49',
            'Eggs (dozen) - $4.29',
            'Chicken breast (1lb) - $3.99',
            'Apples (5) - $4.99'
        ],
        categories: [
            'Dairy & Eggs',
            'Bakery',
            'Meat & Seafood',
            'Produce',
            'Pantry Staples'
        ]
    },
    'GB': {
        currency: '£',
        examples: [
            'Milk (4 pints) - £1.50',
            'Bread - £1.20',
            'Eggs (6) - £1.80',
            'Chicken breast (500g) - £3.50',
            'Apples (6) - £2.00'
        ],
        categories: [
            'Dairy & Eggs',
            'Bakery',
            'Meat & Fish',
            'Fruit & Vegetables',
            'Store Cupboard'
        ]
    },
    'EU': {
        currency: '€',
        examples: [
            'Milk (1L) - €1.20',
            'Bread - €2.50',
            'Eggs (10) - €3.00',
            'Chicken breast (500g) - €5.00',
            'Apples (1kg) - €2.50'
        ],
        categories: [
            'Dairy & Eggs',
            'Bakery',
            'Meat & Fish',
            'Fruit & Vegetables',
            'Pantry'
        ]
    },
    'JP': {
        currency: '¥',
        examples: [
            'Rice (5kg) - ¥2,500',
            'Milk (1L) - ¥200',
            'Eggs (10) - ¥300',
            'Chicken breast (300g) - ¥500',
            'Apples (3) - ¥400'
        ],
        categories: [
            'Rice & Noodles',
            'Dairy & Eggs',
            'Meat & Seafood',
            'Fruit & Vegetables',
            'Pantry Items'
        ]
    },
    'AU': {
        currency: 'A$',
        examples: [
            'Milk (2L) - A$3.50',
            'Bread - A$3.00',
            'Eggs (12) - A$5.00',
            'Chicken breast (500g) - A$8.00',
            'Apples (1kg) - A$4.50'
        ],
        categories: [
            'Dairy & Eggs',
            'Bakery',
            'Meat & Seafood',
            'Fruit & Vegetables',
            'Pantry'
        ]
    },
    'CA': {
        currency: 'C$',
        examples: [
            'Milk (4L) - C$5.99',
            'Bread - C$3.49',
            'Eggs (12) - C$4.99',
            'Chicken breast (1kg) - C$12.99',
            'Apples (1kg) - C$4.99'
        ],
        categories: [
            'Dairy & Eggs',
            'Bakery',
            'Meat & Seafood',
            'Produce',
            'Pantry'
        ]
    }
};

function updatePlaceholder() {
    const country = document.getElementById("country").value;
    const config = countryConfigs[country];
    const textarea = document.getElementById("cartItems");
    textarea.placeholder = `Enter your shopping list here...\nExample:\n${config.examples.join('\n')}`;
}

function clearCart() {
    document.getElementById("cartItems").value = "";
    document.getElementById("output").textContent = "";
}

async function optimizeCart() {
    const cartItems = document.getElementById("cartItems").value;
    const output = document.getElementById("output");
    const loading = document.getElementById("loading");
    const country = document.getElementById("country").value;
    const config = countryConfigs[country];
    
    if (!cartItems.trim()) {
        output.textContent = "Please enter some items in your cart first!";
        return;
    }

    output.textContent = "";
    loading.style.display = "block";
    
    const prompt = `You are a smart shopping assistant specialized in ${country} groceries and prices. Here is a shopping cart list:\n${cartItems}\n\nPlease analyze this shopping list and provide the following information in a clear, organized format:

1. Organized Categories (${country} Grocery Style):
   ${config.categories.map(cat => `   - ${cat}`).join('\n')}
   - Remove any duplicates
   - List each item with its price in ${config.currency}

2. Smart Suggestions for ${country} Shoppers:
   - Suggest better deals or alternatives available in local markets
   - Recommend additional essential kitchen items if needed
   - Provide brief explanations for your suggestions
   - Consider seasonal availability of local produce
   - Suggest local alternatives for expensive items

3. Cost Analysis:
   - Calculate the total estimated cost in ${config.currency}
   - Highlight any potential savings from your suggestions
   - Compare prices with typical local market rates
   - Suggest bulk buying options where applicable

Please format your response in a clean, easy-to-read way without using any markdown symbols (*, **, etc.). Use simple text formatting with clear section headers and bullet points. Consider local shopping preferences and market conditions in your suggestions.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
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
            const aiReply = data.candidates[0].content.parts[0].text;
            // Clean up the response by removing any remaining markdown symbols
            const cleanedReply = aiReply
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/_/g, '')
                .replace(/`/g, '');
            output.textContent = cleanedReply;
        } else {
            throw new Error("Invalid response format from Gemini API");
        }
    } catch (error) {
        output.textContent = `Error: ${error.message}\nPlease check your API key and try again.`;
        console.error("Error details:", error);
    } finally {
        loading.style.display = "none";
    }
}

// Initialize the placeholder with default country (India)
updatePlaceholder();
  