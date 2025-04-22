document.addEventListener('DOMContentLoaded', function() {
  // Initialize the app
  initApp();
  
  // Set current year in footer
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  
  // Search button event listener
  document.getElementById('searchButton').addEventListener('click', comparePrices);
  
  // Allow search on Enter key
  document.getElementById('productInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      comparePrices();
    }
  });
  
  // Modal close button
  document.querySelector('.close-modal').addEventListener('click', closeModal);
  
  // Set price alert button
  document.getElementById('setAlertBtn').addEventListener('click', setPriceAlert);
});

// Initialize application
function initApp() {
  // Check for saved searches
  if (localStorage.getItem('recentSearches')) {
    // Could implement recent searches feature
  }
  
  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/js/serviceWorker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
}

// Main price comparison function
async function comparePrices() {
  const product = document.getElementById('productInput').value.trim();
  const category = document.getElementById('category').value;
  const resultsDiv = document.getElementById('results');
  const searchButton = document.getElementById('searchButton');
  
  if (!product) {
    showError('Please enter a product name to compare prices');
    return;
  }
  
  // Show loading state
  searchButton.disabled = true;
  searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
  resultsDiv.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Gathering prices from stores...
    </div>
  `;
  
  try {
    // In a real app, this would be an API call to your backend
    const mockResults = await fetchMockResults(product, category);
    
    if (mockResults.length === 0) {
      showEmptyState();
      return;
    }
    
    displayResults(mockResults, product);
    
    // Save search to history (for future implementation)
    saveSearchHistory(product, category);
    
  } catch (error) {
    console.error('Error comparing prices:', error);
    showError('Failed to fetch prices. Please try again later.');
  } finally {
    // Reset search button
    searchButton.disabled = false;
    searchButton.innerHTML = '<span class="button-text">Compare</span><i class="fas fa-arrow-right"></i>';
  }
}

// Fetch mock results (simulating API call)
async function fetchMockResults(product, category) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const query = `${category ? category + " " : ""}${product}`;
  
  // Mock data - in a real app, this would come from your backend API
  const stores = [
    {
      name: "Amazon",
      url: `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
      logo: "https://logo.clearbit.com/amazon.in",
      price: Math.floor(Math.random() * 5000) + 5000,
      originalPrice: Math.floor(Math.random() * 5000) + 7000,
      productName: `${product} (Latest Model)`
    },
    {
      name: "Flipkart",
      url: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
      logo: "https://logo.clearbit.com/flipkart.com",
      price: Math.floor(Math.random() * 5000) + 4500,
      originalPrice: Math.floor(Math.random() * 5000) + 6500,
      productName: `${product} (2023 Edition)`
    },
    {
      name: "Jio Mart",
      url: `https://www.jiomart.com/search?q=${encodeURIComponent(query)}`,
      logo: "https://logo.clearbit.com/jiomart.com",
      price: Math.floor(Math.random() * 5000) + 5500,
      originalPrice: Math.floor(Math.random() * 5000) + 7500,
      productName: `${product} (Premium Version)`
    },
    {
      name: "Myntra",
      url: `https://www.myntra.com/search?q=${encodeURIComponent(query)}`,
      logo: "https://logo.clearbit.com/myntra.com",
      price: Math.floor(Math.random() * 5000) + 4000,
      originalPrice: Math.floor(Math.random() * 5000) + 6000,
      productName: `${product} (Fashion Edition)`
    },
    {
      name: "Official Site",
      url: `https://www.google.com/search?q=${encodeURIComponent(query + ' official site')}`,
      logo: "https://logo.clearbit.com/google.com",
      price: Math.floor(Math.random() * 5000) + 6000,
      originalPrice: Math.floor(Math.random() * 5000) + 8000,
      productName: `${product} (Manufacturer Direct)`
    }
  ];
  
  return stores;
}

// Display results in the UI
function displayResults(results, product) {
  const resultsDiv = document.getElementById('results');
  
  resultsDiv.innerHTML = `
    <div class="results-header">
      <h2 class="results-title">Results for "${product}"</h2>
      <span class="results-count">${results.length} stores found</span>
    </div>
    <div class="results-grid">
      ${results.map(store => createResultCard(store)).join('')}
    </div>
  `;
  
  // Add event listeners to alert buttons
  document.querySelectorAll('.alert-btn').forEach(button => {
    button.addEventListener('click', function() {
      const storeName = this.getAttribute('data-store');
      const price = this.getAttribute('data-price');
      openAlertModal(storeName, price, product);
    });
  });
}

// Create HTML for a single result card
function createResultCard(store) {
  const discount = Math.round(((store.originalPrice - store.price) / store.originalPrice) * 100);
  
  return `
    <div class="result-card">
      <div class="store-header">
        <img src="${store.logo}" alt="${store.name} logo" class="store-logo">
        <h3 class="store-name">${store.name}</h3>
      </div>
      <p class="product-name">${store.productName}</p>
      <div class="price-container">
        <span class="current-price">₹${store.price.toLocaleString()}</span>
        <span class="original-price">₹${store.originalPrice.toLocaleString()}</span>
        ${discount > 0 ? `<span class="discount-badge">${discount}% OFF</span>` : ''}
      </div>
      <a href="${store.url}" target="_blank" class="view-deal-btn">View Deal</a>
      <button class="alert-btn" data-store="${store.name}" data-price="${store.price}">
        <i class="fas fa-bell"></i> Set Price Alert
      </button>
    </div>
  `;
}

// Show error state
function showError(message) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `
    <div class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>${message}</p>
    </div>
  `;
}

// Show empty state
function showEmptyState() {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-search"></i>
      <p>No results found. Try a different search term.</p>
    </div>
  `;
}

// Save search to history
function saveSearchHistory(product, category) {
  // In a real app, you would save this to localStorage or send to your backend
  const searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
  searches.unshift({ product, category, timestamp: new Date() });
  localStorage.setItem('recentSearches', JSON.stringify(searches.slice(0, 5)));
}

// Open price alert modal
function openAlertModal(storeName, price, product) {
  const modal = document.getElementById('alertModal');
  modal.style.display = 'flex';
  
  // Pre-fill the form
  document.getElementById('targetPrice').value = price;
  document.getElementById('email').focus();
  
  // You could also set data attributes on the modal to track which product/store
  modal.setAttribute('data-store', storeName);
  modal.setAttribute('data-product', product);
}

// Close modal
function closeModal() {
  document.getElementById('alertModal').style.display = 'none';
}

// Set price alert
function setPriceAlert() {
  const targetPrice = document.getElementById('targetPrice').value;
  const email = document.getElementById('email').value;
  const modal = document.getElementById('alertModal');
  const storeName = modal.getAttribute('data-store');
  const product = modal.getAttribute('data-product');
  
  if (!targetPrice || !email) {
    alert('Please fill in all fields');
    return;
  }
  
  // In a real app, you would send this to your backend
  console.log(`Price alert set for ${product} at ${storeName}: 
              Notify when price drops below ₹${targetPrice} 
              Email: ${email}`);
  
  // Show confirmation
  alert(`Price alert set! We'll notify you when ${product} on ${storeName} drops below ₹${targetPrice}`);
  
  // Close modal
  closeModal();
}

// Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/js/serviceWorker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}