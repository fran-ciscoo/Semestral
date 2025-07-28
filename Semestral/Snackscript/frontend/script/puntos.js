import {navbarN, navbarS, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),
            lastPurchase: document.querySelector('#lastPurchase'),
            totalPoints: document.querySelector('#puntos-cantidad'),
            confirmDialog: document.querySelector('#confirmDialog'),
            confirmYes: document.querySelector('#confirmYes'),
            confirmNo: document.querySelector('#confirmNo'),
            message: document.querySelector('#message')
        }

        const methods = {
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
                    if (!response.ok) {
                        console.error('Error:', data.error || 'Error desconocido');
                        return null;
                    }
                    console.log(points.lastEarnedDate);
                    if (points.lastEarnedDate && !isNaN(new Date(points.lastEarnedDate))) {
                        const dateObj = new Date(points.lastEarnedDate);
                        const formattedDate = dateObj.toLocaleDateString('es-PA');
                        htmlElements.lastPurchase.innerHTML = `Ultima compra: ${formattedDate}`;
                    } else {
                        htmlElements.lastPurchase.innerHTML = 'Has una compra para ganar puntos!!!';
                    }
                    htmlElements.totalPoints.innerHTML = points.totalPoints;
                    return points;

                } catch (error) {
                    console.error('Error al hacer la petición:', error);
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
            async getCoupons() {
                try {
                    const response = await fetch('http://localhost:3000/api/coupon/', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Error desconocido');
                    return data;
                } catch (error) {
                    console.error('Error al obtener cupones:', error);
                    return [];
                }
            },
            renderCoupons(coupons, couponsUser) {
                const contenedor = document.querySelector('.puntos-canje-lista');
                contenedor.innerHTML = '';

                if (coupons.length === 0) {
                    contenedor.innerHTML = '<p>No hay cupones disponibles.</p>';
                    return;
                }
                coupons.sort((a, b) => a.valuePoints - b.valuePoints);

                let selectedCouponId = null;
                const userCouponIds = new Set(couponsUser.map(c => c._id));

                coupons.forEach(cupon => {
                    const card = document.createElement('div');
                    card.classList.add('puntos-canje-card');
                    card.setAttribute('data-id', cupon._id);

                    const isOwned = userCouponIds.has(cupon._id);
                    if (isOwned) {
                        card.classList.add('disabled');
                    }

                    const nombre = document.createElement('div');
                    nombre.classList.add('canje-nombre');
                    nombre.textContent = cupon.name;

                    const puntos = document.createElement('div');
                    puntos.classList.add('canje-puntos');
                    puntos.textContent = `${cupon.valuePoints} puntos`;

                    card.appendChild(nombre);
                    card.appendChild(puntos);

                    card.addEventListener('click', () => {
                        if (!isOwned) {
                            selectedCouponId = cupon._id;
                            htmlElements.confirmDialog.showModal();
                        } else {
                            methods.showMessage('¡Ya tienes este cupón!', true);
                        }
                    });

                    contenedor.appendChild(card);
                });

                htmlElements.confirmYes.addEventListener('click', () => {
                    methods.redeemCoupon(selectedCouponId);
                });
            },
            async redeemCoupon(couponId) {
                try {
                    const response = await fetch('http://localhost:3000/api/coupon/buyCoupon', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({ couponId })
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        methods.showMessage(data.error, true);
                        return;
                    }
                    methods.showMessage('Enhorabuena!! Obtuviste un nuevo cupon', false);
                    methods.getAndRenderCoupons();
                    return data.couponsChanged;
                } catch (error) {
                    console.error('Error al enviar la solicitud:', error);
                    alert('Error de red o del servidor.');
                }
            },
            showMessage(mensaje, color) {
                htmlElements.message.textContent = mensaje;
                if (color) {
                    htmlElements.message.style.backgroundColor = '#f94144';
                } else {
                    htmlElements.message.style.backgroundColor = '#43aa8b';
                }
                htmlElements.message.classList.add('show');
                setTimeout(() => {
                    htmlElements.message.classList.remove('show');
                }, 3000);
            },
            async getAndRenderCoupons(){
                const coupons = await methods.getCoupons();
                const couponsUser = await methods.getCouponsUser();
                methods.renderCoupons(coupons, couponsUser);
                methods.viewPoints();
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
                const {confirmNo} = htmlElements;
                methods.getAndRenderCoupons();
                methods.addNavbar();
                methods.addFooter();
                confirmNo.addEventListener('click', () => {
                    htmlElements.confirmDialog.close();
                });
            }
        }
    })();
    App.init();
})();