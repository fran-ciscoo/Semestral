import {navbarN, navbarS, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),
            containerProduct: document.querySelector('#snackList'),
            btnTodo: document.querySelector('#btnTodo'),
            btnDulce: document.querySelector('#btnDulce'),
            btnSalado: document.querySelector('#btnSalado'),
            btnAcido: document.querySelector('#btnAcido'),
            btnPicante: document.querySelector('#btnPicante'),
            btnBebida: document.querySelector('#btnBebida'),
            messageCart: document.querySelector('#messageCart')
        }

        const methods = {
            viewOnlyCategory(category){
                fetch(`http://localhost:3000/api/productos/category?category=${category}`)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        const container = htmlElements.containerProduct;
                        container.innerHTML = '';

                        if (!Array.isArray(data.productos)) {
                            console.error('La propiedad "productos" no está definida o no es un array:', data);
                            return;
                        }

                        data.productos.forEach(product => {
                            const productCard = `
                                <div class="product-card">
                                    <div class="product-info">
                                        <img src="${product.image}" alt="${product.name} imagen" class="product-image">
                                        <h2 class="product-title">${product.name}</h2>
                                        <p class="product-description">${product.description}</p>
                                        <p class="product-price">$${product.price}</p>
                                        <div class="product-actions">
                                            <button class="add-to-cart-btn" data-id="${product._id}">Agregar al carrito</button>
                                            <button class="wishlist-btn" data-id="${product._id}">❤</button>
                                        </div>
                                    </div>
                                </div>`;
                            container.innerHTML += productCard;
                        });
                    }).catch(error => console.error('Error al obtener productos:', error));

            },

            async viewProducts() {
                try {
                    const response = await fetch('http://localhost:3000/api/productos');
                    const data = await response.json();
                    const rol = await methods.verfySession();

                    const container = htmlElements.containerProduct;
                    container.innerHTML = '';

                    data.productos.forEach(product => {
                        const productCard = document.createElement('div');
                        productCard.classList.add('product-card');

                        productCard.innerHTML = `
                            <div class="product-info">
                                <img src="${product.image}" alt="${product.name} imagen" class="product-image">
                                <h2 class="product-title">${product.name}</h2>
                                <p class="product-description">${product.description}</p>
                                <p class="product-price">$${product.price}</p>
                                <div class="product-actions">
                                    <button class="add-to-cart-btn" data-id="${product._id}">Agregar al carrito</button>
                                    <button class="wishlist-btn" data-id="${product._id}">❤</button>
                                </div>
                            </div>
                        `;
                        container.appendChild(productCard);
                    });
                    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                        button.addEventListener('click', (e) => {
                            if(rol === 'none'){
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
                            console.log(`Producto ${productId} añadido a favoritos.`);
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
                    htmlElements.messageCart.textContent = 'El producto fue agregado al carrito';
                    htmlElements.messageCart.classList.add('show');
                    setTimeout(() => {
                        htmlElements.messageCart.classList.remove('show');
                    }, 5000);
                    return data.cart || null;
                } catch (error) {
                    console.error('Error al agregar al carrito:', error);
                    return null;
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
            }
            }

        return{
            init(){
                const {btnTodo, btnDulce, btnAcido, btnSalado, btnPicante, btnBebida} = htmlElements
                methods.addNavbar();
                methods.addFooter();
                methods.viewProducts();

                btnTodo.addEventListener('click', (e) =>{
                    e.preventDefault();
                    methods.viewProducts();
                });

                btnDulce.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.viewOnlyCategory('Dulces');
                });

                btnSalado.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.viewOnlyCategory('Salados');
                });

                btnAcido.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.viewOnlyCategory('Acidos');
                });

                btnPicante.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.viewOnlyCategory('Picantes');
                });

                btnBebida.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.viewOnlyCategory('Bebidas');
                });

            }
        }
    })();
    App.init();
})();