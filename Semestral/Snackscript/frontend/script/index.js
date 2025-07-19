import {navbarN, navbarS, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),

            containerProduct: document.querySelector('#snackList'),
        }

        const methods = {
            viewProducts() {
                fetch('http://localhost:3000/api/productos')
                    .then(response => response.json())
                    .then(data => {
                        const container = htmlElements.containerProduct;
                        container.innerHTML = '';

                        data.productos.forEach(product => {
                            const productCard = `
                                <div class="product-card">
                                    <div class="product-info">
                                        <img src="${product.image}" alt="${product.name} imagen" class="product-image">
                                        <h2 class="product-title">${product.name}</h2>
                                        <p class="product-description">${product.description}</p>
                                        <p class="product-price">$${product.price}</p>
                                        <div class="product-actions">
                                            <button class="edit-btn" data-id="${product._id}">Editar</button>
                                        </div>
                                    </div>
                                </div>`;
                            container.innerHTML += productCard;
                        });
                    }).catch(error => console.error('Error al obtener productos:', error));
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
                methods.viewProducts();
            }
        }
    })();
    App.init();
})();