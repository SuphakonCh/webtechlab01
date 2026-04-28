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

// Initialization: Execute requestProducts when the HTML document is fully parsed and loaded
document.addEventListener('DOMContentLoaded', requestProducts);
