import {navbarA, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer')
        }

        const methods = {
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
            }
            }

        return{
            init(){
                document.addEventListener('DOMContentLoaded', () => {
                    methods.verifyAdmin();
                });
                methods.addNavbar();
                methods.addFooter();
            }
        }
    })();
    App.init();
})();