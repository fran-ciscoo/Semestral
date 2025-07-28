import {navbarA, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),
            perfil: document.querySelector('#perfil'),
            nombre: document.querySelector('#nombre'),
            email: document.querySelector('#email'),
            buttons: document.querySelector("#buttons"),
        }

        const methods = {
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
                htmlElements.perfil.querySelector('button')?.remove();
                window.location.href = '../view/index.html';
                alert('Sesión cerrada correctamente.');
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
            async verifyAdmin() {
                try {
                    const response = await fetch('http://localhost:3000/api/login/me', {
                        credentials: 'include'
                    });

                    if (!response.ok) throw new Error("Usuario no autenticado");

                    const data = await response.json();

                    if (data.user?.role !== 'admin') {
                        window.location.href = '../view/index.html';
                        return;
                    } else {
                        document.getElementById('loader').style.display = 'none';
                        document.getElementById('contenido').style.display = 'block';
                    }

                } catch (error) {
                    console.error("Error al verificar el rol:", error);
                    window.location.href = '../view/index.html';
                }
            },
            addNavbar(){
                const container = htmlElements.navbar;
                const generar = navbarA();

                methods.printHtml(container, generar);
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
                    const cerrarBtn = htmlElements.buttons.querySelector('#cerrarSesion');
                    if (cerrarBtn) {
                        cerrarBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            methods.logout();
                        });
                    }
                }
            }
            }

        return{
            init(){
                document.addEventListener('DOMContentLoaded', () => {
                    methods.verifyAdmin();
                });
                methods.addNavbar();
                methods.addFooter();
                methods.addInfo();
                methods.addBottom();
            }
        }
    })();
    App.init();
})();