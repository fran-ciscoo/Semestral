import {navbarN, navbarS, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),

            botonAñadir: document.querySelector('#addProductBtn'),
            containerProduct: document.querySelector('#containerProduct'),

            addProduct: document.querySelector('#addProductDialog'),
            form: document.querySelector('#addProductForm'),
            inputName: document.querySelector('#productName'),
            inputPrice: document.querySelector('#productPrice'),
            inputCategory: document.querySelector('#productCategory'),
            inputOrigin: document.querySelector('#productOrigin'),
            inputStock: document.querySelector('#productStock'),
            inputDescription: document.querySelector('#productDescription'),
            inputStory: document.querySelector('#productStory'),
            botonCancelar: document.querySelector('#cancelAddProduct'),
        }

        const methods = {
            viewProducts() {
                fetch('http://localhost:3000/api/productos')
                    .then(response => response.json())
                    .then(data => {
                        const container = htmlElements.containerProduct;
                        container.innerHTML = '';
                        data.forEach(product => {
                            const productCard = `
                                <div class="product-details">
                                    <h2>${product.name}</h2>
                                    <p>${product.description}</p>
                                    <p>$${product.price}</p>
                                    <button  class="edit-btn" data-id="${product._id}">Editar</button>
                                    <button  class="delete-btn" data-id="${product._id}">Eliminar</button>
                                </div>`;
                            container.innerHTML += productCard;
                        });
                    })
                    .catch(error => console.error('Error al obtener productos:', error));
            },

            saveProduct(){
                const name = htmlElements.inputName.value.trim();
                const price = parseFloat(htmlElements.inputPrice.value);
                const category = htmlElements.inputCategory.value.trim();
                const origin = htmlElements.inputOrigin.value.trim();
                const stock = parseInt(htmlElements.inputStock.value, 10);
                const description = htmlElements.inputDescription.value.trim();
                const story = htmlElements.inputStory.value.trim();
                methods.validateProduct(name, price, category, origin, stock, description, story);

                const product = {
                    name,
                    price,
                    category,
                    origin,
                    stock,
                    description,
                    story
                };

                fetch('http://localhost:3000/api/productos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(product)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Producto creado:', data);
                    htmlElements.form.reset();
                    methods.hideModal(htmlElements.addProduct);
                    window.location.href = '../view/indexAdmin.html';
                })
            },

            validateProduct(name, price, category, origin, stock, description, story) {

                if (!name || !price || !category || !origin || !stock || !description || !story) {
                    alert('All fields are required.');
                    return false;
                }

                if (isNaN(price) || price <= 0) {
                    alert('Invalid price.');
                    return false;
                }

                if (isNaN(stock) || stock < 0) {
                    alert('Invalid stock.');
                    return false;
                }

                return true;
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

            showModal(modal){
                    modal.classList.remove("hidden");
            },

            hideModal(modal){
                    modal.classList.add("hidden");
            },

            printHtml(element, text) {
                element.innerHTML += `${text}`;
            }
            }

        return{
            init(){
                const {form, botonCancelar, botonAñadir} = htmlElements;
                methods.addNavbar();
                methods.addFooter();

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    methods.saveProduct();
                });

                botonAñadir.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.showModal(htmlElements.addProduct);
                });

                botonCancelar.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.hideModal(htmlElements.addProduct);
                    htmlElements.form.reset();
                });

            }
        }
    })();
    App.init();
})();