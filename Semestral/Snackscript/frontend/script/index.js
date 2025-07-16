import {navbarN, generate, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer')
        }

        const methods = {
            verfySession(){
                
            
            },

            addFooter(){
                const container = htmlElements.footer;
                const generar = footer();
                methods.printHtml(container, generar);
            },

            addNavbar(){
                const container = htmlElements.navbar;
                const generar = navbarN();
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
            }
        }
    })();
    App.init();
})();