import {navbarN, navbarS, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),

            botones: document.querySelectorAll('.filters-section button'),
            containerCart: document.querySelector('#orders-grid'),

            cantidadTotal: document.querySelector('#cantidadtotal'),
            cantidadPendientes: document.querySelector('#cantidadpendientes'),
            cantidadProceso: document.querySelector('#cantidadproceso'),
        }

        const methods = {
            async viewOrders(){
                    try {
                        const response = await fetch('http://localhost:3000/api/order', {
                            credentials: 'include',
                        });
                        if (!response.ok) {
                            throw new Error('Error al obtener los pedidos');
                        }

                        const data = await response.json();
                        const orders = data.orders || data;

                        const filteredOrders = orders.filter(order => 
                            order.status !== 'ENTREGADO' && order.status !== 'CANCELADO'
                        );

                        htmlElements.cantidadTotal.textContent = filteredOrders.length;
                        htmlElements.cantidadPendientes.textContent = filteredOrders.filter(order => order.status === 'PENDIENTE').length;
                        htmlElements.cantidadProceso.textContent = filteredOrders.filter(order => order.status === 'EN PREPARACION' || order.status === 'EN CAMINO').length;

                        const container = htmlElements.containerCart;
                        container.innerHTML = "";

                        if (!filteredOrders || filteredOrders.length === 0) {
                            container.innerHTML = `<p>No tienes pedidos realizados.</p>`;
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
                                        <span class="item-name">${item.name|| ''}</span>
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
                                        <span class="idOrder">#${order._id}</span>
                                        <span class="status">${order.status}</span>
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
                                            <div class="step ${order.status === 'PENDIENTE' ? 'active' : 'completed'}">
                                                <div class="step-icon">⏳</div>
                                                <span class="step-label">Pendiente</span>
                                            </div>
                                            <div class="step ${order.status === 'EN PREPARACIÓN' ? 'active' : order.status === 'EN CAMINO' || order.status === 'ENTREGADO' ? 'completed' : ''}">
                                                <div class="step-icon">🔄</div>
                                                <span class="step-label">En Preparación</span>
                                            </div>
                                            <div class="step ${order.status === 'EN CAMINO' ? 'active' : order.status === 'ENTREGADO' ? 'completed' : ''}">
                                                <div class="step-icon">🚚</div>
                                                <span class="step-label">En Camino</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;

                            container.appendChild(card);
                        });

                    } catch (error) {
                        console.error('Error en viewOrders:', error);
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
                methods.addNavbar();
                methods.addFooter();
                methods.viewOrders();
            }
        }
    })();
    App.init();
})();