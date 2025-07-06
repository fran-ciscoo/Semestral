export function generate(){
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

export function footer(){
    const footer = `
                    <footer class="footer">
                        <div class="footer-content">
                            <div class="footer-section">
                                <h4>Snack Script</h4>
                                <p>&copy; 2025 Snack Script. Todos los derechos reservados.</p>
                            </div>

                            <div class="footer-section">
                                <h4>Redes sociales</h4>
                                <p>Instagram: <a href="https://instagram.com/snackscript" target="_blank">@snackscript</a></p>
                            </div>

                            <div class="footer-section">
                                <h4>Contáctanos</h4>
                                <p><strong>Maxwell Baxter</strong> - Desarrollador Frontend y QA<br>
                                maxwell.baxter@utp.ac.pa</p>

                                <p><strong>Amir González</strong> - Desarrollador y Gestor de Base de Datos<br>
                                amir.gonzalez@utp.ac.pa</p>

                                <p><strong>Gabriel Pitti</strong> - Líder y Desarrollador Backend<br>
                                gabriel.pitti@utp.ac.pa</p>
                            </div>
                        </div>
                    </footer>`
    return footer;
};