import {navbarA, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),

            containerUsers: document.querySelector('#Usuarios'),
            btnTodos: document.querySelector('#btnFilterAll'),
            btnAdmins: document.querySelector('#btnFilterAdmin'),
            btnUsers: document.querySelector('#btnFilterUser'),
            btnSub: document.querySelector('#btnFilterSubscriber'),

            dialogActions: document.querySelector('#actions-User'),
            btnEditUser: document.querySelector('#btnEditUser'),
            btnDeleteUser: document.querySelector('#btnDeleteUser'),
            btnCancelActions: document.querySelector('#btnCancelActions'),

            dialogEditUser: document.querySelector('#editUserDialog'),
            formEditUser: document.querySelector('#editUserForm'),
            inputRole: document.querySelector('#editUserRole'),
            btnCancelEdit: document.querySelector('#cancelEditUser'),
        }

        const methods = {
            deleteUser(id){
                fetch(`http://localhost:3000/api/users/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                })
                .then(response => {
                    if (!response.ok) throw new Error("Error al eliminar el usuario");
                    return response.json();
                })
                .then(data => {
                    console.log('Usuario eliminado:', data);
                    methods.hideModal(htmlElements.dialogActions);
                    methods.viewUsers();
                })
                .catch(error => console.error('Error al eliminar usuario:', error));
            },

            editRoleUser(id){
                const role = htmlElements.inputRole.value;
                console.log('Rol seleccionado:', role);
                fetch(`http://localhost:3000/api/users/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ role }),
                    credentials: 'include'
                })
                .then(response => {
                    if (!response.ok) throw new Error("Error al editar el usuario");
                    return response.json();
                })
                .then(data => {
                    console.log('Usuario editado:', data);
                    methods.hideModal(htmlElements.dialogEditUser);
                    methods.viewUsers();
                })
                .catch(error => console.error('Error al editar usuario:', error));
            }, 

            viewOnlyAdmins(role){
                fetch(`http://localhost:3000/api/users/role?role=${role}`, {
                    method: 'GET',
                    credentials: 'include'
                })
                .then(response => {
                    if (!response.ok) throw new Error("Error al obtener usuarios");
                    return response.json();
                })
                .then(users => {
                    htmlElements.containerUsers.innerHTML = '';
                    users.forEach(user => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                        `;
                        row.addEventListener('click', (e) => {
                            methods.showModal(htmlElements.dialogActions);
                            htmlElements.btnDeleteUser.onclick = () => {
                                methods.deleteUser(user._id);
                                methods.hideModal(htmlElements.dialogActions);
                                window.location.reload();
                            };

                            htmlElements.btnEditUser.onclick = () => {
                                methods.hideModal(htmlElements.dialogActions);
                                methods.showModal(htmlElements.dialogEditUser);
                            };

                            htmlElements.formEditUser.onsubmit = (e) => {
                                e.preventDefault();
                                methods.editRoleUser(user._id);
                            };
                        });

                        htmlElements.containerUsers.appendChild(row);
                    });
                })
                .catch(error => console.error('Error al obtener usuarios:', error));

            },

            viewUsers(){
                fetch('http://localhost:3000/api/users', {
                    method: 'GET',
                    credentials: 'include'
                })
                .then(response => {
                    if (!response.ok) throw new Error("Error al obtener usuarios");
                    return response.json();
                })
                .then(users => {
                    htmlElements.containerUsers.innerHTML = '';
                    users.forEach(user => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                        `;
                        row.addEventListener('click', (e) => {
                            methods.showModal(htmlElements.dialogActions);
                            htmlElements.btnDeleteUser.onclick = () => {
                                methods.deleteUser(user._id);
                                methods.hideModal(htmlElements.dialogActions);
                                window.location.reload();
                            };

                            htmlElements.btnEditUser.onclick = () => {
                                methods.hideModal(htmlElements.dialogActions);
                                methods.showModal(htmlElements.dialogEditUser);
                            };

                            htmlElements.formEditUser.onsubmit = (e) => {
                                e.preventDefault();
                                methods.editRoleUser(user._id);
                            };
                        });

                        htmlElements.containerUsers.appendChild(row);
                    });
                })
                .catch(error => console.error('Error al obtener usuarios:', error));

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
                const {btnTodos, btnAdmins, btnSub, btnUsers, btnCancelEdit, btnCancelActions, formEditUser} = htmlElements;
                document.addEventListener('DOMContentLoaded', () => {
                    methods.verifyAdmin();
                });
                methods.addNavbar();
                methods.addFooter();
                methods.viewUsers();

                btnTodos.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.viewUsers();
                });

                btnAdmins.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.viewOnlyAdmins('admin');
                });

                btnUsers.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.viewOnlyAdmins('user');
                });

                btnSub.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.viewOnlyAdmins('subscriber');
                });

                btnCancelEdit.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.hideModal(htmlElements.dialogEditUser);
                });

                btnCancelActions.addEventListener('click', (e) => {
                    e.preventDefault();
                    methods.hideModal(htmlElements.dialogActions);
                });
                
            }
        }
    })();
    App.init();
})();