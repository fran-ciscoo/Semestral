import { navbarN, navbarS, footer } from "../component/navbar.js"
(() => {

    const App = (() => {
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),
            cartProdCount: document.querySelector('#cart-item-count'),
            cartList: document.querySelector('#cartList'),
            priceTotal: document.querySelector('#priceTotal'),
            priceItems: document.querySelector('#price-breakdown'),
            messageCart: document.querySelector('#messageCart'),
            btnBuy: document.querySelector('#btnBuy'),
            confirmAddressDialog: document.querySelector('#confirmAddressDialog'),
            addressInfo: document.querySelector('#address-info'),
            confirmBtn: document.querySelector('#btn-yes'),
            noBtn: document.querySelector('#btn-no'),
        }
        const methods = {
            async verfySession() {
                try {
                    const response = await fetch('http://localhost:3000/api/login/me', {
                        credentials: 'include',
                    });
                    if (response.status === 401) {
                        console.warn('No hay sesión activa');
                        return 'none';
                    }
                    if (!response.ok) {
                        console.warm('Error al verificar la sesión');
                        return 'none';
                    }
                    const data = await response.json();
                    return data.user?.role || 'none';

                } catch (error) {
                    console.error('Error al verificar la sesión:', error);
                    return 'none';
                }
            },

            async viewItemsCart() {
                try {
                    const cartList = htmlElements.cartList;
                    cartList.innerHTML = '';
                    const response = await fetch('http://localhost:3000/api/cart/cart', {
                        method: 'GET',
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        cartList.innerHTML = `
                            <li class="cart-empty">
                                <div class="empty-content">
                                    <span class="empty-icon">🛒</span>
                                    <p>Tu carrito está vacío</p>
                                    <a href="../view/index.html" class="btn-empty">Ir a comprar</a>
                                </div>
                            </li>
                        `;
                        htmlElements.cartProdCount.innerHTML = '0 artículos';
                        return;
                    }

                    const data = await response.json();
                    const cart = data.cart;
                    let priceTotal = 0, totalItems = 0;
                    const summary = htmlElements.priceItems;
                    summary.innerHTML = '';
                    if (!cart.items || cart.items.length === 0) {
                        cartList.innerHTML = `
                            <li class="cart-empty">
                                <div class="empty-content">
                                    <span class="empty-icon">🛒</span>
                                    <p>Tu carrito está vacío</p>
                                    <a href="../view/index.html" class="btn-empty">Ir a comprar</a>
                                </div>
                            </li>
                        `;
                        summary.innerHTML = '';
                        htmlElements.cartProdCount.innerHTML = '0 artículos';
                        return;
                    }
                    cart.items.forEach(item => {
                        const li = document.createElement('li');
                        li.classList.add('cart-item');

                        li.innerHTML = `
                            <img src="${item.product.image}" alt="${item.product.name}">
                            <div class="product-info">
                            <h3 class="product-title">${item.product.name}</h3>
                            <p class="product-description">${item.product.description}</p>
                            <p class="product-price">$${item.product.price.toFixed(2)}</p>
                            <div class="quantity-controls">
                                <button class="quantity-btn">-</button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="quantity-btn">+</button>
                            </div>
                            </div>
                            <div class="product-actions">
                            <button class="remove-btn" data-id="${item.product._id}">Eliminar</button>
                            </div>
                        `;
                        summary.innerHTML += `
                        <div class="price-row">
                            <span>${item.product.name} x ${item.quantity}</span>
                            <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                        
                        `;
                        cartList.appendChild(li);
                        priceTotal += item.product.price * item.quantity;
                        totalItems += item.quantity;
                        
                    });
                    htmlElements.cartProdCount.innerHTML = `${totalItems} artículos`;
                    summary.innerHTML += `
                    <br>
                    <div class="price-row">
                        <span>Subtotal (${totalItems} artículos)</span>
                        <span>$${priceTotal.toFixed(2)}</span>
                    </div>
                    <div class="price-row">
                        <span>Envío</span>
                        <span>Gratis</span>
                    </div>
                    <div class="price-row total">
                        <span>Total</span>
                        <span>$${priceTotal.toFixed(2)}</span>
                    </div>
                    `;
                    methods.updateQItemFront();
                    methods.deleteItem();
                    return {cart, priceTotal};
                } catch (error) {
                    console.error('Error al mostrar el carrito:', error);
                }
            },
            deleteItem() {
                document.querySelectorAll('.remove-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const productId = e.target.dataset.id;
                        try {
                            const response = await fetch(`http://localhost:3000/api/cart/delete/${productId}`, {
                                method: 'DELETE',
                                credentials: 'include'
                            });
                            if (!response.ok) {
                                console.error('Ocurrió un error al borrar el producto');
                                return;
                            }
                            e.target.closest('.cart-item');
                            htmlElements.messageCart.textContent = 'El producto fue borrado del carrito';
                            htmlElements.messageCart.classList.add('show');
                            setTimeout(() => {
                                htmlElements.messageCart.classList.remove('show');
                            }, 3000);
                            methods.viewItemsCart();
                        } catch (error) {
                            console.error('Error al eliminar producto:', error);
                        }
                    });
                });
            },
            updateQItemFront() {
                document.querySelectorAll('.cart-item').forEach(cartItem => {
                    const btnMinus = cartItem.querySelector('.quantity-btn:first-child');
                    const btnPlus = cartItem.querySelector('.quantity-btn:last-child');
                    const quantityDisplay = cartItem.querySelector('.quantity-display');
                    const productId = cartItem.querySelector('.remove-btn').dataset.id;

                    btnPlus.addEventListener('click', () => {
                        let quantity = parseInt(quantityDisplay.textContent);
                        quantity += 1;
                        quantityDisplay.textContent = quantity;
                        methods.updateQuantity(productId, quantity);
                    });

                    btnMinus.addEventListener('click', () => {
                        let quantity = parseInt(quantityDisplay.textContent);
                        if (quantity > 1) {
                            quantity -= 1;
                            quantityDisplay.textContent = quantity;
                            methods.updateQuantity(productId, quantity);
                        }
                        htmlElements.messageCart.textContent = 'No puede poner cantidades negativas';
                        htmlElements.messageCart.classList.add('show');
                        setTimeout(() => {
                            htmlElements.messageCart.classList.remove('show');
                        }, 3000); 
                    });
                });
            },
            async updateQuantity(productId, quantity) {
                try {
                    const response = await fetch(`http://localhost:3000/api/cart/update/${productId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ quantity })
                    });

                    if (!response.ok) {
                        console.warn('No se pudo actualizar la cantidad');
                    }
                    htmlElements.messageCart.textContent = 'Cantidad Actualizada';
                    htmlElements.messageCart.classList.add('show');
                    methods.viewItemsCart();
                    setTimeout(() => {
                        htmlElements.messageCart.classList.remove('show');
                    }, 3000);
                } catch (error) {
                    console.error('Error al actualizar cantidad:', error);
                }
            },
            async createOrder() {
                try {
                    const response = await fetch('http://localhost:3000/api/order', {
                        method: 'POST',
                        credentials: 'include',
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        htmlElements.messageCart.textContent = data.message;
                        htmlElements.messageCart.style.backgroundColor = '#f94144';
                        htmlElements.messageCart.classList.add('show');
                        setTimeout(() => {
                            htmlElements.messageCart.classList.remove('show');
                        }, 3000);
                        return;
                    }
                    htmlElements.messageCart.textContent = 'Pedido en progreso. Consulta tus pedidos para más info.';
                    htmlElements.messageCart.classList.add('show');
                    setTimeout(() => {
                        htmlElements.messageCart.classList.remove('show');
                    }, 3000);
                    methods.clearUserCart();
                } catch (error) {
                    console.error('Error al crear la orden:', error);
                    htmlElements.messageCart.textContent = 'Error al crear la orden.';
                    htmlElements.messageCart.classList.add('show');
                    setTimeout(() => {
                        htmlElements.messageCart.classList.remove('show');
                    }, 3000);
                }
            },
            async clearUserCart() {
                try {
                    const response = await fetch('http://localhost:3000/api/cart/clear', {
                        method: 'PUT',
                        credentials: 'include',
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        console.warn('No se pudo vaciar el carrito:', data.message);
                        return;
                    }
                    methods.viewItemsCart();
                } catch (error) {
                    console.error('Error al vaciar el carrito:', error);
                }
            },
            async addNavbar() {
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
            async getUserAddress() {
                try {
                    const { confirmAddressDialog } = htmlElements;
                    const response = await fetch('http://localhost:3000/api/users/address', {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    const data = await response.json();
                    /* const shippingAddress = data.shippingAddress; */
                    if (data.error === 'noAddress') {
                        htmlElements.messageCart.textContent = data.message;
                        htmlElements.messageCart.classList.add('show');
                        setTimeout(() => {
                            htmlElements.messageCart.classList.remove('show');
                            window.location.href = '../view/perfil.html?msg=noAddress';
                        }, 2000);
                        return;
                    }
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Error al obtener la dirección');
                    }
                    /* addressInfo.innerHTML = `
                    <p><strong>País:</strong> ${shippingAddress.country}</p>
                    <p><strong>Ciudad:</strong> ${shippingAddress.city}</p>
                    <p><strong>Dirección:</strong> ${shippingAddress.address}</p>
                    <p><strong>Código Postal:</strong> ${shippingAddress.postalCode}</p>
                    `; */
                    confirmAddressDialog.showModal();
                    return data.shippingAddress;
                } catch (error) {
                    console.error('Error en getUserAddress:', error.message);
                    return null;
                }
            },
            addFooter() {
                const container = htmlElements.footer;
                const generar = footer();
                methods.printHtml(container, generar);
            },

            printHtml(element, text) {
                element.innerHTML += `${text}`;
            }
        }

        return {
            init() {
                const { btnBuy, confirmBtn, noBtn, confirmAddressDialog} = htmlElements;
                methods.viewItemsCart();
                methods.addNavbar();
                methods.addFooter();
                btnBuy.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.getUserAddress();
                });
                confirmBtn.addEventListener('click', async (e) => {
                    htmlElements.confirmAddressDialog.close();
                    methods.createOrder();
                });
                noBtn.addEventListener('click', (e) => {
                    confirmAddressDialog.close();
                });
            }
        }
    })();
    App.init();
})();