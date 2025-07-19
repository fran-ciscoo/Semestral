import {navbarN, navbarS, footer} from "../component/navbar.js"
(()=>{

    const App = (()=>{
        const htmlElements = {
            navbar: document.querySelector('#navbar'),
            footer: document.querySelector('#footer'),
            searchInput: document.querySelector('#searchInput'),
            searchButton: document.querySelector('#searchButton'),
            mapButtons: document.querySelectorAll('.map-btn'),
            countryItems: document.querySelectorAll('.country-item'),
            snackList: document.querySelector('#snackList'),
            snacks: document.querySelectorAll('.snack')
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
            },

            // Funcionalidad del mapa interactivo
            initMapControls() {
                // Botones de región
                htmlElements.mapButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        methods.handleRegionFilter(e.target);
                    });
                });

                // Países individuales
                htmlElements.countryItems.forEach(item => {
                    item.addEventListener('click', (e) => {
                        methods.handleCountryFilter(e.currentTarget);
                    });
                });
            },

            handleRegionFilter(button) {
                // Remover clase active de todos los botones
                htmlElements.mapButtons.forEach(btn => btn.classList.remove('active'));
                
                // Agregar clase active al botón clickeado
                button.classList.add('active');

                const region = button.id.replace('btn', '').toLowerCase();
                methods.filterSnacksByRegion(region);
            },

            handleCountryFilter(countryItem) {
                // Remover selección de todos los países
                htmlElements.countryItems.forEach(item => item.classList.remove('selected'));
                
                // Agregar selección al país clickeado
                countryItem.classList.add('selected');

                const country = countryItem.dataset.country;
                methods.filterSnacksByCountry(country);
            },

            filterSnacksByRegion(region) {
                htmlElements.snacks.forEach(snack => {
                    const snackCountry = snack.dataset.country;
                    const snackRegion = methods.getRegionByCountry(snackCountry);
                    
                    if (region === 'todo' || snackRegion === region) {
                        snack.classList.remove('hidden');
                    } else {
                        snack.classList.add('hidden');
                    }
                });

                // Actualizar contador de snacks visibles
                methods.updateSnackCount();
            },

            filterSnacksByCountry(country) {
                htmlElements.snacks.forEach(snack => {
                    const snackCountry = snack.dataset.country;
                    
                    if (snackCountry === country) {
                        snack.classList.remove('hidden');
                    } else {
                        snack.classList.add('hidden');
                    }
                });

                // Actualizar contador de snacks visibles
                methods.updateSnackCount();
            },

            getRegionByCountry(country) {
                const regionMap = {
                    'japon': 'asia',
                    'corea': 'asia',
                    'china': 'asia',
                    'tailandia': 'asia',
                    'mexico': 'america',
                    'brasil': 'america',
                    'peru': 'america',
                    'colombia': 'america',
                    'italia': 'europa',
                    'francia': 'europa',
                    'alemania': 'europa',
                    'espana': 'europa',
                    'marruecos': 'africa',
                    'egipto': 'africa',
                    'australia': 'oceania',
                    'nueva-zelanda': 'oceania',
                    'estados-unidos': 'america'
                };
                return regionMap[country] || 'other';
            },

            updateSnackCount() {
                const visibleSnacks = document.querySelectorAll('.snack:not(.hidden)');
                console.log(`Snacks visibles: ${visibleSnacks.length}`);
            },

            // Funcionalidad de búsqueda mejorada
            initSearch() {
                htmlElements.searchButton.addEventListener('click', () => {
                    methods.performSearch();
                });

                htmlElements.searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        methods.performSearch();
                    }
                });
            },

            performSearch() {
                const searchTerm = htmlElements.searchInput.value.toLowerCase().trim();
                
                if (searchTerm === '') {
                    // Si no hay término de búsqueda, mostrar todos los snacks
                    htmlElements.snacks.forEach(snack => {
                        snack.classList.remove('hidden');
                    });
                    return;
                }

                htmlElements.snacks.forEach(snack => {
                    const country = snack.dataset.country;
                    const category = snack.dataset.category;
                    const countryName = methods.getCountryName(country);
                    
                    // Buscar por país, categoría o nombre del archivo
                    const fileName = snack.src.split('/').pop().toLowerCase();
                    
                    if (countryName.toLowerCase().includes(searchTerm) ||
                        category.toLowerCase().includes(searchTerm) ||
                        fileName.includes(searchTerm)) {
                        snack.classList.remove('hidden');
                    } else {
                        snack.classList.add('hidden');
                    }
                });

                methods.updateSnackCount();
            },

            getCountryName(countryCode) {
                const countryNames = {
                    'japon': 'Japón',
                    'corea': 'Corea',
                    'china': 'China',
                    'tailandia': 'Tailandia',
                    'mexico': 'México',
                    'brasil': 'Brasil',
                    'peru': 'Perú',
                    'colombia': 'Colombia',
                    'italia': 'Italia',
                    'francia': 'Francia',
                    'alemania': 'Alemania',
                    'espana': 'España',
                    'marruecos': 'Marruecos',
                    'egipto': 'Egipto',
                    'australia': 'Australia',
                    'nueva-zelanda': 'Nueva Zelanda',
                    'estados-unidos': 'Estados Unidos'
                };
                return countryNames[countryCode] || countryCode;
            }
        }

        return{
            init(){
                methods.addNavbar();
                methods.addFooter();
                methods.initMapControls();
                methods.initSearch();
            }
        }
    })();
    App.init();
})();