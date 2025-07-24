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
            messageCart: document.querySelector('#messageCart')
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
                    const response = await fetch('http://localhost:3000/api/cart/cart', {
                        method: 'GET',
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        console.warn('No se pudo obtener el carrito');
                        return;
                    }

                    const data = await response.json();
                    const cart = data.cart;
                    const cartList = htmlElements.cartList;
                    let priceTotal = 0, totalItems = 0;
                    cartList.innerHTML = '';
                    const summary = htmlElements.priceItems;
                    summary.innerHTML = '';
                    htmlElements.cartProdCount.innerHTML = `${cart.items.length} artículos`;
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
                    summary.innerHTML += `
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
                                window.location.href = `../view/carrito.html`;
                            }, 3000);
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

                        setTimeout(async () => {
                            await methods.updateQuantity(productId, quantity);
                        }, 3000);
                    });

                    btnMinus.addEventListener('click', () => {
                        let quantity = parseInt(quantityDisplay.textContent);
                        if (quantity > 1) {
                            quantity -= 1;
                            quantityDisplay.textContent = quantity;

                            setTimeout(async () => {
                                await method.updateQuantity(productId, quantity);
                            }, 3000);
                        }
                        htmlElements.messageCart.textContent = 'No puede poner cantidades negativas';
                        htmlElements.messageCart.style.background.color = '#f43636'; 
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
                    setTimeout(() => {
                        htmlElements.messageCart.classList.remove('show');
                        window.location.href = `../view/carrito.html`;
                    }, 3000);
                } catch (error) {
                    console.error('Error al actualizar cantidad:', error);
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
                methods.viewItemsCart();
                methods.addNavbar();
                methods.addFooter();
            }
        }
    })();
    App.init();
})();