document.addEventListener('DOMContentLoaded', () => {
    inicializarBancoUsuarios();
});

function inicializarBancoUsuarios() {
    let dbStr = localStorage.getItem('flowtime_usuarios');
    let db = dbStr ? JSON.parse(dbStr) : [];
    
    // VERIFICAÇÃO INTELIGENTE: Busca especificamente se o Admin já existe
    const adminExiste = db.find(u => u.email === "admin");
    if (!adminExiste) {
        db.push({ id: "usr_admin", nome: "Administrador", email: "admin", senha: "123456" });
    }

    // VERIFICAÇÃO INTELIGENTE: Busca especificamente se o Marcos já existe
    const marcosExiste = db.find(u => u.email === "marcos@teste.com");
    if (!marcosExiste) {
        db.push({ id: "usr_padrao_01", nome: "Marcos", email: "marcos@teste.com", senha: "123" });
    }

    // Salva o banco atualizado de volta no navegador
    localStorage.setItem('flowtime_usuarios', JSON.stringify(db));
}

function alternarTelas(telaId) {
    document.getElementById('tela-login').style.display = 'none';
    document.getElementById('tela-registro').style.display = 'none';
    document.getElementById(telaId).style.display = 'flex';
}

function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginSenha').value.trim();

    if (!email || !pass) {
        mostrarToastLogin("Preencha e-mail/usuário e senha!", "#C62828");
        return;
    }

    const db = JSON.parse(localStorage.getItem('flowtime_usuarios')) || [];
    const usuarioEncontrado = db.find(u => u.email === email && u.senha === pass);

    if (usuarioEncontrado) {
        sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
        window.location.href = '../menu/index.html';
    } else {
        mostrarToastLogin("Credenciais incorretas!", "#C62828");
    }
}

function registrarUsuario() {
    const nome = document.getElementById('regNome').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regSenha').value.trim();
    const passConf = document.getElementById('regSenhaConfirma').value.trim();

    if (!nome || !email || !pass || !passConf) {
        mostrarToastLogin("Preencha todos os campos!", "#C62828");
        return;
    }

    if (pass !== passConf) {
        mostrarToastLogin("As senhas não conferem!", "#C62828");
        return;
    }

    const db = JSON.parse(localStorage.getItem('flowtime_usuarios')) || [];
    
    if (db.find(u => u.email === email)) {
        mostrarToastLogin("Este e-mail já está cadastrado!", "#C62828");
        return;
    }

    const novoId = `usr_${Date.now()}`;
    db.push({ id: novoId, nome: nome, email: email, senha: pass });
    localStorage.setItem('flowtime_usuarios', JSON.stringify(db));

    mostrarToastLogin("Conta criada com sucesso!", "#41d09a");
    
    document.getElementById('regNome').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regSenha').value = '';
    document.getElementById('regSenhaConfirma').value = '';
    
    setTimeout(() => {
        alternarTelas('tela-login');
    }, 1500);
}

function mostrarToastLogin(mensagem, corHex) {
    const container = document.querySelector('.app-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.innerText = mensagem;
    toast.style.position = 'absolute'; toast.style.top = '20px'; toast.style.left = '50%'; toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = corHex; toast.style.color = 'white'; toast.style.padding = '12px 25px';
    toast.style.borderRadius = '25px'; toast.style.fontWeight = 'bold'; toast.style.fontSize = '14px';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'; toast.style.zIndex = '1000';
    toast.style.animation = 'surgimentoToast 0.3s ease-out';
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; setTimeout(() => toast.remove(), 500); }, 3000);
}