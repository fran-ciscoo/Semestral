(()=>{
    const App = (()=>{
        const htmlElements = {
            form: document.querySelector('#loginForm'),
            inputUsername: document.querySelector('#username'),
            inputPassword: document.querySelector('#password'),
        }

        let sessionToken = null;

        const methods = {
            async validateUser() {
                const username = htmlElements.inputUsername.value.trim();
                const password = htmlElements.inputPassword.value;
                const hashedPassword = methods.hash(password);

                if (!username || !password) {
                    alert('Both fields are required.');
                    return false;
                }

                try {
                    const response = await fetch('http://localhost:3000/api/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username, password: hashedPassword }),
                        credentials: 'include'
                    });
                    const data = await response.json();
                    sessionToken = data.token;
                    if (!response.ok) {
                        methods.showErrorMessage('Usuario o contraseñas inválidas');
                        return;
                    }
                    if (data.user.role === 'admin') {
                        window.location.href = '../view/indexAdmin.html';
                    } else {
                        window.location.href = '../view/index.html';
                    }

                } catch (error) {
                    console.error('Error en el login:', error);
                }
            },

            hash(passWord){
                let hash = 0; 

                for(let i = 0; i < passWord.length; i++){
                    let chr = passWord.charCodeAt(i);
                    hash = (hash << 5) - hash + chr; 
                    hash |= 0; 
                }
                return hash;
            },
            showErrorMessage(message) {
                const errorDiv = document.getElementById('loginError');
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
            }   
            }

        return{
            init(){
                const { form } = htmlElements;

                form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    methods.validateUser();
                });

            }
        }
    })();
    App.init();
    window.AppLogin = App;
})();