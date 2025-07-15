import {generate, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer')
        }

        const methods = {
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
            }
        }
    })();
    App.init();
})();