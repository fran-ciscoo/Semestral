import {navbarN, navbarS, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),
            tbodyHistorial: document.querySelector('#tbodyHistorial'),
            lastPurchase: document.querySelector('#lastPurchase'),
            totalPoints: document.querySelector('#puntos-cantidad')
        }

        const methods = {
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
            async viewHistoryPoints() {
                try {
                    const response = await fetch('http://localhost:3000/api/points/history', {
                        method: 'GET',
                        credentials: 'include', // para enviar cookies como el token
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.status === 401) {
                        const message = encodeURIComponent('Se ha cerrado la session, inicia nuevamente sesión');
                        window.location.href = `../view/logIn.html?message=${message}`;
                        return;
                    }
                    const data = await response.json();
                    if (!response.ok) {
                        console.error('Error al obtener historial:', data.error || 'Error desconocido');
                        return [];
                    }
                    const history = data.history;
                    const ultimosDiez = history.slice(0, 10);
                    const points = data.points;
                    const tbody = htmlElements.tbodyHistorial;
                    tbody.innerHTML = '';

                    if (history.length === 0) {
                        const filaVacia = document.createElement('tr');
                        filaVacia.innerHTML = `<td colspan="3">No tienes historial de puntos.</td>`;
                        tbody.appendChild(filaVacia);
                        return;
                    }
                    if (points.lastEarnedDate && !isNaN(new Date(points.lastEarnedDate))) {
                        const dateObj = new Date(points.lastEarnedDate);
                        const formattedDate = dateObj.toLocaleDateString('es-PA');
                        htmlElements.lastPurchase.innerHTML = `Ultima compra: ${formattedDate}`;
                    } else {
                        htmlElements.lastPurchase.innerHTML = 'Has una compra para ganar puntos!!!';
                    }
                    htmlElements.totalPoints.innerHTML = points.totalPoints;

                    ultimosDiez.forEach(entry => {
                        const fecha = new Date(entry.date).toLocaleDateString('es-PA');
                        const puntos = entry.actionPoints;
                        const esGanado = puntos.toString().startsWith('+');

                        const fila = document.createElement('tr');
                        fila.innerHTML = `
                            <td>${fecha}</td>
                            <td>${entry.description}</td>
                            <td>
                                <span class="badge-estado ${esGanado ? 'badge-ganado' : 'badge-canjeado'}">${puntos}</span>
                            </td>
                        `;
                        tbody.appendChild(fila);
                    });

                    return data.history;

                } catch (error) {
                    console.error('Error de red al obtener historial:', error);
                    return [];
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
                methods.viewHistoryPoints();
                methods.addNavbar();
                methods.addFooter();
            }
        }
    })();
    App.init();
})();