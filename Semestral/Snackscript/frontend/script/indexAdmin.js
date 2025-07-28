import {navbarA, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),
            botonAñadir: document.querySelector('#addProductBtn'),
            containerProduct: document.querySelector('#snackList'),
            botones: document.querySelectorAll('.filters-container button'),

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
            
            dropZone: document.querySelectorAll('.drop-zone'),
            nameError: document.querySelector("#nameError"),
            originError: document.querySelector("#originError"),
            imageError: document.querySelector("#imageError")
        }

        const methods = {
            async editProduct() {
                try {
                    const form = htmlElements.formE;
                    const id = form.getAttribute('data-id');
                    const formData = new FormData(form);

                    const name = formData.get('productName')?.trim();
                    const origin = formData.get('productOrigin')?.trim();
                    const image = formData.get('productImage');
                    console.log(image);
                    const edit = true;
                    const valid = methods.validateProduct(name, origin, image, edit);
                    if (!valid) return;

                    const response = await fetch(`http://localhost:3000/api/productos/${id}`, {
                        method: 'PUT',
                        body: formData
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        console.error('Error del servidor:');
                        if (data.status === 'error') {
                            console.error(data.message);
                        }
                        return;
                    }

                    console.log('Producto actualizado:', data.message);
                    form.reset();
                    methods.hideModal(htmlElements.editProduct);
                    window.location.href = '../view/indexAdmin.html';

                } catch (error) {
                    console.error('Error al editar el producto:', error);
                    alert('Ocurrió un error al actualizar el producto. Intenta de nuevo.');
                }
            },

            async viewDetails(productId) {
                try {
                    const response = await fetch(`http://localhost:3000/api/productos/${productId}`);
                    const data = await response.json();
                    const product = data.producto;
                    htmlElements.formE.setAttribute('data-id', product._id);

                    if (product) {
                        htmlElements.editInputName.value = product.name;
                        htmlElements.editInputPrice.value = product.price;
                        htmlElements.editInputCategory.value = product.category;
                        htmlElements.editInputOrigin.value = product.origin;
                        htmlElements.editInputStock.value = product.stock;
                        htmlElements.editInputDescription.value = product.description;
                        htmlElements.editInputStory.value = product.story;
                        htmlElements.formE.setAttribute('data-id', product._id);
                        methods.loadImagePreview(product.image);
                        methods.showModal(htmlElements.editProduct);
                    } else {
                        console.error('Producto no encontrado');
                    }
                } catch (error) {
                    console.error('Error al obtener producto:', error);
                }
            },
            loadImagePreview(urlImagen) {
                const dropZone = htmlElements.editProduct.querySelector('.drop-zone');
                let preview = dropZone.querySelector('.drop-zone__thumb');
                if (!preview) {
                    preview = document.createElement('div');
                    preview.classList.add('drop-zone__thumb');
                    dropZone.appendChild(preview);
                }
                preview.style.backgroundImage = `url('${urlImagen}')`;
                dropZone.classList.add('has-thumb');
            },

            viewOnlyCategory(category){
                fetch(`http://localhost:3000/api/productos/category?category=${category}`)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        const container = htmlElements.containerProduct;
                        container.innerHTML = '';

                        if (!Array.isArray(data.productos)) {
                            console.error('La propiedad "productos" no está definida o no es un array:', data);
                            return;
                        }

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
                    const edit = false;
                    const valid = methods.validateProduct(name, origin, image, edit);
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

            validateProduct(name, origin, image, edit) {
                htmlElements.nameError.innerHTML = "";
                htmlElements.imageError.innerHTML = "";
                htmlElements.originError.innerHTML = "";

                const nameRegex = /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/;
                if (!nameRegex.test(name)) {
                    htmlElements.nameError.innerHTML = "El nombre no debe contener caracteres especiales.";
                    return false;
                }
                if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/.test(origin)) {
                    htmlElements.originError.innerHTML = "El origen solo debe contener letras";
                    return false;
                }
                if ((edit === false && image.size===0)) {
                    htmlElements.imageError.innerHTML = "Debe seleccionar una imagen válida.";
                    console.log("Entrooooooooooo");
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
                const dropZones = htmlElements.dropZone;
                dropZones.forEach(dropZone => {
                    const input = dropZone.querySelector('.drop-zone__input');

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
                            updateThumbnail(input.files[0], dropZone);
                        }
                    });

                    input.addEventListener('change', () => {
                        if (input.files.length) {
                            updateThumbnail(input.files[0], dropZone);
                        }
                    });

                    function updateThumbnail(file, zone) {
                        if (!file.type.startsWith('image/')) return;

                        const reader = new FileReader();
                        reader.readAsDataURL(file);

                        reader.onload = () => {
                            let preview = zone.querySelector('.drop-zone__thumb');
                            if (!preview) {
                                preview = document.createElement('div');
                                preview.classList.add('drop-zone__thumb');
                                zone.appendChild(preview);
                            }
                            preview.style.backgroundImage = `url('${reader.result}')`;
                            zone.classList.add('has-thumb');
                        };
                    }
                });
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
                htmlElements.nameError.innerHTML = "";
                htmlElements.imageError.innerHTML = "";
                htmlElements.originError.innerHTML = "";
                const dropZone = modal.querySelector('.drop-zone');
                if (!dropZone) {
                    console.error('No se encontró dropZone en el modal.');
                    return;
                }
                const preview = dropZone.querySelector('.drop-zone__thumb');
                const inputFile = dropZone.querySelector('.drop-zone__input');

                if (modal.id === 'addProductDialog') {
                    if (preview) {
                        preview.remove();
                    }
                    dropZone.classList.remove('has-thumb');
                    if (inputFile) {
                        inputFile.value = '';
                    }
                    if (htmlElements.form) {
                        htmlElements.form.reset();
                    }

                }
                modal.showModal();
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
                const {form, botonCancelar, botonAñadir, formE, botonEditCancel, botones} = htmlElements;
                document.addEventListener('DOMContentLoaded', () => {
                    methods.verifyAdmin();
                });
                methods.addNavbar();
                methods.addFooter();
                methods.viewProducts();
                methods.dropZoneF();

                botones.forEach((boton) =>{
                    boton.addEventListener('click', (e) =>{
                        e.preventDefault();
                        const id = boton.id.split("btn")[1];
                        if (id == "Todo"){
                            methods.viewProducts();
                        }else{
                            methods.viewOnlyCategory(id);
                        }
                    })
                });

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
                    htmlElements.form.reset();
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