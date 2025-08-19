// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeAdmin();
    } catch (error) {
        console.error('Admin initialization error:', error);
        showToast('Failed to initialize admin panel', 'error');
    }
});

// Global variables
let currentEditingId = null;
let allProducts = [];

// Main initialization function
function initializeAdmin() {
    initNavigation();
    initDashboardStats();
    initProductForm();
    initProductsList();
    initModals();
    initSearch();
    loadProducts();
}

// Navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Show corresponding section
                const targetId = this.getAttribute('href').substring(1);
                showSection(targetId);
            }
        });
    });
}

// Show specific section
function showSection(sectionId) {
    const sections = ['products', 'analytics', 'settings'];
    
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = id === sectionId ? 'block' : 'none';
        }
    });
}

// Dashboard Stats
function initDashboardStats() {
    updateDashboardStats();
}

function updateDashboardStats() {
    try {
        // Get data from localStorage
        const products = getLocalProducts();
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const subscribers = JSON.parse(localStorage.getItem('newsletter-subscribers')) || [];
        
        // Calculate stats
        const totalProducts = products.length;
        const cartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const newsletterSubscribers = subscribers.length;
        const totalValue = products.reduce((sum, product) => {
            return sum + (parseFloat(product.salePrice) || 0);
        }, 0);
        
        // Update UI
        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('cart-items').textContent = cartItems;
        document.getElementById('newsletter-subscribers').textContent = newsletterSubscribers;
        document.getElementById('total-value').textContent = `$${totalValue.toFixed(2)}`;
        
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

// Product Form
function initProductForm() {
    const addProductBtn = document.getElementById('add-product-btn');
    const productForm = document.getElementById('product-form');
    const closeFormBtn = document.getElementById('close-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const originalPriceInput = document.getElementById('original-price');
    const salePriceInput = document.getElementById('sale-price');
    const discountPercentInput = document.getElementById('discount-percent');
    
    // Show form
    addProductBtn.addEventListener('click', function() {
        showProductForm();
        resetForm();
        currentEditingId = null;
        document.getElementById('form-title').textContent = 'Add New Product';
    });
    
    // Hide form
    closeFormBtn.addEventListener('click', hideProductForm);
    cancelBtn.addEventListener('click', hideProductForm);
    
    // Form submission
    productForm.addEventListener('submit', handleFormSubmit);
    
    // Auto-calculate discount percentage
    function calculateDiscount() {
        const originalPrice = parseFloat(originalPriceInput.value) || 0;
        const salePrice = parseFloat(salePriceInput.value) || 0;
        
        if (originalPrice > 0 && salePrice > 0 && salePrice < originalPrice) {
            const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
            discountPercentInput.value = discount;
        } else {
            discountPercentInput.value = '';
        }
    }
    
    originalPriceInput.addEventListener('input', calculateDiscount);
    salePriceInput.addEventListener('input', calculateDiscount);
}

function showProductForm() {
    const container = document.getElementById('product-form-container');
    container.classList.add('show');
    container.scrollIntoView({ behavior: 'smooth' });
}

function hideProductForm() {
    const container = document.getElementById('product-form-container');
    container.classList.remove('show');
    resetForm();
    currentEditingId = null;
}

function resetForm() {
    const form = document.getElementById('product-form');
    form.reset();
    hideFormMessages();
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        // Clear previous messages
        hideFormMessages();
        
        // Get form data
        const formData = new FormData(e.target);
        const productData = {
            name: formData.get('name').trim(),
            category: formData.get('category'),
            description: formData.get('description').trim(),
            imageUrl: formData.get('imageUrl').trim(),
            originalPrice: parseFloat(formData.get('originalPrice')),
            salePrice: parseFloat(formData.get('salePrice')),
            colors: parseColorsInput(formData.get('colors')),
            stockQuantity: parseInt(formData.get('stockQuantity')) || 0
        };
        
        // Validate data
        const validation = validateProductData(productData);
        if (!validation.isValid) {
            showFormError(validation.message);
            return;
        }
        
        // Save product
        if (currentEditingId) {
            updateProduct(currentEditingId, productData);
            showToast('Product updated successfully!', 'success');
        } else {
            addProduct(productData);
            showToast('Product added successfully!', 'success');
        }
        
        // Reset form and hide
        hideProductForm();
        loadProducts();
        updateDashboardStats();
        
    } catch (error) {
        console.error('Form submission error:', error);
        showFormError('An error occurred while saving the product.');
    }
}

function parseColorsInput(colorsString) {
    if (!colorsString) return [];
    
    return colorsString.split(',')
        .map(color => color.trim())
        .filter(color => color.length > 0);
}

function validateProductData(data) {
    if (!data.name) {
        return { isValid: false, message: 'Product name is required.' };
    }
    
    if (!data.category) {
        return { isValid: false, message: 'Category is required.' };
    }
    
    if (!data.description) {
        return { isValid: false, message: 'Description is required.' };
    }
    
    if (!data.imageUrl || !isValidUrl(data.imageUrl)) {
        return { isValid: false, message: 'Valid image URL is required.' };
    }
    
    if (isNaN(data.originalPrice) || data.originalPrice <= 0) {
        return { isValid: false, message: 'Valid original price is required.' };
    }
    
    if (isNaN(data.salePrice) || data.salePrice <= 0) {
        return { isValid: false, message: 'Valid sale price is required.' };
    }
    
    if (data.salePrice > data.originalPrice) {
        return { isValid: false, message: 'Sale price cannot be higher than original price.' };
    }
    
    return { isValid: true };
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Product Management
function addProduct(productData) {
    const products = getLocalProducts();
    const newProduct = {
        id: Date.now(),
        ...productData,
        createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    saveLocalProducts(products);
}

function updateProduct(id, productData) {
    const products = getLocalProducts();
    const index = products.findIndex(p => p.id == id);
    
    if (index !== -1) {
        products[index] = {
            ...products[index],
            ...productData,
            updatedAt: new Date().toISOString()
        };
        saveLocalProducts(products);
    }
}

function deleteProduct(id) {
    const products = getLocalProducts();
    const filteredProducts = products.filter(p => p.id != id);
    saveLocalProducts(filteredProducts);
}

function getLocalProducts() {
    try {
        const products = localStorage.getItem('products');
        return products ? JSON.parse(products) : [];
    } catch (error) {
        console.error('Error loading products from localStorage:', error);
        return [];
    }
}

function saveLocalProducts(products) {
    try {
        localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
        console.error('Error saving products to localStorage:', error);
        throw new Error('Failed to save products');
    }
}

// Products List
function initProductsList() {
    loadProducts();
}

async function loadProducts() {
    try {
        // Show loading
        showProductsLoading();
        
        // Load from localStorage first
        const localProducts = getLocalProducts();
        
        // Load from JSON file as fallback
        let jsonProducts = [];
        try {
            const response = await fetch('data/products.json');
            if (response.ok) {
                jsonProducts = await response.json();
            }
        } catch (error) {
            console.warn('Could not load products from JSON file:', error);
        }
        
        // Combine products (local products take priority)
        allProducts = [...localProducts, ...jsonProducts.filter(jp => 
            !localProducts.some(lp => lp.id === jp.id)
        )];
        
        renderProductsTable(allProducts);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showProductsError();
    }
}

function showProductsLoading() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '<tr class="loading-row"><td colspan="8">Loading products...</td></tr>';
}

function showProductsError() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '<tr class="loading-row"><td colspan="8">Error loading products. Please try again.</td></tr>';
}

function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr class="no-products"><td colspan="8">No products found. Add your first product!</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => createProductRow(product)).join('');
}

function createProductRow(product) {
    const discountPercent = product.originalPrice && product.salePrice 
        ? Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)
        : 0;
    
    const stockStatus = getStockStatus(product.stockQuantity || 0);
    
    return `
        <tr>
            <td>
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K'">
            </td>
            <td>
                <div class="product-name" title="${product.name}">${product.name}</div>
            </td>
            <td>
                <span class="category-badge">${product.category || 'uncategorized'}</span>
            </td>
            <td class="price">$${product.originalPrice?.toFixed(2) || '0.00'}</td>
            <td class="price">$${product.salePrice?.toFixed(2) || '0.00'}</td>
            <td>
                ${discountPercent > 0 ? `<span class="discount-badge">${discountPercent}% OFF</span>` : '-'}
            </td>
            <td>
                <span class="stock-status ${stockStatus.class}">${stockStatus.text}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary btn-sm" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDeleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        </tr>
    `;
}

function getStockStatus(quantity) {
    if (quantity === 0) {
        return { class: 'out-of-stock', text: 'Out of Stock' };
    } else if (quantity < 10) {
        return { class: 'low-stock', text: `${quantity} left` };
    } else {
        return { class: 'in-stock', text: `${quantity} in stock` };
    }
}

// Edit Product
function editProduct(id) {
    const product = allProducts.find(p => p.id == id);
    if (!product) {
        showToast('Product not found', 'error');
        return;
    }
    
    // Fill form with product data
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-image').value = product.imageUrl || '';
    document.getElementById('original-price').value = product.originalPrice || '';
    document.getElementById('sale-price').value = product.salePrice || '';
    document.getElementById('product-colors').value = Array.isArray(product.colors) ? product.colors.join(', ') : '';
    document.getElementById('stock-quantity').value = product.stockQuantity || '';
    
    // Calculate discount
    const originalPrice = parseFloat(product.originalPrice) || 0;
    const salePrice = parseFloat(product.salePrice) || 0;
    if (originalPrice > 0 && salePrice > 0 && salePrice < originalPrice) {
        const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
        document.getElementById('discount-percent').value = discount;
    }
    
    // Set editing mode
    currentEditingId = id;
    document.getElementById('form-title').textContent = 'Edit Product';
    showProductForm();
}

// Delete Product
function confirmDeleteProduct(id) {
    currentEditingId = id;
    const modal = document.getElementById('delete-modal');
    modal.classList.add('show');
}

function deleteProductConfirmed() {
    if (currentEditingId) {
        deleteProduct(currentEditingId);
        loadProducts();
        updateDashboardStats();
        showToast('Product deleted successfully!', 'success');
        hideDeleteModal();
    }
}

// Search and Filter
function initSearch() {
    const searchInput = document.getElementById('search-products');
    const categoryFilter = document.getElementById('filter-category');
    
    searchInput.addEventListener('input', debounce(filterProducts, 300));
    categoryFilter.addEventListener('change', filterProducts);
}

function filterProducts() {
    const searchTerm = document.getElementById('search-products').value.toLowerCase();
    const categoryFilter = document.getElementById('filter-category').value;
    
    let filteredProducts = allProducts;
    
    // Filter by search term
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by category
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => 
            product.category === categoryFilter
        );
    }
    
    renderProductsTable(filteredProducts);
}

// Modals
function initModals() {
    const deleteModal = document.getElementById('delete-modal');
    const closeDeleteModal = document.getElementById('close-delete-modal');
    const cancelDelete = document.getElementById('cancel-delete');
    const confirmDelete = document.getElementById('confirm-delete');
    
    closeDeleteModal.addEventListener('click', hideDeleteModal);
    cancelDelete.addEventListener('click', hideDeleteModal);
    confirmDelete.addEventListener('click', deleteProductConfirmed);
    
    // Close modal when clicking outside
    deleteModal.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            hideDeleteModal();
        }
    });
}

function hideDeleteModal() {
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('show');
    currentEditingId = null;
}

// Form Messages
function showFormError(message) {
    const errorDiv = document.getElementById('form-error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    
    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 5000);
}

function showFormSuccess(message) {
    const successDiv = document.getElementById('form-success');
    successDiv.textContent = message;
    successDiv.classList.add('show');
    
    setTimeout(() => {
        successDiv.classList.remove('show');
    }, 3000);
}

function hideFormMessages() {
    document.getElementById('form-error').classList.remove('show');
    document.getElementById('form-success').classList.remove('show');
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">×</button>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => container.removeChild(toast), 300);
    }, 5000);
    
    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => container.removeChild(toast), 300);
    });
}

// Settings Functions
function initSettings() {
    const exportDataBtn = document.getElementById('export-data');
    const clearDataBtn = document.getElementById('clear-data');
    
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
    
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', confirmClearData);
    }
}

function exportData() {
    try {
        const data = {
            products: getLocalProducts(),
            cart: JSON.parse(localStorage.getItem('cart')) || [],
            subscribers: JSON.parse(localStorage.getItem('newsletter-subscribers')) || [],
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relavel-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Failed to export data', 'error');
    }
}

function confirmClearData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.removeItem('products');
        localStorage.removeItem('cart');
        localStorage.removeItem('newsletter-subscribers');
        
        loadProducts();
        updateDashboardStats();
        showToast('All data cleared successfully!', 'success');
    }
}

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

// Make functions globally available
window.editProduct = editProduct;
window.confirmDeleteProduct = confirmDeleteProduct;

// Initialize settings when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initSettings();
});
