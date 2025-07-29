import { navbarN, navbarS, footer } from "../component/navbar.js"
(() => {

    const App = (() => {
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),
        }

        const methods = {
            async verifyUser(){
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
            async verifySession() {
                try {
                    console.log("Verificando sesión...");
                    const response = await fetch('http://localhost:3000/api/login/me', {
                        method: 'GET',
                        credentials: 'include'
                    }); 

                    if (!response.ok) {
                        console.error("Usuario no autenticado");
                        throw new Error("Usuario no autenticado");
                    }
                    const data = await response.json();

                    if (data.user.role !== 'subscriber') {
                        console.log("Si cumple la condición");
                        window.location.href = '../view/index.html';
                        return;
                    } else {
                        console.log("Es suscriber");
                    }

                } catch (error) {
                    console.log("ERROR");
                    console.error("Error al verificar el rol:", error);
                    window.location.href = '../view/index.html';
                    
                }
            },

            async addNavbar(){
                const container = htmlElements.navbar;
                const role = await methods.verifyUser();
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
            },
        }

        return {
            init() {
                document.addEventListener('DOMContentLoaded', async () => {
                    await methods.verifySession();
                });
                
                methods.addNavbar();
                methods.addFooter();
            }
        }

    })();
    App.init();
})();