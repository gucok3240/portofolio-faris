const products = [
    {
        id: 1,
        name: "Laptop Gaming Pro",
        price: 15000000,
        category: "elektronik",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop",
        description: "Laptop gaming dengan spesifikasi tinggi untuk performa maksimal."
    },
    {
        id: 2,
        name: "Smartphone Android",
        price: 5000000,
        category: "elektronik",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop",
        description: "Smartphone terbaru dengan kamera canggih dan baterai tahan lama."
    },
    {
        id: 3,
        name: "Buku Programming",
        price: 150000,
        category: "buku",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=200&fit=crop",
        description: "Panduan lengkap untuk belajar programming dari nol."
    },
    {
        id: 4,
        name: "Headphone Wireless",
        price: 800000,
        category: "elektronik",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop",
        description: "Headphone nirkabel dengan kualitas suara premium."
    },
    {
        id: 5,
        name: "Kaos Polos",
        price: 75000,
        category: "fashion",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop",
        description: "Kaos polos berkualitas tinggi, nyaman dipakai sehari-hari."
    },
    {
        id: 6,
        name: "Novel Best Seller",
        price: 85000,
        category: "buku",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=200&fit=crop",
        description: "Novel terlaris yang menghibur dan menginspirasi."
    }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let filteredProducts = [...products];
let currentSort = 'default';

const searchInput = document.getElementById('search');
const categorySelect = document.getElementById('category');
const sortSelect = document.getElementById('sort');
const productsContainer = document.getElementById('products');
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const closeCartBtn = document.getElementById('close-cart');
const checkoutForm = document.getElementById('checkout-form');
const productModal = document.getElementById('product-modal');
const productDetail = document.getElementById('product-detail');
const closeProductBtn = document.getElementById('close-product');

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function animateElement(element, animation) {
    element.style.animation = animation;
    element.addEventListener('animationend', () => {
        element.style.animation = '';
    }, { once: true });
}

function renderProducts(productsToRender) {
    productsContainer.innerHTML = '';

    if (productsToRender.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products" style="
                text-align: center;
                padding: 3rem;
                color: var(--muted);
                font-size: 1.1rem;
            ">
                <p>Produk tidak ditemukan</p>
            </div>
        `;
        return;
    }

    productsToRender.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'card';
        productCard.style.animationDelay = `${index * 0.1}s`;
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="card-body">
                <h3 style="margin: 0; font-size: 1rem; font-weight: 600;">${product.name}</h3>
                <p style="margin: 0.5rem 0; color: var(--muted); font-size: 0.9rem;">${product.category}</p>
                <div class="price">${formatCurrency(product.price)}</div>
                <div class="card-actions">
                    <button class="btn btn-outline" onclick="viewProduct(${product.id})">
                        Lihat Detail
                    </button>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">
                        Tambah ke Keranjang
                    </button>
                </div>
            </div>
        `;

        productCard.addEventListener('mouseenter', () => {
            animateElement(productCard, 'bounce 0.6s ease-in-out');
        });

        productsContainer.appendChild(productCard);
    });
}

function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categorySelect.value;

    filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.category.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || product.category === category;
        return matchesSearch && matchesCategory;
    });

    sortProducts();
    renderProducts(filteredProducts);
}

function sortProducts() {
    switch (currentSort) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            filteredProducts = [...products];
            filterProducts();
            return;
    }
    renderProducts(filteredProducts);
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
    saveCart();
    showToast(`${product.name} ditambahkan ke keranjang!`);
    animateElement(cartBtn, 'pulse 0.5s ease-in-out');
}

function updateCart() {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    renderCartItems();
    updateCartTotal();
}

function renderCartItems() {
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--muted);">Keranjang kosong</p>';
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div style="flex: 1;">
                <h4 style="margin: 0; font-size: 1rem;">${item.name}</h4>
                <div style="color: var(--accent); font-weight: 600;">${formatCurrency(item.price)}</div>
            </div>
            <div class="qty-controls">
                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #ef4444; cursor: pointer;">&times;</button>
        `;
        cartItems.appendChild(cartItem);
    });
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCart();
        saveCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCart();
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = formatCurrency(total);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function openModal(modal) {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    animateElement(modal, 'fadeIn 0.3s ease-out');
}

function closeModal(modal) {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
}

function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    productDetail.innerHTML = `
        <h2 id="product-title">${product.name}</h2>
        <img src="${product.image}" alt="${product.name}" style="width: 100%; max-width: 400px; border-radius: 8px; margin: 1rem 0;">
        <p style="color: var(--muted); text-transform: capitalize;">Kategori: ${product.category}</p>
        <div style="font-size: 1.5rem; font-weight: 600; color: var(--accent); margin: 1rem 0;">${formatCurrency(product.price)}</div>
        <p>${product.description}</p>
        <button class="btn btn-primary" onclick="addToCart(${product.id}); closeModal(productModal);" style="margin-top: 1rem;">
            Tambah ke Keranjang
        </button>
    `;

    openModal(productModal);
}

function handleCheckout(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    if (!name || !email) {
        showToast('Mohon lengkapi semua field!', 'error');
        return;
    }

    showToast('Checkout berhasil! (Demo)', 'success');
    cart = [];
    updateCart();
    saveCart();
    closeModal(cartModal);
    checkoutForm.reset();
}

document.addEventListener('DOMContentLoaded', () => {
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
    });

    renderProducts(products);
    updateCart();

    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(filterProducts, 300);
    });

    categorySelect.addEventListener('change', filterProducts);
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        sortProducts();
    });

    cartBtn.addEventListener('click', () => openModal(cartModal));
    closeCartBtn.addEventListener('click', () => closeModal(cartModal));

    closeProductBtn.addEventListener('click', () => closeModal(productModal));

    [cartModal, productModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    checkoutForm.addEventListener('submit', handleCheckout);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(cartModal);
            closeModal(productModal);
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }

    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }

    .card {
        animation: fadeIn 0.5s ease-out forwards;
        opacity: 0;
    }

    .toast {
        font-family: inherit;
    }

    .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        transition: all 0.2s ease;
    }

    .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(13, 17, 23, 0.15);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

