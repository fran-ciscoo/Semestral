import {navbarN, navbarS, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),

            botones: document.querySelectorAll('.filters-section button'),
            containerCart: document.querySelector('#orders-grid'),

            cantidadTotal: document.querySelector('#cantidadtotal'),
            cantidadEntregados: document.querySelector('#cantidadentregados'),
            cantidadCancelados: document.querySelector('#cantidadcancelados'),
            messageCart: document.querySelector('#messageCart')
        }

        const methods = {
            async viewOrders(statuses = ['ENTREGADO', 'CANCELADO']) {
                try {
                    const response = await fetch('http://localhost:3000/api/order', {
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error('Error al obtener los pedidos');

                    const data = await response.json();
                    const orders = data.orders || [];


                    const filteredOrders = orders.filter(order => statuses.includes(order.status));
                    filteredOrders.sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));
                    htmlElements.cantidadTotal.textContent = filteredOrders.length;
                    htmlElements.cantidadEntregados.textContent = filteredOrders.filter(order => order.status === 'ENTREGADO').length;
                    htmlElements.cantidadCancelados.textContent = filteredOrders.filter(order => order.status === 'CANCELADO').length;

                    const container = htmlElements.containerCart;
                    container.innerHTML = "";

                   
                    if (filteredOrders.length === 0) {
                        container.innerHTML = `<p>No tienes pedidos con esos estados.</p>`;
                        return;
                    }

                    filteredOrders.forEach(order => {
                        const dateObj = new Date(order.orderedAt);
                        const formattedDate = dateObj.toLocaleDateString('es-PA');
                        const formattedTime = dateObj.toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit' });

                        let itemsHtml = "";
                        (order.items || []).forEach(item => {
                            itemsHtml += `
                                <div class="item">
                                    <span class="item-name">${item.product.name|| ''}</span>
                                    <span class="item-quantity">x${item.quantity || 0}</span>
                                    <span class="item-price">$${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                                </div>
                            `;
                        });

                        const card = document.createElement('div');
                        card.className = "order-card";
                        card.innerHTML = `
                            <div class="order-header">
                                <div class="order-number">
                                    <span class="idOrder">#${order._id.slice(-5)}</span>
                                    <span class="status-badge ${order.status === 'ENTREGADO' ? 'delivered' : order.status === 'CANCELADO' ? 'cancelled' : ''}">
                                        ${order.status}
                                    </span>
                                </div>
                                <div class="order-date">
                                    <span class="date">${formattedDate}</span>
                                    <span class="time">${formattedTime}</span>
                                </div>
                            </div>
                            
                            <div class="order-content">
                                <div class="order-items">
                                    ${itemsHtml}
                                </div>
                                
                                <div class="order-summary">
                                    <div class="summary-row">
                                        <span class="subtotal">Subtotal:</span>
                                        <span class="subtotal-value">$${order.subtotal?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div class="summary-row">
                                        <span class="shipping">Envío:</span>
                                        <span class="shipping-value">$${order.shipping?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div class="summary-row total">
                                        <span class="total">Total:</span>
                                        <span class="total-value">$${order.totalAmount?.toFixed(2) || '0.00'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="order-footer">
                                <div class="order-progress">
                                    <div class="progress-steps">
                                        <div class="botones">
                                            <button id="btnPedir" data-id="${order._id}">Repetir Pedido</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;

                        container.appendChild(card);
                        const btnRepetir = card.querySelector('#btnPedir');
                        if (btnRepetir) {
                            btnRepetir.addEventListener('click', async () => {
                                const orderId = btnRepetir.dataset.id;
                                console.log(`Repetir pedido con ID: ${orderId}`);
                                methods.repeatOrder(orderId);
                            });
                        }
                    });

                } catch (error) {
                    console.error('Error en viewOrders:', error);
                }
            },
            async repeatOrder(orderId) {
                try {
                    const response = await fetch(`http://localhost:3000/api/order/repeat/${orderId}`, {
                        method: 'POST',
                        credentials: 'include'
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.message || 'No se pudo repetir el pedido');
                    }
                    methods.showMessage('Pedido repetido. Los productos se agregaron al carrito.', false);
                } catch (error) {
                    console.error('Error al repetir pedido:', error);
                    methods.showMessage('Ocurrió un error al repetir el pedido', true);
                }
            },
            async verfySession(){
                try{
                    const response = await fetch ('http://localhost:3000/api/login/me',{
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
                    
                }catch (error) {
                    console.error('Error al verificar la sesión:', error);
                    return 'none';
                }
            },
            showMessage(mensaje, color) {
                htmlElements.messageCart.textContent = mensaje;
                if (color) {
                    htmlElements.messageCart.style.backgroundColor = '#f94144';
                } else {
                    htmlElements.messageCart.style.backgroundColor = '#43aa8b';
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
            }
            }

        return{
            init(){
                const {botones} = htmlElements;
                methods.addNavbar();
                methods.addFooter();
                methods.viewOrders();

                botones.forEach((boton) =>{
                    boton.addEventListener('click', (e) =>{
                        e.preventDefault();
                        const id = boton.id
                        if (id == "Todos"){
                            methods.viewOrders();
                        }else{
                            methods.viewOrders(id);
                        }
                    })
                });
            }
        }
    })();

    document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

    App.init();
})();