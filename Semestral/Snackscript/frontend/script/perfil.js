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
            inputPostalCode: document.querySelector('#inputPostalCode')

        }

        const methods = {
            saveChanges(userUpdate) {
                fetch(`http://localhost:3000/api/users/${userUpdate._id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userUpdate),
                    credentials: 'include',
                })
                .then(response => {
                    if (!response.ok) throw new Error('Error al actualizar el perfil');
                    return response.json();
                })
                .then(data => {
                    alert('Perfil actualizado exitosamente');
                    methods.hideModal(htmlElements.dialogEditar);
                    methods.viewDetails();
                    window.location.href = '../view/perfil.html';
                })
                .catch(error => {
                    console.error('Error al actualizar el perfil:', error);
                    alert('Error al actualizar el perfil');
                });

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

                    htmlElements.formEditar.addEventListener('submit', async (e) => {
                        e.preventDefault();

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

                alert('Sesión cerrada correctamente.');
                window.location.href = '../view/index.html';
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
                        return;
                    }

                    if (!response.ok) throw new Error('Token inválido o sesión expirada');

                    const data = await response.json();
                    const user = data.user;

                    htmlElements.nombre.textContent = user.name || 'Sin nombre';
                    htmlElements.email.textContent = user.email || 'Sin correo';

                } catch (error) {
                    console.error('Error al obtener datos del usuario:', error);
                    htmlElements.nombre.textContent = 'Sin nombre';
                    htmlElements.email.textContent = 'Sin correo';
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
                    ? `<button><a id="cerrarSesion" href="../view/index.html">Cerrar Sesión</a></button>`
                    : `<button><a id="iniciarSesion" href="../view/logIn.html">Iniciar Sesión</a></button>`;

                const element = htmlElements.buttons;
                methods.printHtml(element, text);

                if (session !== 'none') {
                    const cerrarBtn = document.querySelector('#cerrarSesion');
                    if (cerrarBtn) {
                        cerrarBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            methods.logout();
                        });
                    }
                }
            },
            verifyAddress(){
                const params = new URLSearchParams(window.location.search);
                const msg = params.get('msg');
                if (msg === 'noAddress') {
                    methods.showModal(htmlElements.dialogEditar);
                    methods.viewDetails();
                }
            }
            }
        return{
            init(){
                const {btnCancelar, btnEditar} = htmlElements;
                methods.addNavbar();
                methods.addFooter();
                methods.addInfo();
                methods.addBottom();

                btnEditar.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.showModal(htmlElements.dialogEditar);
                    methods.viewDetails();
                });

                btnCancelar.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.hideModal(htmlElements.dialogEditar);
                });
                methods.verifyAddress();
            }
        }
    })();
    App.init();
})();