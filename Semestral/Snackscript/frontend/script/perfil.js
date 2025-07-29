import {navbarN, navbarS, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),
            perfil: document.querySelector('#perfil'),
            nombre: document.querySelector('#nombre'),
            email: document.querySelector('#email'),
            buttons: document.querySelector("#buttons"),
            btnEditar: document.querySelector('#btnEditar'),

            dialogEditar: document.querySelector('#dialogEditarPerfil'),
            formEditar: document.querySelector('#formEditarPerfil'),
            inputName: document.querySelector('#inputName'),
            inputUsername: document.querySelector('#inputUsername'),
            inputEmail: document.querySelector('#inputEmail'),
            inputCity: document.querySelector('#inputCity'),
            inputAddress: document.querySelector('#inputAddress'),
            inputPhone: document.querySelector('#inputPhone'),
            btnCancelar: document.querySelector('#cancelar'),
            inputPostalCode: document.querySelector('#inputPostalCode'),
            points: document.querySelector('#points'),
            points2: document.querySelector('#points2'),
            orderList: document.querySelector('#ordersList'),
            pedidosCount: document.querySelector('#pedidosCount'),
            couponsList: document.querySelector('#couponsList'),
            couponsNumber: document.querySelector('#couponsNumber'),
            beSub: document.querySelector('#beSub'),
            nameError: document.querySelector('#nameError'),
            emailError: document.querySelector('#emailError'),
            messageCart: document.querySelector('#messageCart'),
            addressesCard: document.querySelector('.addresses-card'),
            btnViewPoints: document.querySelector('#btnViewPoints')
        }

        const methods = {
            renderAddress(city, address) {
                const container = htmlElements.addressesCard; // .card-content.addresses-card

                // Elimina contenido previo de direcciones si existe
                let addressesList = container.querySelector('.addresses-list');
                if (addressesList) {
                    addressesList.remove();
                }
                // Elimina mensaje vacío previo si existe
                let emptyMsg = container.querySelector('.empty-message');
                if (emptyMsg) {
                    emptyMsg.remove();
                }

                if (city || address) {
                    addressesList = document.createElement('div');
                    addressesList.classList.add('addresses-list');

                    const item = document.createElement('div');
                    item.classList.add('address-item');

                    const citySpan = document.createElement('span');
                    citySpan.classList.add('address-city');
                    citySpan.textContent = city || '';

                    const addressSpan = document.createElement('span');
                    addressSpan.classList.add('address');
                    addressSpan.textContent = address || '';

                    item.appendChild(citySpan);
                    item.appendChild(addressSpan);
                    addressesList.appendChild(item);

                    container.appendChild(addressesList);
                } else {
                    const emptyMessage = document.createElement('p');
                    emptyMessage.classList.add('empty-message');
                    emptyMessage.textContent = 'No hay direcciones guardadas.';
                    container.appendChild(emptyMessage);
                }
            },
            async getCouponsUser() {
                try {
                    const response = await fetch('http://localhost:3000/api/users/coupons', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (response.status === 401) {
                        const containerCoupon = htmlElements.couponsList;
                        containerCoupon.innerHTML = '<div class="no-pedidos-msg"><p>No tienes cupones</p></div>';
                        htmlElements.points.innerHTML = '0';
                        return null;
                    }
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Error desconocido');
                    return data.couponsChanged;
                } catch (error) {
                    console.error('Error al obtener cupones:', error);
                    return [];
                }
            },
            renderCoupons(coupons) {
                if (coupons) {
                    const container = htmlElements.couponsList;
                    container.innerHTML = '';
                    htmlElements.couponsNumber.textContent = coupons.length;
                    const limitedCoupons = coupons.slice(0, 4);
                    if (limitedCoupons.length > 0) {
                        limitedCoupons.forEach(coupon => {
                            const item = document.createElement('div');
                            item.classList.add('coupon-item');

                            const name = document.createElement('span');
                            name.classList.add('coupon-name');
                            name.textContent = coupon.name;

                            const status = document.createElement('span');
                            status.classList.add('coupon-status', 'active');
                            status.textContent = 'Disponible';

                            item.appendChild(name);
                            item.appendChild(status);
                            container.appendChild(item);
                        });

                        const actionsDiv = document.createElement('div');
                        actionsDiv.classList.add('card-actions');

                        const historialLink = document.createElement('a');
                        historialLink.href = 'historialPuntos.html';
                        historialLink.classList.add('card-btn');
                        historialLink.textContent = 'Ver Historial';

                        actionsDiv.appendChild(historialLink);
                        container.appendChild(actionsDiv);
                    } else {

                        const emptyMessage = document.createElement('p');
                        emptyMessage.classList.add('empty-message');
                        emptyMessage.innerHTML = 'No hay cupones disponibles en este momento.';
                        container.appendChild(emptyMessage);
                    }   
                }
            },
            async createSubcriptor(nombre, price) {
                try {
                    const response = await fetch('http://localhost:3000/api/sub/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include', 
                        body: JSON.stringify({ nombre:"Subcriptor", price: 10.00 })
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        console.error('Error al crear subscriptor:', data.error || 'Error desconocido');
                        return null;
                    }
                    console.log('✅ Subscriptor creado:', data.subcriptor);
                    return data.subcriptor;
                } catch (error) {
                    console.error('Error de red al crear subscriptor:', error);
                    return null;
                }
            },
            async createSubscriptionSession(subcriptorId) {
                try {
                    const response = await fetch('http://localhost:3000/api/sub/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ subcriptorId: '68885b95330a2749e2010de7'})
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        console.error('Error al crear sesión de suscripción:', data.error || 'Error desconocido');
                        return null;
                    }
                    window.location.href = data.url;
                } catch (error) {
                    console.error('Error de red al crear sesión de suscripción:', error);
                }
            },
            async checkSubscriptionSession() {
                const urlParams = new URLSearchParams(window.location.search);
                const sessionId = urlParams.get('session_id');

                if (sessionId) {
                    try {
                        const response = await fetch('http://localhost:3000/api/sub/verificar', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({ session_id: sessionId }),
                        });

                        const data = await response.json();

                        if (response.ok) {
                            console.log('Suscripción verificada:', data);

                            if (data.status === 'active') {
                                window.location.href = '../view/perfil.html';
                                methods.showMessage('¡Suscripción activa! Ya puedes disfrutar de los beneficios.', false);
                            } else {
                                methods.showMessage('El pago no se completó. Intenta nuevamente.', true);
                            }
                        } else {
                            console.error('Error al verificar suscripción:', data.error);
                            methods.showMessage('Error verificando la suscripción.', true);
                        }
                    } catch (err) {
                        console.error('Error al verificar suscripción:', err);
                    }
                }
            },
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
                htmlElements.pedidosCount.textContent = orders.length;
                const recentOrders = [...orders]
                    .sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt))
                    .slice(0, 3);
                const container = htmlElements.orderList;
                container.innerHTML = "";

                if (!recentOrders || recentOrders.length === 0) {
                    container.innerHTML = `<p class= "no-pedidos-msg">No tienes pedidos realizados.</p>`;
                    return;
                }

                recentOrders.forEach(order => {
                    const dateObj = new Date(order.orderedAt);
                    const formattedDate = dateObj.toLocaleDateString('es-PA');
                    const statusClass =
                    order.status === 'ENTREGADO' ? 'entregado' :
                    order.status === 'CANCELADO' ? 'cancelado' :
                    order.status === 'PENDIENTE' ? 'pending' :
                    (order.status === 'EN PREPARACION' || order.status === 'EN CAMINO') ? 'processing' :
                    '';

                    const orderDiv = document.createElement('div');
                    orderDiv.className = "order-item";
                    orderDiv.innerHTML = `
                        <div class="order-info">
                            <span class="idOrder">#${order._id.slice(-5)}</span>
                            <span class="order-date">${formattedDate}</span>
                        </div>
                        <span class="status-badge ${statusClass}">
                            ${order.status}
                        </span>
                    `;
                    container.appendChild(orderDiv);
                });

                const actionsDiv = document.createElement('div');
                actionsDiv.className = "card-actions";
                actionsDiv.innerHTML = `
                    <a href="../view/pedidos.html" class="card-btn">Ver Historial</a>
                `;
                container.appendChild(actionsDiv);

                } catch (error) {
                console.error('Error al obtener pedidos recientes:', error);
                }

            },
            async saveChanges(userUpdate) {
                try {
                    const response = await fetch(`http://localhost:3000/api/users/${userUpdate._id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(userUpdate),
                        credentials: 'include',
                    });
                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error('Error al actualizar el perfil', data);
                    }

                    methods.hideModal(htmlElements.dialogEditar);
                    methods.viewDetails();
                    methods.showMessage('Perfil Actualizado', false);

                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } catch (error) {
                    console.error('Error al actualizar el perfil:', error);
                    alert('Error al actualizar el perfil');
                }
            },
            async viewDetails() {
                try {
                    const response = await fetch('http://localhost:3000/api/login/me', {
                    credentials: 'include',
                    });

                    if (response.status === 401) {
                        alert('Debes iniciar sesión para ver tus datos.');
                        return;
                    }

                    if (!response.ok) throw new Error('Token inválido o sesión expirada');

                    const data = await response.json();
                    console.log('Datos del usuario:', data);
                    const user = data.user;

                    if (!user) {
                        console.warn('Datos del usuario no disponibles');
                        return;
                    }

                    htmlElements.inputName.value = user.name || '';
                    htmlElements.inputUsername.value = user.username || '';
                    htmlElements.inputUsername.disabled = true;
                    htmlElements.inputEmail.value = user.email || '';
                    htmlElements.inputCity.value = user.shippingAddress?.city || '';
                    htmlElements.inputAddress.value = user.shippingAddress?.address || '';
                    htmlElements.inputPostalCode.value = user.shippingAddress?.postalCode || '';
                    htmlElements.inputPhone.value = user.phone || '';

                    methods.renderAddress(user.shippingAddress?.city, user.shippingAddress?.address);

                    htmlElements.formEditar.addEventListener('submit', async (e) => {
                        e.preventDefault();

                        const name = htmlElements.inputName.value.trim();
                        const email = htmlElements.inputEmail.value.trim();

                        if (!methods.validateForm(name, email)) {
                            return; 
                        }

                        const userUpdate = {
                            _id: user._id,
                            name: htmlElements.inputName.value.trim(),
                            email: htmlElements.inputEmail.value.trim(),
                            shippingAddress: {
                                country: 'Panamá',
                                city: htmlElements.inputCity.value.trim(),
                                address: htmlElements.inputAddress.value.trim(),
                                postalCode: htmlElements.inputPostalCode.value.trim()
                            },
                            phone: htmlElements.inputPhone.value.trim(),
                        }

                        console.log('Datos del usuario a actualizar:', userUpdate);
                        methods.saveChanges(userUpdate);
                        methods.hideModal(htmlElements.dialogEditar);
                    });


                } catch (error) {
                    console.error('Error al obtener datos del usuario:', error);
                }
            },

            validateForm(name, email) {
                htmlElements.nameError.innerHTML = "";
                htmlElements.emailError.innerHTML = "";
                if (name && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+( [A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/.test(name)) {
                    htmlElements.nameError.innerHTML = "El nombre solo puede contener letras y espacios entre palabras";
                    return false;
                }
                if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    htmlElements.emailError.innerHTML = "Ingrese un correo valido";
                    return false;
                }

                return true;
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
            async logout() {
                try {
                    await fetch('http://localhost:3000/api/login/logout', {
                        method: 'POST',
                        credentials: 'include',
                    });
                } catch (err) {
                    console.error('Error en logout:', err);
                }

                htmlElements.nombre.textContent = 'Sin nombre';
                htmlElements.email.textContent = 'Sin correo';
                const message = encodeURIComponent('La session fue cerrada');
                window.location.href = `../view/index.html?message=${message}`;
            },

            async addInfo() {
                try {
                    const response = await fetch('http://localhost:3000/api/login/me', {
                    credentials: 'include',
                    });

                    if (response.status === 401) {
                        console.warn('No hay sesión activa');
                        htmlElements.nombre.textContent = 'Sin nombre';
                        htmlElements.email.textContent = 'Sin correo';
                        methods.renderAddress('', '');
                        return;
                    }

                    if (!response.ok) throw new Error('Token inválido o sesión expirada');

                    const data = await response.json();
                    const user = data.user;

                    htmlElements.nombre.textContent = user.name || 'Sin nombre';
                    htmlElements.email.textContent = user.email || 'Sin correo';
                     methods.renderAddress(user.shippingAddress?.city, user.shippingAddress?.address);

                } catch (error) {
                    console.error('Error al obtener datos del usuario:', error);
                    htmlElements.nombre.textContent = 'Sin nombre';
                    htmlElements.email.textContent = 'Sin correo';
                    methods.renderAddress('', '');
                }
            },
            async viewPoints() {
                try {
                    const response = await fetch('http://localhost:3000/api/points/', {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    const data = await response.json();
                    const points = data.points;
                    if(response.status === 404){
                        const containerCoupon = htmlElements.couponsList;
                        containerCoupon.innerHTML = '<div><p>No tienes cupones</p></div>';
                        htmlElements.points.innerHTML = '0';
                        return null;
                    }


                    if (!response.ok) {
                        console.error('Error:', data.error || 'Error desconocido');
                        return null;
                    }
                    htmlElements.points.innerHTML = points.totalPoints;
                    return points;

                } catch (error) {
                    console.error('Error al hacer la petición:', error);
                    return null;
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

            showModal(modal) {
                modal.showModal();
            },

            hideModal(modal){
                modal.close();
            },

            addFooter(){
                const container = htmlElements.footer;
                const generar = footer();
                methods.printHtml(container, generar);
            },

            printHtml(element, text) {
                element.innerHTML += `${text}`;
            },
            async addBottom() {
                const session = await methods.verfySession();
                const text = session !== 'none'
                    ? `<button><a id="cerrarSesion" href="../view/index.html">Cerrar Sesión</a></button>
                        <button id="btnEditar" class="edit-profile-btn"><span class="btn-icon">✏️</span>Editar Perfil</button>`
                    : `<button><a id="iniciarSesion" href="../view/logIn.html">Iniciar Sesión</a></button>`;

                const element = htmlElements.buttons;
                methods.printHtml(element, text);

                if (session !== 'none') {
                    const cerrarBtn = document.querySelector('#cerrarSesion');
                    const editar = document.querySelector('#btnEditar');
                    if (editar) {
                        editar.addEventListener('click', (e) => {
                            e.preventDefault();
                            methods.showModal(htmlElements.dialogEditar);
                            methods.viewDetails();
                        });
                    }

                    if (cerrarBtn) {
                        cerrarBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            methods.logout();
                        });
                    }
                }
            },
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
            verifyAddress(){
                const params = new URLSearchParams(window.location.search);
                const msg = params.get('msg');
                if (msg) {
                    methods.showMessage(msg, true);
                    methods.showModal(htmlElements.dialogEditar);
                    methods.viewDetails();
                }
            }
            }
        return{
            async init(){
                const { btnCancelar, beSub, btnViewPoints } = htmlElements;
                document.addEventListener('DOMContentLoaded', async () => {
                    methods.checkSubscriptionSession();
                    const role = await methods.verfySession();
                    const cardCoupons = document.getElementById('profile-card coupons-card');
                    if(role === 'none'){
                        const cardPoint = document.getElementById('profile-card points-card');
                        cardPoint.remove();
                        cardCoupons.remove();
                    } else if(role === 'user'){
                        cardCoupons.remove();
                    }
                });
                methods.viewPoints();
                methods.addNavbar();
                methods.addFooter();
                methods.addInfo();
                methods.addBottom();
                methods.viewOrders();
                const coupons = await methods.getCouponsUser();
                methods.renderCoupons(coupons);

                btnCancelar.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.hideModal(htmlElements.dialogEditar);
                });
                beSub.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.createSubscriptionSession();
                });
                methods.verifyAddress();
                btnViewPoints.addEventListener('click', async (e)=>{
                    const role = await methods.verfySession();
                    if (role === 'user') {
                        methods.showMessage("Hazte subcritor para ganar puntos", true);
                    } else if (role === 'subscriber'){
                        window.location.href = '../view/puntos.html';
                    }
                });
            }
        }
    })();
    App.init();
})();