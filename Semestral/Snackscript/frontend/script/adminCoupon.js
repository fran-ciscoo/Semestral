import {navbarA, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),

            container: document.querySelector('#coupon'),
            dialog: document.querySelector('#coupon-dialog'),
            form: document.querySelector('#coupon-form'),
            btnCancel: document.querySelector('#close-coupon-dialog'),
            btnAddCoupon: document.querySelector('#btnAddCoupon'),
            couponType: document.querySelector('#coupon-type'),
            discount: document.querySelector('#discount-section'),
            product: document.querySelector('#product-section'), 
            selector: document.querySelector('#coupon-type'),
            buscador: document.querySelector('#coupon-product'),
            productos: document.querySelector('#producto'),

            dialogActions: document.querySelector('#actions-Cupon'),
            dialogEdit: document.querySelector('#editDialog'),
            btnEdit: document.querySelector('#btnEditCupon'),
            btnDelete: document.querySelector('#btnDeleteCupon'),
            btnCancelEdit: document.querySelector('#cancelEditUser'),
            btnCancelActions: document.querySelector('#btnCancelActions'),
            formEdit: document.querySelector('#editCupon'),
            

        }

        const methods = {
            deleteCoupon(id) {
                fetch(`http://localhost:3000/api/coupon/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                })
                .then(response => {
                    if (!response.ok) throw new Error("Error al eliminar el cupón");
                    return response.json();
                })
                .then(data => {
                    console.log('Cupón eliminado:', data);
                })
                .catch(error => console.error('Error al eliminar el cupón:', error));
            },

            async editCoupon(id) {
                try {
                    const response = await fetch(`http://localhost:3000/api/coupon/${id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            isActive: htmlElements.formEdit.elements['active'].value
                        })
                    });
                    if (!response.ok) throw new Error("Error al editar el cupón");
                    const data = await response.json();
                    console.log('Cupón editado:', data);
                    methods.hideModal(htmlElements.dialogEdit);
                    htmlElements.formEdit.reset();
                    window.location.href = '../view/adminCoupon.html';
                } catch (error) {
                    console.error("Error al editar el cupón:", error);
                }
            },

            getCoupons(){
                fetch('http://localhost:3000/api/coupon', {
                    method: 'GET',
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    data.forEach(coupon => {
                        const row = document.createElement('tr');
                        row.classList.add('fila');
                        row.dataset._id = coupon._id;

                        row.innerHTML = `
                            <td>${coupon.name}</td>
                            <td>${coupon.valuePoints}</td>
                            <td>${coupon.type}</td>
                        `;

                        row.addEventListener('click', (e) => {
                            methods.showModal(htmlElements.dialogActions);
                            htmlElements.btnDelete.onclick = () => {
                                methods.deleteCoupon(coupon._id);
                                methods.hideModal(htmlElements.dialogActions);
                                window.location.reload();
                            };

                            htmlElements.btnEdit.onclick = () => {
                                methods.hideModal(htmlElements.dialogActions);
                                methods.showModal(htmlElements.dialogEdit);
                            };

                            htmlElements.formEdit.onsubmit = (e) => {
                                e.preventDefault();
                                methods.editCoupon(coupon._id);
                            };
                        });

                        htmlElements.container.appendChild(row);
                    });
                })
                .catch(error => console.error('Error al obtener cupones:', error));
            },

            viewProducts() {
                fetch('http://localhost:3000/api/productos')
                    .then(response => response.json())
                    .then(data => {
                        const container = htmlElements.productos;
                        container.innerHTML = '';
                        container.innerHTML = '<option value="" disabled selected>Seleccione un producto</option>';

                        data.productos.forEach(product => {
                            const option = document.createElement('option');
                            option.value = product._id; 
                            option.textContent = product.name;
                            container.appendChild(option);
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

            viewSection(sectionId) {
                const sections = document.querySelectorAll('.section');
                [...sections[0].children].forEach(sec => {
                    sec.style.display = 'none';
                });

                const currentSection = document.getElementById(sectionId);
                if (currentSection) {
                    currentSection.style.display = 'block';
                }

            },

            async addCoupon() {
                try {
                    const type = htmlElements.couponType.value;
                    const name = htmlElements.form.elements['name'].value;
                    const points = htmlElements.form.elements['points'].value;

                    let body = {
                        name: name,
                        valuePoints: points,
                        type: type
                    };

                    if (type === 'DESCUENTO') {
                        body.discountAmount = htmlElements.form.elements['discount'].value;
                    } else if (type === 'PRODUCTO') {
                        const select = htmlElements.form.elements['product'];
                        const productId = select.value;
                        if (!productId) throw new Error("Producto no válido");
                        body.applicableTo = [productId];
                    }

                    const response = await fetch('http://localhost:3000/api/coupon', {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body)
                    });

                    if (!response.ok) throw new Error("Error al crear el cupón");
                    const data = await response.json();
                    console.log('Cupón creado:', data);
                    htmlElements.form.reset();
                    window.location.href = '../view/adminCoupon.html';

                } catch (error) {
                    console.error("Error al agregar el cupón:", error);
                }
            },
            
            
            async verifyAdmin() {
                try {
                    const response = await fetch('http://localhost:3000/api/login/me', {
                        method: 'GET',
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

            showModal(modal) {
                modal.showModal();
            },

            hideModal(modal){
                modal.close();
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
                const {btnAddCoupon, btnCancel, form, selector, btnCancelActions, btnCancelEdit} = htmlElements;
                document.addEventListener('DOMContentLoaded', () => {
                    methods.verifyAdmin();
                });
                methods.addNavbar();
                methods.addFooter();
                methods.getCoupons();
                methods.viewProducts();

                btnAddCoupon.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.showModal(htmlElements.dialog);
                });

                btnCancel.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.hideModal(htmlElements.dialog);
                });

                selector.addEventListener('change', (e) => {
                    console.log(e.target.value);
                    methods.viewSection(e.target.value);
                });

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    methods.addCoupon();
                });

                btnCancelActions.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.hideModal(htmlElements.dialogActions);
                });

                btnCancelEdit.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.hideModal(htmlElements.dialogEdit);
                }); 
            }
        }
    })();
    App.init();
})();