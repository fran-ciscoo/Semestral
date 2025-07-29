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
            async verifySession() {
                try {
                    const response = await fetch('http://localhost:3000/api/login/me', {
                        credentials: 'include',
                    });
                    if (response.status === 401) {
                        console.warn('No hay sesión activa');
                        return 'none';
                    }
                    if (!response.ok) {
                        console.warn('Error al verificar la sesión');
                        return 'none';
                    }
                    const data = await response.json();
                    return data.user?.role ?? 'none';

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
                    const data = await response.json();
                    const cart = data.cart;
                    const role = await methods.verifySession();
                    if ( role === 'subscriber'){
                        methods.renderCoupons(cart);
                    }else{
                        const container = document.getElementById('couponsUser');
                        if (container) {
                            container.remove();
                        }
                    }
                    let totalItems = 0;
                    const summary = htmlElements.priceItems;
                    summary.innerHTML = '';

                    if (!response.ok || !cart.items || cart.items.length === 0) {
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
                        li.dataset.stock = item.product.stock;
                        const priceText = item.isFree ? '<strong style="color: green">GRATIS</strong>' : `$${item.product.price.toFixed(2)}`;
                        const totalItemPrice = item.isFree ? '<strong style="color: green">GRATIS</strong>' : `$${(item.product.price * item.quantity).toFixed(2)}`;
                        if(item.isFree){
                            li.innerHTML = `
                            <img src="${item.product.image}" alt="${item.product.name}">
                            <div class="product-info">
                            <h3 class="product-title">${item.product.name}</h3>
                            <p class="product-description">${item.product.description}</p>
                            <p class="product-price">${priceText}</p>
                            </div>
                            <div class="product-actions">
                            </div>
                        `;
                        }else{
                            li.innerHTML = `
                            <img src="${item.product.image}" alt="${item.product.name}">
                            <div class="product-info">
                            <h3 class="product-title">${item.product.name}</h3>
                            <p class="product-description">${item.product.description}</p>
                            <p class="product-price">${priceText}</p>
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
                        }

                        summary.innerHTML += `
                            <div class="price-row">
                            <span>${item.product.name} x ${item.quantity}</span>
                            <span>${totalItemPrice}</span>
                            </div>
                        `;

                        cartList.appendChild(li);
                        totalItems += item.quantity;
                    });

                    htmlElements.cartProdCount.innerHTML = `${totalItems} artículos`;
                    summary.innerHTML += `
                        <br>
                        <div class="price-row">
                            <span>Subtotal (${totalItems} artículos)</span>
                            <span>$${cart.totalAmount.toFixed(2)}</span>
                        </div>
                        <div class="price-row" id="discount">
                            
                        </div>
                        <div class="price-row">
                            <span>Envío</span>
                            <span>Gratis</span>
                        </div>
                        <div class="price-row total">
                            <span>Total</span>
                            <span id="totalAmount">$${cart.totalAmount.toFixed(2)}</span>
                        </div>
                    `;

                    methods.updateQItemFront();
                    methods.deleteItem();
                    return { cart };
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
                            methods.showMessage('El producto fue borrado del carrito', false);
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
                    const removeBtn = cartItem.querySelector('.remove-btn');
                    if (!removeBtn) return;

                    const productId = removeBtn.dataset.id;
                    const maxStock = parseInt(cartItem.dataset.stock);
                    let currentQuantity = parseInt(quantityDisplay.textContent);

                    const updateButtonsState = () => {
                        btnPlus.disabled = currentQuantity >= maxStock;
                        btnMinus.disabled = currentQuantity <= 1;

                        if (currentQuantity >= maxStock) {
                            methods.showMessage('Has alcanzado el stock máximo disponible.', true);
                        } else if (currentQuantity <= 1) {
                            methods.showMessage('La cantidad mínima es 1.', true);
                        }
                    };

                    updateButtonsState();

                    btnPlus.addEventListener('click', () => {
                        if (currentQuantity < maxStock) {
                            currentQuantity += 1;
                            quantityDisplay.textContent = currentQuantity;
                            methods.updateQuantity(productId, currentQuantity);
                            updateButtonsState();
                        }
                    });

                    btnMinus.addEventListener('click', () => {
                        if (currentQuantity > 1) {
                            currentQuantity -= 1;
                            quantityDisplay.textContent = currentQuantity;
                            methods.updateQuantity(productId, currentQuantity);
                            updateButtonsState();
                        } else {
                            methods.showMessage('No se puede poner cantidades negativas', true);
                        }
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

                    const data = await response.json();

                    if (response.status === 400) {
                        methods.showMessage(data.message || 'No se puede actualizar la cantidad.', true);
                        return;
                    }

                    if (!response.ok) {
                        console.warn('❌ No se pudo actualizar la cantidad:', data.message || 'Error desconocido.');
                        methods.showMessage(data.message || 'Error al actualizar cantidad.', true);
                        return;
                    }

                    methods.viewItemsCart();
                } catch (error) {
                    console.error('🌐 Error al actualizar cantidad:', error);
                    methods.showMessage('Error de red al actualizar cantidad.', true);
                }
            },
            async createCheckoutSession() {
                try {
                    const response = await fetch('http://localhost:3000/api/cart/create-checkout-session', {
                        method: 'POST',
                    });
                    const data = await response.json();
                    if (data.url) {
                        window.location.href = data.url;
                    } else {
                        console.error('No se pudo crear la sesión:', data.message);
                    }
                } catch (error) {
                    console.error('Error al crear la sesión de checkout:', error);
                }
            },
            async checkStripeSession() {
                const urlParams = new URLSearchParams(window.location.search);
                const sessionId = urlParams.get('session_id');
                if (sessionId) {
                    try {
                        const response = await fetch('http://localhost:3000/api/order/verificar-pago', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({ session_id: sessionId }),
                        });
                        const data = await response.json();
                        if (response.ok) {
                            console.log('Orden creada:', data.order);
                            if(data.order.status === 'PENDIENTE'){
                                methods.showMessage('Pago exitoso, orden creada.', false);
                                await methods.updateStock();
                            }else{
                                methods.showMessage('La ordern fue cancela, dirigete a la vista de pedidos', true);
                            }
                            methods.clearUserCart();
                            const role = await methods.verifySession();
                            if(role === 'subscriber'){
                                methods.addPoints(data.order);
                            }
                            const selectedDiscountCouponId = localStorage.getItem('selectedDiscountCoupon');
                            console.log(selectedDiscountCouponId);
                            const selectedCoupons = document.querySelectorAll('.coupon-item.selected');
                            const selectedIds = Array.from(selectedCoupons).map(coupon => coupon.dataset.id);
                            if (selectedDiscountCouponId && !selectedIds.includes(selectedDiscountCouponId)) {
                                selectedIds.push(selectedDiscountCouponId);
                            }
                            methods.deleteUsedCoupons(selectedIds);
                            methods.viewItemsCart();
                        } else {
                            console.error('Error:', data.message);
                            methods.showMessage('Error verificando el pago.', true);
                        }
                    } catch (err) {
                        console.error('Error al verificar pago:', err);
                    }
                }
            },
            async updateStock() {
                try {
                    const response = await fetch('http://localhost:3000/api/productos/stock', {
                        method: 'PUT',
                        credentials: 'include', 
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        console.error('Error al actualizar el stock:', data.error);
                        return;
                    }
                    console.log('✅ Stock actualizado:', data.message);
                } catch (err) {
                    console.error('Error de red al actualizar el stock:', err);
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
                    methods.showMessage("¡Has ganado puntos! Revisa la sección de puntos para más detalles.", false);
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
                } catch (error) {
                    console.error('Error al vaciar el carrito:', error);
                }
            },
            async addNavbar() {
                const container = htmlElements.navbar;
                const role = await methods.verifySession();
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
                        const message = encodeURIComponent('Completa la direccion de envio para hacer compras');
                        window.location.href = `../view/perfil.html?msg=${message}`;
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
            async deleteUsedCoupons(usedCouponIds) {
                try {
                    const response = await fetch('http://localhost:3000/api/users/coupons/used', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ couponIds: usedCouponIds })
                    });

                    const data = await response.json();
                    if (response.ok) {
                        console.log('Cupones eliminados correctamente:', data);
                        //methods.viewItemsCart();
                    } else {
                        console.error('No hay cupones a eliminar:', data.message);
                    }
                    
                } catch (error) {
                    console.error('Error de red al eliminar cupones:', error);
                }
            },
            async renderCoupons(cart) {
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
                    couponItem.dataset.id = coupon._id;
                    couponItem.className = 'coupon-item';
                    couponItem.innerHTML = `<p><strong>${coupon.name}</strong></p>`;
                    if (coupon.type === 'PRODUCTO') {
                        const productId = coupon.applicableTo[0];
                        const alreadyInCart = cart.items.some(item =>
                            item.isFree === true && item.product._id.toString() === productId
                        );
                        console.log(alreadyInCart);
                        if (alreadyInCart) {
                            couponItem.classList.add('selected');
                        }
                    }
                    couponItem.addEventListener('click', () => {
                        const isSelected = couponItem.classList.contains('selected');
                        if (coupon.type === 'DESCUENTO') {
                            const totalAmountElement = document.getElementById('totalAmount');
                            if (!totalAmountElement) {
                                methods.showMessage('Agrega un producto al carrito para aplicar el cupón', true);
                                return;
                            }
                            if (isSelected) {
                                couponItem.classList.remove('selected');
                                methods.showMessage(`Cupón de "${coupon.name}" removido`, true);
                                methods.viewItemsCart();
                                methods.updateCartCoupon(null);
                                localStorage.removeItem('selectedDiscountCoupon');
                            } else {
                                const messageDiscount = document.querySelector('#discount');
                                const alreadySelected = document.querySelector('.coupon-item.selected[data-type="DESCUENTO"]');
                                if (alreadySelected) {
                                    methods.showMessage('Ya tienes un cupón de descuento activo', true);
                                } else {
                                    couponItem.classList.add('selected');
                                    methods.showMessage(`Cupón de "${coupon.name}" aplicado`, false);
                                    messageDiscount.innerHTML = `
                                        <span>Descuento</span>
                                        <span>$${coupon.discountAmount * 100}%</span>
                                    `;
                                    methods.applyDiscount(coupon.discountAmount);
                                    methods.updateCartCoupon(coupon._id);
                                    localStorage.setItem('selectedDiscountCoupon', coupon._id);
                                }
                            }
                        }
                        else if (coupon.type === 'PRODUCTO') {
                            const productId = coupon.applicableTo[0];
                            if (isSelected) {
                                couponItem.classList.remove('selected');
                                methods.showMessage(`Producto gratis "${coupon.name}" removido`, true);
                                methods.removeFreeProduct(productId);
                            } else {
                                couponItem.classList.add('selected');
                                methods.applyFreeProduct(productId);
                            }
                        }
                    });
                    couponItem.dataset.type = coupon.type;
                    userCouponsDiv.appendChild(couponItem);
                });
                container.appendChild(userCouponsDiv);
            },
            async updateCartCoupon(couponId) {
                try {
                    const response = await fetch('http://localhost:3000/api/cart/coupon', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            couponId
                        })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        
                        return data.cart;
                    } else{
                        console.warn('Error al actualizar el cupón:', data.message);
                    }
                } catch (error) {
                    console.error('Error de red al actualizar el cupón:', error);
                }
            },
            applyDiscount(discount) {
                const totalAmountElement = document.getElementById('totalAmount');
                let currentTotal = parseFloat(totalAmountElement.textContent.replace('$', ''));
                const discountAmount = currentTotal * discount;
                const finalTotal = Math.max(currentTotal - discountAmount, 0);
                totalAmountElement.textContent = `$${finalTotal.toFixed(2)}`;
            },
            async applyFreeProduct(productId) {
                try {
                    const response = await fetch('http://localhost:3000/api/cart/free-product', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ productId })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        methods.showMessage(`Producto gratuito "${data.productName}" agregado al carrito`, false);
                        methods.viewItemsCart();
                    } else {
                        methods.showMessage('No se pudo aplicar el producto gratuito', true);
                    }
                } catch (error) {
                    console.error('Error en applyFreeProduct:', error);
                    methods.showMessage('Ocurrió un error al aplicar el producto gratuito', true);
                }
            },
            async removeFreeProduct(productId){
                try {
                    const response = await fetch(`http://localhost:3000/api/cart/remove-free-product/${productId}`, {
                        method: 'DELETE',
                        
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || 'Error al remover el producto gratuito');
                    methods.viewItemsCart();
                    methods.showMessage('Producto gratuito removido correctamente', true);
                } catch (error) {
                    methods.showMessage(`Error: ${error.message}`, true);
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
                document.addEventListener('DOMContentLoaded', () => {
                    methods.updateCartCoupon(null);
                    methods.checkStripeSession();
                    methods.viewItemsCart();
                });
                methods.addNavbar();
                methods.addFooter();
                btnBuy.addEventListener('click', (e) => {
                    const isEmpty = document.querySelector('.cart-empty');
                    if(isEmpty){
                        methods.showMessage('Agrega productos al carrito', true);
                        return;
                    }
                    e.preventDefault();
                    methods.getUserAddress();
                });
                confirmBtn.addEventListener('click', async (e) => {
                    htmlElements.confirmAddressDialog.close();
                    methods.updateCartCoupon(null);
                    methods.createCheckoutSession();
                });
                noBtn.addEventListener('click', (e) => {
                    confirmAddressDialog.close();
                });
            }
        }
    })();
    App.init();
})();