(()=>{
    const App = (()=>{
        const htmlElements = {
            form: document.querySelector('#signUpForm'),
            inputName: document.querySelector('#name'),
            inputUsername: document.querySelector('#username'),
            inputEmail: document.querySelector('#email'),
            inputPassword: document.querySelector('#password'),
            inputConfirmPassword: document.querySelector('#confirmPassword'),
            usernameError: document.querySelector("#usernameError"),
            emailError: document.querySelector("#emailError"),
            passwordError: document.querySelector("#passwordError"),
            nameError: document.querySelector("#nameError"),
        }

        const methods = {
            async saveUser() {
                const name = htmlElements.inputName.value.trim();
                const username = htmlElements.inputUsername.value.trim();
                const email = htmlElements.inputEmail.value.trim();
                const password = htmlElements.inputPassword.value;
                const confirmPassword = htmlElements.inputConfirmPassword.value;

                if (!methods.validateForm(name, username, email, password, confirmPassword)) {
                    return; 
                }

                const hashedPassword = methods.hash(password);

                const user = {
                    name,
                    username,
                    email,
                    password: hashedPassword,
                };

                try {
                    const response = await fetch('http://localhost:3000/api/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(user)
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        console.error('Error del servidor:', data);
                        if (data.field === 'username') {
                            htmlElements.usernameError.textContent = data.error;
                        } else if (data.field === 'email') {
                            htmlElements.emailError.textContent = data.error;
                        }
                        return;
                    }
                    htmlElements.form.reset();
                    window.location.href = '../view/login.html';
                } catch (error) {
                    console.error('Error de red o inesperado:', error);
                }
            },

            validateForm(name, username, email, password, confirmPassword) {
                if (name && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+( [A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/.test(name)) {
                    htmlElements.nameError.innerHTML = "El nombre solo puede contener letras y espacios entre palabras";
                    return false;
                }
                if (username && !/^[a-zA-Z0-9._]+$/.test(username)) {
                    htmlElements.usernameError.innerHTML = "El nombre de usuario solo puede contener letras, números, puntos y guiones bajos";
                    return false;
                }
                if (password !== confirmPassword) {
                    htmlElements.passwordError.innerHTML = "Las contraseñas no coinciden";
                    return false;
                }
                if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    htmlElements.emailError.innerHTML = "Ingrese un correo valido";
                    return false;
                }
                htmlElements.passwordError.innerHTML = "";
                htmlElements.usernameError.innerHTML = "";
                htmlElements.emailError.innerHTML = "";

                return true;
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
        }

        return{
            init(){
                const{form} = htmlElements;
                
                form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    methods.saveUser();
                });

            }
        }
    })();
    App.init();
})();