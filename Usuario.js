/* ================================================================
   USUARIO.JS - VERSIÓN MAESTRA FINAL: PERSISTENCIA Y LIMPIEZA
   ================================================================
*/

let toastTimer = null;
let pendingCredentialContext = null;
let acabamosDeRegistrar = false; // Controla que la limpieza no borre el registro nuevo

document.addEventListener('DOMContentLoaded', () => {
    bindTabs();
    bindPasswordToggle();

    // 1. LIMPIEZA INICIAL: Solo si no hay un flujo de registro activo
    if (!acabamosDeRegistrar) {
        limpiarTodo();
    }

    // 2. CONFIGURACIÓN DE FORMULARIOS
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    setupEnterNavigation('loginForm');
    setupEnterNavigation('registerForm');

    // 3. MODAL DE CREDENCIALES
    document.getElementById('confirmSaveCreds').addEventListener('click', () => finishCredentialPrompt(true));
    document.getElementById('cancelSaveCreds').addEventListener('click', () => finishCredentialPrompt(false));

    // 4. LIMPIEZA AL ENTRAR DESDE EL MENÚ (Barra superior)
    // Busca el enlace en la barra superior y asígnale esta función
    const linkPromos = document.querySelector('[data-open-user]');
    if (linkPromos) {
        linkPromos.addEventListener('click', () => {
            acabamosDeRegistrar = false; 
            limpiarTodo();
        });
    }
});

// --- FUNCIONES DE LIMPIEZA ---
function limpiarTodo() {
    // Si acabamos de registrar, NO limpiamos para que el usuario vea sus datos
    if (acabamosDeRegistrar) return;

    setTimeout(() => {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
        
        const ids = ['loginEmail', 'loginPassword', 'regName', 'regEmail', 'regPassword'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });

        limpiarErrores();
    }, 50);
}

function limpiarErrores() {
    document.querySelectorAll('.error-text').forEach(el => el.textContent = '');
    const loginMsg = document.getElementById('loginMessage');
    if (loginMsg) loginMsg.textContent = '';
    const loginPass = document.getElementById('loginPassword');
    if (loginPass) loginPass.style.borderColor = '';
}

// --- NAVEGACIÓN CON ENTER ---
function setupEnterNavigation(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"])'));
    const submitBtn = form.querySelector('button[type="submit"]');

    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const nextIndex = index + 1;
                if (nextIndex < inputs.length) {
                    inputs[nextIndex].focus();
                } else if (submitBtn) {
                    submitBtn.click();
                }
            }
        });
    });
}

// --- LÓGICA DE PESTAÑAS ---
function bindTabs() {
    const tabs = document.querySelectorAll('.usuario-tab');
    const loginPane = document.getElementById('loginPane');
    const registerPane = document.getElementById('registerPane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Solo limpiamos si no estamos en el proceso de mover datos de registro a login
            if (!acabamosDeRegistrar) {
                limpiarTodo();
            }

            if (target === 'login') {
                loginPane.classList.remove('hidden');
                registerPane.classList.add('hidden');
            } else {
                registerPane.classList.remove('hidden');
                loginPane.classList.add('hidden');
            }
        });
    });
}

// --- MANEJO DE REGISTRO ---
function handleRegister(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;

    if (!email || !pass) {
        alert("Por favor completa los datos");
        return;
    }

    pendingCredentialContext = { email: email, password: pass };
    document.getElementById('displayCreatedEmail').textContent = email;
    document.getElementById('saveCredsModal').classList.remove('hidden');
}

function finishCredentialPrompt(remember) {
    if (!pendingCredentialContext) return;

    const nuevoEmail = pendingCredentialContext.email;
    const nuevaPass = pendingCredentialContext.password;

    if (remember) {
        localStorage.setItem('userEmail', nuevoEmail);
        localStorage.setItem('userPass', nuevaPass);
    }

    // BLOQUEAMOS LA LIMPIEZA TEMPORALMENTE
    acabamosDeRegistrar = true;

    document.getElementById('saveCredsModal').classList.add('hidden');
    document.getElementById('registerForm').reset();
    
    const loginTab = document.querySelector('.usuario-tab[data-tab="login"]');
    if (loginTab) loginTab.click();

    // RELLENAMOS LOS DATOS NUEVOS
    setTimeout(() => {
        document.getElementById('loginEmail').value = nuevoEmail;
        document.getElementById('loginPassword').value = nuevaPass;
        // Una vez rellenado, permitimos que el sistema vuelva a limpiar en el futuro
        acabamosDeRegistrar = false; 
    }, 100);

    showToast(remember ? 'Datos guardados' : 'Cuenta creada');
    pendingCredentialContext = null;
}

// --- MANEJO DE LOGIN ---
function handleLogin(e) {
    if (e) e.preventDefault();
    limpiarErrores();
    
    const emailInput = document.getElementById('loginEmail').value.trim();
    const passInput = document.getElementById('loginPassword').value;

    // Recuperamos lo que haya en memoria
    const savedEmail = localStorage.getItem('userEmail');
    const savedPass = localStorage.getItem('userPass');

    // Validación: Usuario manual o usuario recién creado
    if (emailInput === "alanramirez45@gmail.com" || emailInput === savedEmail) {
        if (passInput === "123456789" || passInput === savedPass) {
            showToast('Ingresando...');
            setTimeout(() => { window.location.href = 'Menu.html'; }, 1000);
            return;
        }
    }

    const msg = document.getElementById('loginMessage') || document.getElementById('error-loginPassword');
    if (msg) {
        msg.textContent = 'Correo o contraseña incorrectos';
        msg.style.color = 'red';
    }
    document.getElementById('loginPassword').style.borderColor = 'red';
}

function bindPasswordToggle() {
    const pairs = [
        { btn: 'toggleLoginPassword', input: 'loginPassword' },
        { btn: 'toggleRegisterPassword', input: 'regPassword' }
    ];
    pairs.forEach(p => {
        const btn = document.getElementById(p.btn);
        const input = document.getElementById(p.input);
        if (btn && input) {
            btn.addEventListener('click', () => {
                input.type = input.type === 'password' ? 'text' : 'password';
            });
        }
    });
}

function showToast(message) {
    const toast = document.getElementById('authToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}