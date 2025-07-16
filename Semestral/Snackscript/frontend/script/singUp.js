(()=>{
    const App = (()=>{
        const htmlElements = {
            form: document.querySelector('#signUpForm'),
            inputName: document.querySelector('#name'),
            inputUsername: document.querySelector('#username'),
            inputEmail: document.querySelector('#email'),
            inputPassword: document.querySelector('#password'),
            inputConfirmPassword: document.querySelector('#confirmPassword'),
        }

        const methods = {
            saveUser() {
                const name = htmlElements.inputName.value.trim();
                const username = htmlElements.inputUsername.value.trim();
                const email = htmlElements.inputEmail.value.trim();
                const password = htmlElements.inputPassword.value;
                const confirmPassword = htmlElements.inputConfirmPassword.value;
                methods.validateForm(name, username, email, password, confirmPassword);
                const hashedPassword = methods.hash(password);

                const user = {
                    name,
                    username,
                    email,
                    password: hashedPassword,
                };

                fetch('http://localhost:3000/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(user)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Producto creado:', data);
                    htmlElements.form.reset();
                    window.location.href = '../view/login.html';
                })
                .catch(error => console.error('Error al crear producto:', error));

            },

            validateForm(name, username, email, password, confirmPassword) {

                if (!name || !username || !email || !password || !confirmPassword) {
                    alert('All fields are required.');
                    return false;
                }

                if (password !== confirmPassword) {
                    alert('Passwords do not match.');
                    return false;
                }

                if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    alert('Invalid email format.'); 
                    return false;
                }


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