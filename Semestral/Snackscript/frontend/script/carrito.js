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
                        <span id="totalAmount">$${priceTotal.toFixed(2)}</span>
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
                            methods.showMessage('El producto fue borrado del carrito');
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
                            return;
                        }
                        methods.showMessage('No se puedo poner cantidades negativas', true);
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
                    methods.viewItemsCart();
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
                    methods.showMessage('Pedido en progreso. Consulta tus pedidos para más info.', false);
                    methods.clearUserCart();
                    methods.addPoints(data.order);
                } catch (error) {
                    console.error('Error al crear la orden:', error);
                    methods.showMessage('Error al crear la orden', true);
                }
            },
            async addPoints(order){
                try {
                    const response = await fetch('http://localhost:3000/api/points/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({order})
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.error || 'Error al añadir puntosssss');
                    }
                    console.log('✅Puntos añadidos:', data.points);
                    return data;
                } catch (error) {
                    console.error('❌ Error al añadir puntos:', error.message);
                    alert('Hubo un error al añadir los puntos.');
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
                    confirmAddressDialog.showModal();
                    return data.shippingAddress;
                } catch (error) {
                    console.error('Error en getUserAddress:', error.message);
                    return null;
                }
            },
            async getCouponsUser() {
                try {
                    const response = await fetch('http://localhost:3000/api/users/coupons', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (response.status === 401) {
                        const message = encodeURIComponent('Se ha cerrado la session, inicia nuevamente sesión');
                        window.location.href = `../view/logIn.html?message=${message}`;
                        return;
                    }
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Error desconocido');
                    return data.couponsChanged;
                } catch (error) {
                    console.error('Error al obtener cupones:', error);
                    return [];
                }
            },
            async renderCoupons() {
                const container = document.getElementById('couponsUser');
                container.innerHTML = ''; 
                const coupons = await methods.getCouponsUser();
                if (!coupons || coupons.length === 0) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'no-coupons';
                    messageDiv.innerHTML = `<p>No tienes cupones disponibles en este momento 😔</p>`;
                    container.appendChild(messageDiv);
                    return;
                }
                const userCouponsDiv = document.createElement('div');
                userCouponsDiv.className = 'user-coupons';
                const title = document.createElement('h1');
                title.textContent = 'Cupones disponibles:';
                userCouponsDiv.appendChild(title);
                coupons.forEach(coupon => {
                    const couponItem = document.createElement('div');
                    couponItem.className = 'coupon-item';
                    couponItem.innerHTML = `<p><strong>${coupon.name}</strong></p>`;
                    couponItem.addEventListener('click', () => {
                        const isSelected = couponItem.classList.contains('selected');

                        if (coupon.type === 'DESCUENTO') {
                            // Deseleccionar si ya está seleccionado
                            if (isSelected) {
                                couponItem.classList.remove('selected');
                                methods.showMessage(`Cupón de "${coupon.name}" removido`, false);
                                methods.applyDiscount(0); // Remueve el descuento
                            } else {
                                // Primero deselecciona cualquier otro cupón de tipo DESCUENTO
                                document.querySelectorAll('.coupon-item[data-type="DESCUENTO"].selected').forEach(el => {
                                    el.classList.remove('selected');
                                });
                                couponItem.classList.add('selected');
                                methods.showMessage(`Cupón de "${coupon.name}" aplicado`, false);
                                methods.applyDiscount(coupon.discountAmount);
                            }
                        } else {
                            // PRODUCTO: simplemente alternar el estado
                            couponItem.classList.toggle('selected');
                            const nowSelected = couponItem.classList.contains('selected');
                            methods.showMessage(`Cupón de producto "${coupon.name}" ${nowSelected ? 'aplicado' : 'removido'}`, false);
                        }
                    });

                    couponItem.dataset.type = coupon.type;
                    userCouponsDiv.appendChild(couponItem);
                });
                container.appendChild(userCouponsDiv);
                
            },
            applyDiscount(discount) {
                const totalAmountElement = document.getElementById('totalAmount');
                if (!totalAmountElement){
                    methods.showMessage('Agrega un producto al carrito para aplicar el cupon', true);
                    return;
                }
                let currentTotal = parseFloat(totalAmountElement.textContent.replace('$', ''));
                const discountAmount = currentTotal * discount;
                const finalTotal = Math.max(currentTotal - discountAmount, 0);
                totalAmountElement.textContent = `$${finalTotal.toFixed(2)}`;
            },
            showMessage(mensaje, color) {
                htmlElements.messageCart.textContent = mensaje;
                if (color) {
                    htmlElements.messageCart.style.backgroundColor = '#f94144';
                }else{
                    htmlElements.messageCart.style.backgroundColor = '#43aa8b';
                }
                htmlElements.messageCart.classList.add('show');
                setTimeout(() => {
                    htmlElements.messageCart.classList.remove('show');
                }, 3000);
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
                methods.renderCoupons();
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