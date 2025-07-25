import {navbarA, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),

            container: document.querySelector('#infoPedido'),
            botones: document.querySelectorAll('.filter-buttons button'),
            dialog: document.querySelector('#editStatus'),
            form: document.querySelector('#editStatusForm'),
            btnCancel: document.querySelector('#cancelEdit'),
        }

        const methods = {
            editOrder(){
                const orderId = htmlElements.form.getAttribute('data-order-id');
                const status = htmlElements.form.querySelector('#status').value;
                console.log('Estado seleccionado:', status);
                fetch(`http://localhost:3000/api/orders/${orderId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status }),
                    credentials: 'include'
                })
                .then(response => {
                    if (!response.ok) throw new Error("Error al editar el pedido");
                    return response.json();
                })
                .then(data => {
                    console.log('Pedido editado:', data);
                    methods.hideModal(htmlElements.dialog);
                    window.location.reload();
                })
                .catch(error => console.error('Error al editar pedido:', error));
            },

            async addFilter(status){
                 try {
                    const response = await fetch(`http://localhost:3000/api/orders/status/${status}`, {
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error("No se pudieron obtener los pedidos");

                    const data = await response.json();
                    const orders = data.orders;

                    const container = htmlElements.container;
                    container.innerHTML = "";

                    if (!orders || orders.length === 0) {
                        container.innerHTML = `<p>No hay pedidos con estado "${status}".</p>`;
                        return;
                    }

                    let tableHtml = `
                        <table class="tabla-pedidos">
                            <thead>
                                <tr>
                                    <th>Nombre del Usuario</th>
                                    <th>ID del Pedido</th>
                                    <th>Monto del Pedido</th>
                                    <th>Status del Pedido</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;

                    orders.forEach(order => {
                        tableHtml += `
                            <tr>
                                <td>${order.userId?.name || 'Sin nombre'}</td>
                                <td>${order._id}</td>
                                <td>${order.totalAmount}</td>
                                <td>${order.status}</td>
                                <td>${order.orderedAt}</td>
                            </tr>
                        `;
                    });

                    tableHtml += `
                            </tbody>
                        </table>
                    `;

                    container.innerHTML = tableHtml;

                    container.querySelectorAll('tbody tr').forEach(row => {
                        row.addEventListener('click', () => {
                            const orderId = row.getAttribute('data-order-id');
                            methods.showModal(htmlElements.dialog);
                            htmlElements.form.setAttribute('data-order-id', orderId);
                        });
                    });

                } catch (error) {
                    console.error(`Error al obtener pedidos con estado "${status}":`, error);
                }
            },

            addNavbar(){
                const container = htmlElements.navbar;
                const generar = navbarA();

                methods.printHtml(container, generar);
            },

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

            showModal(modal) {
                modal.showModal();
            },

            hideModal(modal){
                modal.close();
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
                const {botones, form, btnCancel} = htmlElements;
                document.addEventListener('DOMContentLoaded', () => {
                    methods.verifyAdmin();
                });
                methods.addNavbar();
                methods.addFooter();
                methods.addFilter('PENDIENTE');

                form.addEventListener('submit', (e) =>{
                    e.preventDefault();
                    methods.editOrder();
                });

                btnCancel.addEventListener('click', (e) =>{
                    e.preventDefault();
                    methods.hideModal(htmlElements.dialog);
                });

                botones.forEach((boton) =>{
                    boton.addEventListener('click', (e) =>{
                        e.preventDefault();
                        const id = boton.id;
                        console.log(id);
                        if (id){
                            methods.addFilter(id);
                        }
                    })
                });
            }
        }
    })();
    App.init();
})();