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
            inputImage: document.querySelector('#productImage'),
            inputDescription: document.querySelector('#productDescription'),
            inputStory: document.querySelector('#productStory'),
            botonCancelar: document.querySelector('#cancelAddProduct'),
            
            dropZone: document.querySelector('#dropZone'),
            nameError: document.querySelector("#nameError"),
            originError: document.querySelector("#originError"),
            imageError: document.querySelector("#imageError")
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

            async saveProduct(){
                try {
                    const form = htmlElements.form;
                    const formData = new FormData(form);

                    const name = formData.get('productName')?.trim();
                    const origin = formData.get('productOrigin')?.trim();
                    const image = formData.get('productImage');

                    const valid = methods.validateProduct(name, origin, image);
                    if (!valid) return;
                    const response = await fetch('http://localhost:3000/api/productos', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();
                    if (!response.ok) {
                        console.error('Error del servidor:', data);
                        if (data.status === 'error') {
                            htmlElements.nameError.textContent = data.message;
                        } 
                        return;
                    }
                    methods.hideModal(htmlElements.addProduct);
                    window.location.href = '../view/indexAdmin.html';

                } catch (err) {
                    console.error('Error al guardar producto:', err);
                    alert('Ocurrió un error al guardar el producto. Intenta de nuevo.');
                }
            },

            validateProduct(name, origin, image) {
                htmlElements.nameError.innerHTML = "";
                htmlElements.imageError.innerHTML = "";
                htmlElements.originError.innerHTML = "";
                console.log(image);

                const nameRegex = /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/;
                if (!nameRegex.test(name)) {
                    htmlElements.nameError.innerHTML = "El nombre no debe contener caracteres especiales.";
                    return false;
                }
                if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/.test(origin)) {
                    htmlElements.originError.innerHTML = "El origen solo debe contener letras";
                    return false;
                }
                if (!image || image.size === 0 || !image.name || image.type === "application/octet-stream") {
                    htmlElements.imageError.innerHTML = "Debe seleccionar una imagen válida.";
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

            dropZoneF(){
                const dropZone = htmlElements.dropZone;
                if (dropZone) {
                    const input = dropZone.querySelector('.drop-zone__input');
                    let preview = dropZone.querySelector('.drop-zone__thumb');

                    dropZone.addEventListener('click', () => input.click());

                    dropZone.addEventListener('dragover', e => {
                        e.preventDefault();
                        dropZone.classList.add('drop-zone--over');
                    });

                    dropZone.addEventListener('dragleave', () => {
                        dropZone.classList.remove('drop-zone--over');
                    });

                    dropZone.addEventListener('drop', e => {
                        e.preventDefault();
                        dropZone.classList.remove('drop-zone--over');

                        if (e.dataTransfer.files.length) {
                            input.files = e.dataTransfer.files;
                            updateThumbnail(input.files[0]);
                        }
                    });

                    input.addEventListener('change', () => {
                        if (input.files.length) {
                            updateThumbnail(input.files[0]);
                        }
                    });

                    function updateThumbnail(file) {
                        if (!file.type.startsWith('image/')) return;

                        const reader = new FileReader();
                        reader.readAsDataURL(file);

                        reader.onload = () => {
                            if (!preview) {
                                preview = document.createElement('div');
                                preview.classList.add('drop-zone__thumb');
                                dropZone.appendChild(preview);
                            }
                            preview.style.backgroundImage = `url('${reader.result}')`;
                            dropZone.classList.add('has-thumb');
                        };
                    }
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
                htmlElements.form.reset();
                htmlElements.nameError.innerHTML = "";
                htmlElements.imageError.innerHTML = "";
                htmlElements.originError.innerHTML = "";
                const dropZone = htmlElements.dropZone;
                const preview = dropZone.querySelector('.drop-zone__thumb');
                console.log(preview);
                if (preview) {
                    preview.remove();
                }
                dropZone.classList.remove('has-thumb');
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
                methods.dropZoneF();

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