import {generate, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),

            perfil: document.querySelector('#perfil'),
            nombre: document.querySelector('#nombre'),
            email: document.querySelector('#email'),
            cerrarSesion: document.querySelector('#cerrarSesion'),
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

            addFooter(){
                const container = htmlElements.footer;
                const generar = footer();
                methods.printHtml(container, generar);
            },

            addNavbar(){
                const container = htmlElements.navbar;
                const generar = generate();
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
                methods.addInfo();

                htmlElements.cerrarSesion.addEventListener('click', methods.logout);
            }
        }
    })();
    App.init();
})();