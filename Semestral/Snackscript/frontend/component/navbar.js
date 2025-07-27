export function navbarS(){
    const navbar = `
                    <header class="navbar-container">
                        <div id="logo-navbar">
                            <img src="/img/logoSnack.png" alt="Logo de Snack Script">
                        </div>
                        <nav class="navbar" role="navigation">
                            <a href="/view/index.html">Inicio</a>
                            <a href="/view/snackPedia.html">Snack Pedia</a>
                            <a href="/view/puntos.html">Puntos</a>
                            <a href="/view/pedidos.html">Pedidos</a>
                            <a href="/view/carrito.html">Carrito</a>
                            <a href="/view/perfil.html">Perfil</a>
                        </nav>
                    </header>`
    return navbar;
};

export function navbarN(){
    const navbar = `
                    <header class="navbar-container">
                        <div id="logo-navbar">
                            <img src="/img/logoSnack.png" alt="Logo de Snack Script">
                        </div>
                        <nav class="navbar" role="navigation">
                            <a href="/view/index.html">Inicio</a>
                            
                            <a href="/view/pedidos.html">Pedidos</a>
                            <a href="/view/carrito.html">Carrito</a>
                            <a href="/view/perfil.html">Perfil</a>
                        </nav>
                    </header>`
    return navbar;
};

export function navbarA(){
    const navbar = `
                    <header class="navbar-container">
                        <div id="logo-navbar">
                            <img src="/img/logoSnack.png" alt="Logo de Snack Script">
                        </div>
                        <nav class="navbar" role="navigation">
                            <a href="/view/indexAdmin.html">Inicio</a>
                            <a href="/view/adminUsers.html">Usuarios</a>
                            <a href="/view/adminCoupon.html">Cupones</a>
                            <a href="/view/adminPedidos.html">Pedidos</a>
                            <a href="/view/adminPerfil.html">Perfil</a>
                        </nav>
                    </header>`
    return navbar;
};

export function footer(){
    const footer = `
                    <footer class="footer">
                        <div class="footer-content">
                            <div class="footer-section">
                                <div class="footer-logo">
                                    <img src="/img/logoSnack.png" alt="Snack Script Logo" class="footer-logo-img">
                                    <h3>Snack Script</h3>
                                </div>
                                <p class="footer-description">Tu plataforma favorita para descubrir y disfrutar de los mejores snacks. Conectamos a los amantes de los snacks con experiencias únicas.</p>
                                <div class="footer-social">
                                    <a href="https://instagram.com/snackscript" target="_blank" class="social-link">
                                        <span class="social-icon">📷</span> Instagram
                                    </a>
                                    <a href="https://facebook.com/snackscript" target="_blank" class="social-link">
                                        <span class="social-icon">📘</span> Facebook
                                    </a>
                                    <a href="https://twitter.com/snackscript" target="_blank" class="social-link">
                                        <span class="social-icon">🐦</span> Twitter
                                    </a>
                                </div>
                            </div>

                            <div class="footer-section">
                                <h4>Enlaces Rápidos</h4>
                                <ul class="footer-links">
                                    <li><a href="/view/index.html">Inicio</a></li>
                                    
                                    <li><a href="/view/puntos.html">Sistema de Puntos</a></li>
                                    <li><a href="/view/pedidos.html">Mis Pedidos</a></li>
                                    <li><a href="/view/carrito.html">Carrito</a></li>
                                    <li><a href="/view/perfil.html">Mi Perfil</a></li>
                                </ul>
                            </div>

                            <div class="footer-section">
                                <h4>Información</h4>
                                <ul class="footer-links">
                                    <li><a href="#">Términos y Condiciones</a></li>
                                    <li><a href="#">Política de Privacidad</a></li>
                                    <li><a href="#">Política de Cookies</a></li>
                                    <li><a href="#">FAQ</a></li>
                                    <li><a href="#">Soporte Técnico</a></li>
                                    <li><a href="#">Reportar un Problema</a></li>
                                </ul>
                            </div>

                            <div class="footer-section">
                                <h4>Equipo de Desarrollo</h4>
                                <div class="team-member">
                                    <div class="member-info">
                                        <strong>Maxwell Baxter</strong>
                                        <span class="member-role">Frontend & QA</span>
                                        <a href="mailto:maxwell.baxter@utp.ac.pa" class="member-email">maxwell.baxter@utp.ac.pa</a>
                                    </div>
                                </div>
                                <div class="team-member">
                                    <div class="member-info">
                                        <strong>Amir González</strong>
                                        <span class="member-role">Backend & Database</span>
                                        <a href="mailto:amir.gonzalez@utp.ac.pa" class="member-email">amir.gonzalez@utp.ac.pa</a>
                                    </div>
                                </div>
                                <div class="team-member">
                                    <div class="member-info">
                                        <strong>Gabriel Pitti</strong>
                                        <span class="member-role">Líder & Backend</span>
                                        <a href="mailto:gabriel.pitti@utp.ac.pa" class="member-email">gabriel.pitti@utp.ac.pa</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="footer-bottom">
                            <div class="footer-bottom-content">
                                <p>&copy; 2025 Snack Script. Todos los derechos reservados.</p>
                                <p>Desarrollado con ❤️ por estudiantes de la UTP</p>
                            </div>
                        </div>
                    </footer>`
    return footer;
};