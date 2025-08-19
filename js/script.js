// DOM Ready and Initialization
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
    } catch (error) {
        console.error('App initialization error:', error);
    }
});

// Main initialization function
function initializeApp() {
    initMobileMenu();
    initModals();
    initNewsletterPopup();
    initScrollEffects();
    loadProducts();
    initAddToCartButtons();
    initNewsletterForms();
    initHeaderBanner();
    initCartButton();
}

// Mobile Menu Toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            try {
                navMenu.classList.toggle('show');
                
                // Update hamburger icon
                const isOpen = navMenu.classList.contains('show');
                menuToggle.textContent = isOpen ? '✕' : '☰';
            } catch (error) {
                console.error('Menu toggle error:', error);
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('show');
                menuToggle.textContent = '☰';
            }
        });
    }
}

// Modal Management
function initModals() {
    const cartModal = document.getElementById('cart-modal');
    const closeModalBtn = cartModal?.querySelector('.close-modal');
    const continueShoppingBtn = cartModal?.querySelector('.continue-shopping');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => hideCartModal());
    }
    
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => hideCartModal());
    }
    
    // Close modal when clicking outside
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                hideCartModal();
            }
        });
    }
}

// Show Cart Modal
function showCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            hideCartModal();
        }, 3000);
    }
}

// Hide Cart Modal
function hideCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Newsletter Popup
function initNewsletterPopup() {
    const popup = document.getElementById('newsletter-popup');
    const closePopupBtn = popup?.querySelector('.close-popup');
    
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => hideNewsletterPopup());
    }
    
    // Close popup when clicking outside
    if (popup) {
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                hideNewsletterPopup();
            }
        });
    }
    
    // Show popup after 3 seconds (simulate original behavior)
    setTimeout(() => {
        showNewsletterPopup();
    }, 3000);
}

function showNewsletterPopup() {
    const popup = document.getElementById('newsletter-popup');
    const hasSeenPopup = localStorage.getItem('newsletter-popup-seen');
    
    if (popup && !hasSeenPopup) {
        popup.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideNewsletterPopup() {
    const popup = document.getElementById('newsletter-popup');
    if (popup) {
        popup.classList.remove('show');
        document.body.style.overflow = '';
        localStorage.setItem('newsletter-popup-seen', 'true');
    }
}

// Header Banner Close
function initHeaderBanner() {
    const closeBanner = document.querySelector('.close-banner');
    const headerTop = document.querySelector('.header-top');
    
    if (closeBanner && headerTop) {
        closeBanner.addEventListener('click', function() {
            headerTop.style.display = 'none';
        });
    }
}

// Scroll Effects
function initScrollEffects() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Product Loading
async function loadProducts() {
    try {
        // First try to load from localStorage (admin added products)
        const localProducts = getLocalProducts();
        
        // Then load from JSON file
        const jsonProducts = await loadProductsFromJSON();
        
        // Combine products (local products take priority)
        const allProducts = [...localProducts, ...jsonProducts];
        
        if (allProducts.length > 0) {
            renderBestSellers(allProducts.slice(0, 8));
            renderNewProducts(allProducts.slice(8, 16));
        } else {
            showNoProductsMessage();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNoProductsMessage();
    }
}

// Load products from JSON file
async function loadProductsFromJSON() {
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        return Array.isArray(products) ? products : [];
    } catch (error) {
        console.warn('Could not load products from JSON file:', error);
        return [];
    }
}

// Get products from localStorage
function getLocalProducts() {
    try {
        const products = localStorage.getItem('products');
        return products ? JSON.parse(products) : [];
    } catch (error) {
        console.warn('Could not load products from localStorage:', error);
        return [];
    }
}

// Render Best Sellers
function renderBestSellers(products) {
    const grid = document.getElementById('best-seller-grid');
    if (grid && products.length > 0) {
        grid.innerHTML = '';
        products.forEach(product => {
            const productCard = createProductCard(product);
            grid.appendChild(productCard);
        });
    }
}

// Render New Products
function renderNewProducts(products) {
    const grid = document.getElementById('new-products-grid');
    if (grid && products.length > 0) {
        grid.innerHTML = '';
        products.forEach(product => {
            const productCard = createProductCard(product);
            grid.appendChild(productCard);
        });
    }
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Calculate discount percentage
    const discountPercent = product.originalPrice && product.salePrice 
        ? Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)
        : 0;
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.imageUrl || 'assets/images/placeholder.jpg'}" 
                 alt="${product.name || 'Product'}" 
                 onerror="this.src='assets/images/placeholder.jpg'">
            ${discountPercent > 0 ? `<div class="sale-badge">Sale ${discountPercent}%</div>` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name || 'Unnamed Product'}</h3>
            <p class="product-description">${product.description || 'No description available'}</p>
            <div class="product-price">
                <span class="sale-price">$${product.salePrice || product.price || '0.00'}</span>
                ${product.originalPrice ? `<span class="original-price">$${product.originalPrice}</span>` : ''}
            </div>
            ${product.colors ? createColorOptions(product.colors) : ''}
            <button class="add-to-cart" data-product-id="${product.id || Date.now()}">ADD TO CART</button>
        </div>
    `;
    
    return card;
}

// Create Color Options
function createColorOptions(colors) {
    if (!Array.isArray(colors) || colors.length === 0) return '';
    
    const colorHtml = colors.map(color => 
        `<div class="color-option" style="background-color: ${color}" title="${color}"></div>`
    ).join('');
    
    return `<div class="product-colors">${colorHtml}</div>`;
}

// Show No Products Message
function showNoProductsMessage() {
    const grids = ['best-seller-grid', 'new-products-grid'];
    grids.forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (grid) {
            grid.innerHTML = '<div class="loading-message">No products available at the moment.</div>';
        }
    });
}

// Initialize Add to Cart Buttons
function initAddToCartButtons() {
    // Use event delegation for dynamically added buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            try {
                const productId = e.target.getAttribute('data-product-id');
                addToCart(productId);
                showCartModal();
            } catch (error) {
                console.error('Add to cart error:', error);
            }
        }
    });
}

// Add to Cart Function
function addToCart(productId) {
    try {
        // Get existing cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if product already exists in cart
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: productId,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
        
        // Save updated cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count in UI (if you have a cart counter)
        updateCartCount();
        
        console.log('Product added to cart:', productId);
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Update Cart Count
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update cart counter in UI
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
            
            // Hide counter if no items
            if (totalItems === 0) {
                cartCountElement.classList.add('hidden');
            } else {
                cartCountElement.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Newsletter Forms
function initNewsletterForms() {
    const forms = document.querySelectorAll('.newsletter-form, .popup-newsletter-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                const emailInput = form.querySelector('input[type="email"]');
                const email = emailInput?.value.trim();
                
                if (email && isValidEmail(email)) {
                    // Simulate newsletter signup
                    handleNewsletterSignup(email);
                    
                    // Show success message
                    showNewsletterSuccess(form);
                    
                    // Reset form
                    form.reset();
                    
                    // Hide popup if it's the popup form
                    if (form.classList.contains('popup-newsletter-form')) {
                        hideNewsletterPopup();
                    }
                } else {
                    showNewsletterError(form, 'Please enter a valid email address.');
                }
            } catch (error) {
                console.error('Newsletter signup error:', error);
                showNewsletterError(form, 'An error occurred. Please try again.');
            }
        });
    });
}

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle Newsletter Signup
function handleNewsletterSignup(email) {
    // Store in localStorage (in real app, this would be an API call)
    try {
        let subscribers = JSON.parse(localStorage.getItem('newsletter-subscribers')) || [];
        
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('newsletter-subscribers', JSON.stringify(subscribers));
        }
        
        console.log('Newsletter signup:', email);
    } catch (error) {
        console.error('Error storing newsletter signup:', error);
    }
}

// Show Newsletter Success
function showNewsletterSuccess(form) {
    const button = form.querySelector('button[type="submit"]');
    if (button) {
        const originalText = button.textContent;
        button.textContent = 'Success!';
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }
}

// Show Newsletter Error
function showNewsletterError(form, message) {
    // Create or update error message
    let errorDiv = form.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '14px';
        errorDiv.style.marginTop = '10px';
        form.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    
    // Hide error after 3 seconds
    setTimeout(() => {
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    }, 3000);
}

// Image Error Handling
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        // Replace broken images with placeholder
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
        e.target.alt = 'Image not found';
    }
}, true);

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance Optimization - Lazy Loading
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Cart Button Functionality
function initCartButton() {
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            showCartContents();
        });
    }
}

// Show Cart Contents
function showCartContents() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        let cartMessage = 'Cart Contents:\n\n';
        let total = 0;
        
        cart.forEach((item, index) => {
            cartMessage += `${index + 1}. Product ID: ${item.productId}\n`;
            cartMessage += `   Quantity: ${item.quantity}\n`;
            cartMessage += `   Added: ${new Date(item.addedAt).toLocaleDateString()}\n\n`;
        });
        
        cartMessage += `Total Items: ${cart.reduce((sum, item) => sum + item.quantity, 0)}`;
        
        alert(cartMessage);
    } catch (error) {
        console.error('Error showing cart contents:', error);
        alert('Error loading cart contents');
    }
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidEmail,
        addToCart,
        createProductCard
    };
}
