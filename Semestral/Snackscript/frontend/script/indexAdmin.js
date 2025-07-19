import {navbarA, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),

            botonAñadir: document.querySelector('#addProductBtn'),
            containerProduct: document.querySelector('#snackList'),

            editProduct: document.querySelector('#editProductDialog'),
            formE: document.querySelector('#editProductForm'),
            editInputName: document.querySelector('#editProductName'),
            editInputPrice: document.querySelector('#editProductPrice'),
            editInputCategory: document.querySelector('#editProductCategory'),
            editInputOrigin: document.querySelector('#editProductOrigin'),
            editInputStock: document.querySelector('#editProductStock'),
            editInputDescription: document.querySelector('#editProductDescription'),
            editInputStory: document.querySelector('#editProductStory'),
            botonEditCancel: document.querySelector('#cancelEditProduct'),

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
            editProduct() {
                const id = htmlElements.formE.getAttribute('data-id');
                
                const name = htmlElements.editInputName.value.trim();
                const price = parseFloat(htmlElements.editInputPrice.value);
                const category = htmlElements.editInputCategory.value.trim();
                const origin = htmlElements.editInputOrigin.value.trim();
                const stock = parseInt(htmlElements.editInputStock.value, 10);
                const description = htmlElements.editInputDescription.value.trim();
                const story = htmlElements.editInputStory.value.trim();

                const valid = methods.validateProduct(name, price, category, origin, stock, description, story);
                
                if (!valid) return;

                const product = {
                    name,
                    price,
                    category,
                    origin,
                    stock,
                    description,
                    story
                };

                fetch(`http://localhost:3000/api/productos/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(product)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Producto actualizado:', data);
                    htmlElements.formE.reset();
                    methods.hideModal(htmlElements.editProduct);
                    window.location.href = '../view/indexAdmin.html';
                })

            },

            viewDetails(productId) {
                fetch(`http://localhost:3000/api/productos/${productId}`)
                .then(response => response.json())
                .then(data => {
                    const product = data.producto;
                    if (product) {
                        htmlElements.editInputName.value = product.name;
                        htmlElements.editInputPrice.value = product.price;
                        htmlElements.editInputCategory.value = product.category;
                        htmlElements.editInputOrigin.value = product.origin;
                        htmlElements.editInputStock.value = product.stock;
                        htmlElements.editInputDescription.value = product.description;
                        htmlElements.editInputStory.value = product.story;

                        htmlElements.formE.setAttribute('data-id', product._id);

                        methods.showModal(htmlElements.editProduct);
                    } else {
                        console.error('Producto no encontrado');
                    }
                }).catch(error => console.error('Error al obtener producto:', error));
            },

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

                        const editButtons = document.querySelectorAll('.edit-btn');
                        editButtons.forEach(button => {
                            button.addEventListener('click', (e) => {
                                console.log('Edit button clicked');
                                const productId = e.target.dataset.id;
                                methods.viewDetails(productId);
                                
                            });
                        });
                    }).catch(error => console.error('Error al obtener productos:', error));
            },

            saveProduct(){
                const name = htmlElements.inputName.value.trim();
                const price = parseFloat(htmlElements.inputPrice.value);
                const category = htmlElements.inputCategory.value.trim();
                const origin = htmlElements.inputOrigin.value.trim();
                const stock = parseInt(htmlElements.inputStock.value, 10);
                const description = htmlElements.inputDescription.value.trim();
                const story = htmlElements.inputStory.value.trim();
                const valid = methods.validateProduct(name, price, category, origin, stock, description, story);
                
                if (!valid) return;

                const product = {
                    name,
                    price,
                    category,
                    origin,
                    stock,
                    description,
                    story
                };

                console.log('Producto a guardar:', product);

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

            validateProduct(name, price, category, origin, stock, description, story){

                if (!name || !price || !category || !origin || !stock || !description || !story) {
                    console.log('Validating product:', { name, price, category, origin, stock, description, story });
                    alert('All fields are required.');
                    console.error('no tan llegando')
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

            async verifyAdmin(){
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

            showModal(modal) {
                if (modal && typeof modal.showModal === 'function') {
                    modal.showModal();
                } else {
                    console.error("El modal no es un <dialog> o no existe.");
                }
            },

            hideModal(modal){
                modal.close();
            },

            printHtml(element, text) {
                element.innerHTML += `${text}`;
            }
            }

        return{
            init(){
                const {form, botonCancelar, botonAñadir, formE, botonEditCancel} = htmlElements;
                document.addEventListener('DOMContentLoaded', () => {
                    methods.verifyAdmin();
                });
                methods.addNavbar();
                methods.addFooter();
                methods.viewProducts();

                botonAñadir.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Botón Añadir clickeado');
                    methods.showModal(htmlElements.addProduct);
                    const overlay = document.getElementById('addProductOverlay');
                    if (overlay) overlay.style.display = 'block';
                });

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    methods.saveProduct();
                });

                botonCancelar.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.hideModal(htmlElements.addProduct);
                    htmlElements.form.reset();
                    const overlay = document.getElementById('addProductOverlay');
                    if (overlay) overlay.style.display = 'none';
                });

                formE.addEventListener('submit', (e) => {
                    e.preventDefault();
                    methods.editProduct();
                });

                botonEditCancel.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.hideModal(htmlElements.editProduct);
                    htmlElements.formE.reset();
                });

                // Event listener for overlay
                const overlay = document.getElementById('addProductOverlay');
                if (overlay) {
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            methods.hideModal(htmlElements.addProduct);
                            overlay.style.display = 'none';
                        }
                    });
                }
            }
        }
    })();
    App.init();
})();