(()=>{
    const App = (()=>{
        const htmlElements = {
            form: document.querySelector('#loginForm'),
            inputUsername: document.querySelector('#username'),
            inputPassword: document.querySelector('#password'),
        }

        let sessionToken = null;

        const methods = {
            validateUser(){
                const username = htmlElements.inputUsername.value.trim();
                const password = htmlElements.inputPassword.value;
                const hashedPassword = methods.hash(password);
                console.log(hashedPassword);

                if (!username || !password) {
                    alert('Both fields are required.');
                    return false;
                }

                fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({username, password: hashedPassword})
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Login failed: ');
                    }
                    return response.json();
                })
                .then(data => {
                    sessionToken = data.token;
                    console.log('User found:', data);
                    console.log('Token de sesión:', sessionToken);
                    window.location.href = '../view/index.html';
                })

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