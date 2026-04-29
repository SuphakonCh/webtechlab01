// Function to handle the rendering of the user interface
// It takes the 'products' array as an input and generates HTML for each product
function renderUI(products) {
    const container = document.getElementById('product-container');
    
    // Check if the target container exists in the DOM
    if (!container) {
        console.error('Error: #product-container not found in the DOM.');
        return;
    }

    // Clear any existing content or loading placeholders
    container.innerHTML = '';
    
    // Loop through each product object in the data array
    products.forEach(product => {
        // Create the HTML structure for a single product card
        const productHTML = `
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="rounded position-relative fruite-item d-flex flex-column">
                    <div class="fruite-img">
                        <img src="${product.image}" class="img-fluid w-100 rounded-top" alt="${product.name}">
                    </div>
                    <div class="text-white bg-secondary px-3 py-1 rounded position-absolute" style="top: 10px; left: 10px;">${product.category}</div>
                    <div class="p-4 border border-secondary border-top-0 rounded-bottom d-flex flex-column flex-grow-1 bg-white">
                        <h4>${product.name}</h4>
                        <p>${product.description}</p>
                        <div class="d-flex justify-content-between flex-lg-wrap mt-auto">
                            <p class="text-dark fs-5 fw-bold mb-0">$${product.price} / ${product.unit}</p>
                            <a href="#" class="btn border border-secondary rounded-pill px-3 text-primary"><i class="fa fa-shopping-bag me-2 text-primary"></i> Add to cart</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // Inject the product HTML block into the container
        container.insertAdjacentHTML('beforeend', productHTML);
    });
}

// Global variable to store all products fetched from the JSON file.
// This acts as the "master list" that filterProducts() can search through.
let allProducts = [];

/**
 * Filters the allProducts array based on a search term and a category.
 *
 * @param {string} searchTerm - The keyword to search for in the product name.
 * @param {string} category   - The category to filter by (e.g. "Fruits", "Vegetable").
 *                               Pass "All" to include every category.
 * @returns {Array} A new array containing only the products that match both criteria.
 */
function filterProducts(searchTerm, category) {

    // Use the Array.filter() method to create a new array
    // that only contains products matching our conditions.
    return allProducts.filter(product => {

        // --- Condition 1: Name matching (case-insensitive) ---
        // Convert both the product name and the search term to lowercase
        // so that "apple", "Apple", and "APPLE" all match each other.
        const nameMatch = product.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        // --- Condition 2: Category matching ---
        // If the selected category is "All", every product passes this check.
        // Otherwise, we compare the product's category with the selected one.
        const categoryMatch =
            category === 'All' || product.category === category;

        // A product is included in the result only when BOTH conditions are true.
        return nameMatch && categoryMatch;
    });
}

// Function to request products data from the JSON file
async function requestProducts() {
    try {
        // Data Flow Step 1: Request data from the local JSON file using the fetch() API
        const response = await fetch('products.json');
        
        // Data Flow Step 2: Check if the response is successful (e.g., HTTP status 200 OK)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Data Flow Step 3: Parse the JSON response body into a JavaScript array of objects
        const data = await response.json();

        // Store the full product list in the global variable
        // so that filterProducts() can access it at any time.
        allProducts = data;
        
        // Data Flow Step 4: Pass the parsed data to the renderUI function to display it on the screen
        renderUI(data);
        
    } catch (error) {
        // Error handling if fetch fails (e.g., file not found, network error)
        console.error('Failed to load products:', error);
        const container = document.getElementById('product-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <h4 class="text-danger">Sorry, we couldn't load the products at this time.</h4>
                    <p>Please try again later.</p>
                </div>
            `;
        }
    }
}
// ========================================
// SEARCH & CATEGORY WIRING
// ========================================

// Track the current filter state so both search and category work together
let currentCategory = 'All';
let currentSearchTerm = '';

/**
 * Apply current filters (search term + category) and re-render the product list.
 * This is the central function that gets called whenever the user changes
 * either the search input or the selected category tab.
 */
function applyFilters() {
    // Use our filterProducts function to get matching products
    const results = filterProducts(currentSearchTerm, currentCategory);

    // Render the filtered results into the product container
    renderUI(results);

    // If no products matched, show a friendly "not found" message
    if (results.length === 0) {
        const container = document.getElementById('product-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <h4>No products found</h4>
                    <p>Try a different search term or select another category.</p>
                </div>
            `;
        }
    }
}

// ========================================
// INITIALIZATION — runs when the page finishes loading
// ========================================
document.addEventListener('DOMContentLoaded', function () {

    // Step 1: Fetch all products from JSON, then set up the UI
    requestProducts().then(function () {

        // --- CATEGORY TAB CLICK HANDLERS ---
        // Select all tab links that have the 'category-tab' class
        const categoryTabs = document.querySelectorAll('.category-tab');

        categoryTabs.forEach(function (tab) {
            tab.addEventListener('click', function (e) {
                // Prevent the default anchor link behavior
                e.preventDefault();

                // Remove 'active' class from all tabs
                categoryTabs.forEach(function (t) {
                    t.classList.remove('active');
                });

                // Add 'active' class to the clicked tab
                this.classList.add('active');

                // Read the category from the data-category attribute
                currentCategory = this.dataset.category;

                // Re-apply filters with the new category
                applyFilters();
            });
        });

        // --- SEARCH INPUT HANDLER (Modal Search) ---
        const searchInput = document.getElementById('searchInput');
        // Variable to hold the debounce timer ID
        let searchTimer = null;

        if (searchInput) {
            // Listen for every keystroke in the search field
            searchInput.addEventListener('input', function () {
                // Clear the previous timer (if the user is still typing)
                clearTimeout(searchTimer);

                // Store the typed value temporarily
                const typedValue = this.value.trim();

                // Set a new timer — only apply filters after 300ms of no typing
                // This is called "debounce": it waits for the user to pause
                // before executing the search, avoiding unnecessary re-renders.
                searchTimer = setTimeout(function () {
                    // Update the current search term
                    currentSearchTerm = typedValue;

                    // Re-apply filters with the new search term
                    applyFilters();
                }, 300);
            });
        }

        // --- SEARCH ICON CLICK (close modal after search) ---
        const searchIcon = document.getElementById('search-icon-1');
        if (searchIcon) {
            searchIcon.addEventListener('click', function () {
                // Close the search modal so user can see results
                const modalEl = document.getElementById('searchModal');
                if (modalEl) {
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                }
            });
        }
    });
});
