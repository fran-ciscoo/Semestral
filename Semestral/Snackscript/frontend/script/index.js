import {navbarN, navbarS, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),
            containerProduct: document.querySelector('#snackList'),

            botones: document.querySelectorAll('.filters-container button'),
            countProducts: document.querySelector('#totalCount'),

            messageCart: document.querySelector('#messageCart')
        }

        const methods = {
            async viewOnlyCategory(category) {
                const rol = await methods.verfySession();
                try {
                    const response = await fetch(`http://localhost:3000/api/productos/category?category=${category}`);
                    const data = await response.json();

                    const container = htmlElements.containerProduct;
                    container.innerHTML = '';
                    htmlElements.countProducts.textContent = data.productos.length + ' productos encontrados';

                    if (!Array.isArray(data.productos)) {
                        console.error('La propiedad "productos" no está definida o no es un array:', data);
                        return;
                    }
                    data.productos.forEach(product => {
                        const isOutOfStock = product.stock === 0;
                        const productCard = document.createElement('div');
                        productCard.classList.add('product-card');
                        if (isOutOfStock) productCard.classList.add('out-of-stock');

                        productCard.innerHTML = `
                            <div class="product-info">
                                <img src="${product.image}" alt="${product.name} imagen" class="product-image">
                                <h2 class="product-title">${product.name}</h2>
                                <p class="product-description">${product.description}</p>
                                <p class="product-price">$${product.price.toFixed(2)}</p>
                                <div class="product-actions">
                                    <button class="add-to-cart-btn" data-id="${product._id}" ${isOutOfStock ? 'disabled' : ''}>
                                        ${isOutOfStock ? 'Agotado' : 'Agregar al carrito'}
                                    </button>
                                    <button class="wishlist-btn" data-id="${product._id}">❤</button>
                                </div>
                            </div>
                        `;
                        container.appendChild(productCard);
                    });

                    document.querySelectorAll('.wishlist-btn').forEach(button => {
                        button.addEventListener('click', (e) => {
                            const productId = e.target.dataset.id;
                            methods.addToFavorites(productId);
                        });
                    });

                    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                        button.addEventListener('click', (e) => {
                            if (rol === 'none') {
                                const message = encodeURIComponent('Necesita una cuenta para agregar productos al carrito');
                                window.location.href = `../view/logIn.html?message=${message}`;
                                return;
                            }
                            const productId = e.target.dataset.id;
                            methods.addToCart(productId);
                            console.log(`Producto ${productId} agregado al carrito.`);
                        });
                    });
                } catch (error) {
                    console.error('Error al obtener productos:', error);
                }
            },
            async viewFavorites() {
                try {
                    const rol = await methods.verfySession();
                    const response = await fetch('http://localhost:3000/api/users/favorites', {
                        method: 'GET',
                        credentials: 'include'
                    });

                    const data = await response.json();
                    const container = htmlElements.containerProduct;
                    container.innerHTML = '';
                    const productos = data.favorites;

                    htmlElements.countProducts.textContent = productos.length + ' productos en favoritos';

                    if (!Array.isArray(productos)) {
                        console.error('La propiedad "favorites" no está definida o no es un array:', data);
                        return;
                    }

                    productos.forEach(product => {
                        const outOfStock = product.stock === 0;
                        const productCard = document.createElement('div');
                        productCard.classList.add('product-card');

                        if (outOfStock) {
                            productCard.style.backgroundColor = '#f0f0f0'; // gris claro
                            productCard.style.opacity = '0.7';
                        }

                        productCard.innerHTML = `
                            <div class="product-info">
                                <img src="${product.image}" alt="${product.name} imagen" class="product-image">
                                <h2 class="product-title">${product.name}</h2>
                                <p class="product-description">${product.description}</p>
                                <p class="product-price">$${product.price.toFixed(2)}</p>
                                <div class="product-actions">
                                    <button class="add-to-cart-btn" data-id="${product._id}" ${outOfStock ? 'disabled style="cursor:not-allowed;opacity:0.5;"' : ''}>Agregar al carrito</button>
                                    <button class="wishlist-btn" data-id="${product._id}">❤</button>
                                </div>
                            </div>
                        `;
                        container.appendChild(productCard);
                    });

                    document.querySelectorAll('.wishlist-btn').forEach(button => {
                        button.addEventListener('click', (e) => {
                            const productId = e.target.dataset.id;
                            methods.addToFavorites(productId);
                            methods.viewFavorites(); // Refrescar vista tras quitar favorito
                        });
                    });

                    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                        button.addEventListener('click', (e) => {
                            if (rol === 'none') {
                                const message = encodeURIComponent('Necesita una cuenta para agregar productos al carrito');
                                window.location.href = `../view/logIn.html?message=${message}`;
                                return;
                            }
                            const productId = e.target.dataset.id;
                            methods.addToCart(productId);
                            console.log(`Producto ${productId} agregado al carrito.`);
                        });
                    });

                } catch (error) {
                    console.error('Error al obtener productos favoritos:', error);
                }
            },
            async viewProducts() {
                try {
                    const response = await fetch('http://localhost:3000/api/productos');
                    const data = await response.json();
                    const rol = await methods.verfySession();
                    const container = htmlElements.containerProduct;
                    container.innerHTML = '';
                    htmlElements.countProducts.textContent = data.productos.length + ' productos encontrados';
                    data.productos.forEach(product => {
                        const productCard = document.createElement('div');
                        const isOutOfStock = product.stock === 0;
                        productCard.classList.add('product-card');
                        if (isOutOfStock) productCard.classList.add('out-of-stock');
                        const stockClass = isOutOfStock ? 'out-of-stock' : '';
                        productCard.innerHTML = `
                            <div class="product-info ${stockClass}">
                                <img src="${product.image}" alt="${product.name} imagen" class="product-image">
                                <h2 class="product-title">${product.name}</h2>
                                <p class="product-description">${product.description}</p>
                                <p class="product-price">$${product.price.toFixed(2)}</p>
                                <div class="product-actions">
                                    <button class="add-to-cart-btn" data-id="${product._id}" ${isOutOfStock ? 'disabled' : ''}>
                                        ${isOutOfStock ? 'Agotado' : 'Agregar al carrito'}
                                    </button>
                                    <button class="wishlist-btn" data-id="${product._id}">❤</button>
                                </div>
                            </div>
                        `;
                        container.appendChild(productCard);
                    });
                    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                        button.addEventListener('click', (e) => {
                            if (rol === 'none') {
                                const message = encodeURIComponent('Necesita una cuenta para agregar productos al carrito');
                                window.location.href = `../view/logIn.html?message=${message}`;
                                return;
                            }
                            const productId = e.target.dataset.id;
                            methods.addToCart(productId);
                            console.log(`Producto ${productId} agregado al carrito.`);
                        });
                    });
                    document.querySelectorAll('.wishlist-btn').forEach(button => {
                        button.addEventListener('click', (e) => {
                            const productId = e.target.dataset.id;
                            methods.addToFavorites(productId);
                        });
                    });
                } catch (error) {
                    console.error('Error al obtener productos:', error);
                }
            },
            async addToCart(productId) {
                try {
                    const response = await fetch('http://localhost:3000/api/cart', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            productId,
                        })
                    });

                    if (!response.ok) {
                        console.warn('Error al agregar el producto al carrito');
                        return null;
                    }
                    const data = await response.json();
                    methods.showMessage('El producto fue agregado al carrito', false);
                    return data.cart || null;
                } catch (error) {
                    console.error('Error al agregar al carrito:', error);
                    return null;
                }
            },
            async addToFavorites(productId) {
                try {
                    const response = await fetch(`http://localhost:3000/api/users/favorites/${productId}`, {
                        method: 'POST',
                        credentials: 'include',
                    });
                    const data = await response.json();
                    if (!response.ok && data.error === 401) {
                        const message = encodeURIComponent('Necesita una cuenta para agregar productos a favoritos');
                        window.location.href = `../view/logIn.html?message=${message}`;
                        return;
                    }
                    if (!response.ok) {
                        console.error("Ocurrió algo inesperado: "+ data.message);
                    }
                    methods.showMessage(data.message, false);
                } catch (error) {
                    console.error('Error al agregar a favoritos:', error);
                }
            },
            async verfySession(){
                try{
                    const response = await fetch ('http://localhost:3000/api/login/me',{
                        credentials: 'include',
                    });
                    if (response.status === 401) {
                        return 'none';
                    }
                    if (!response.ok) {
                        console.warm('Error al verificar la sesión');
                        return 'none';
                    }
                    const data = await response.json();
                    return data.user?.role || 'none';
                    
                }catch (error) {
                    console.error('Error al verificar la sesión:', error);
                    return 'none';
                }
            },
            showMessage(mensaje, color) {
                htmlElements.messageCart.textContent = mensaje;
                if (color) {
                    htmlElements.messageCart.style.background = 'linear-gradient(135deg, #F26052 0%, #D32F2F 100%';
                } else {
                    htmlElements.messageCart.style.background = 'linear-gradient(135deg, #43aa8b 0%, #2e7d32 100%)';
                }
                htmlElements.messageCart.classList.add('show');
                setTimeout(() => {
                    htmlElements.messageCart.classList.remove('show');
                }, 3000);
            },
            async addNavbar(){
                const container = htmlElements.navbar;
                const role = await methods.verfySession();
                console.log(role);
                let generar;

                if (role === 'subscriber') {
                    generar = navbarS();
                } else {
                    generar = navbarN();
                }

                methods.printHtml(container, generar);
            },

            addFooter(){
                const container = htmlElements.footer;
                const generar = footer();
                methods.printHtml(container, generar);
            },

            printHtml(element, text) {
                element.innerHTML += `${text}`;
            },
            showUrlMessage() {
                const params = new URLSearchParams(window.location.search);
                const message = params.get('message');
                if(message){
                    methods.showMessage(message, true);
                }
            }  
            }

        return{
            init(){
                const {botones} = htmlElements
                methods.addNavbar();
                methods.addFooter();
                methods.viewProducts();
                methods.showUrlMessage()
                botones.forEach((boton) =>{
                    boton.addEventListener('click', (e) =>{
                        e.preventDefault();
                        const id = boton.id.split("btn")[1];
                        if (id === "Favoritos") {
                            methods.viewFavorites();
                        } else if (id === "Todo") {
                            methods.viewProducts();
                        } else {
                            methods.viewOnlyCategory(id);
                        }
                    })
                });
            }
        }
    })();
    App.init();
})();