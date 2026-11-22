(function () {
    'use strict';

    const CHAVE_USUARIO = 'recife_acessivel_usuario';

    const usuarioInicial = {
        nome: 'Mariana Silva',
        email: 'mariana.silva@email.com',
        telefone: '(81) 99999-0000'
    };

    function lerUsuario() {
        try {
            const salvo = localStorage.getItem(CHAVE_USUARIO);
            if (salvo) {
                const dados = JSON.parse(salvo);
                return {
                    nome: dados.nome || usuarioInicial.nome,
                    email: dados.email || usuarioInicial.email,
                    telefone: dados.telefone || ''
                };
            }
        } catch (e) {}
        return { ...usuarioInicial };
    }

    function gravarUsuario(dados) {
        try {
            localStorage.setItem(CHAVE_USUARIO, JSON.stringify(dados));
        } catch (e) {}
    }

    function gerarIniciais(nome) {
        const partes = nome.trim().split(/\s+/).filter(Boolean);
        if (!partes.length) return 'US';
        if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }

    function mostrarAviso(el, texto) {
        if (!el) return;
        el.textContent = texto;
        el.hidden = false;
    }

    function limparAviso(el) {
        if (!el) return;
        el.textContent = '';
        el.hidden = true;
    }

    let usuario = lerUsuario();

    const abaLogin = document.getElementById('aba-login');
    const abaPerfil = document.getElementById('aba-perfil');
    const painelLogin = document.getElementById('painel-login');
    const painelPerfil = document.getElementById('painel-perfil');

    function trocarAba(destino, focar) {
        const verPerfil = destino === 'perfil';
        abaLogin.setAttribute('aria-selected', verPerfil ? 'false' : 'true');
        abaPerfil.setAttribute('aria-selected', verPerfil ? 'true' : 'false');
        painelLogin.hidden = verPerfil;
        painelPerfil.hidden = !verPerfil;

        if (focar) {
            (verPerfil ? abaPerfil : abaLogin).focus();
        }
    }

    abaLogin.addEventListener('click', function () {
        trocarAba('login', false);
    });

    abaPerfil.addEventListener('click', function () {
        trocarAba('perfil', false);
    });

    [abaLogin, abaPerfil].forEach(function (aba) {
        aba.addEventListener('keydown', function (ev) {
            if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
                ev.preventDefault();
                trocarAba(aba === abaLogin ? 'perfil' : 'login', true);
            }
        });
    });

    document.querySelectorAll('[data-toggle-senha]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const input = document.getElementById(btn.getAttribute('data-toggle-senha'));
            if (!input) return;
            const visivel = input.type === 'text';
            input.type = visivel ? 'password' : 'text';
            btn.setAttribute('aria-pressed', visivel ? 'false' : 'true');
            btn.textContent = visivel ? 'Mostrar' : 'Ocultar';
        });
    });

    const elAvatar = document.getElementById('perfil-avatar');
    const elNome = document.getElementById('perfil-nome');
    const elEmail = document.getElementById('dado-email');
    const elTelefone = document.getElementById('dado-telefone');
    const avisoPerfil = document.getElementById('aviso-perfil');
    const viewPerfil = document.getElementById('perfil-visualizacao');
    const editPerfil = document.getElementById('perfil-edicao');
    const btnEditar = document.getElementById('btn-editar-perfil');
    const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
    const btnSair = document.getElementById('btn-sair-conta');
    const formEditar = document.getElementById('form-editar-perfil');
    const inputEditNome = document.getElementById('editar-nome');
    const inputEditEmail = document.getElementById('editar-email');
    const inputEditTelefone = document.getElementById('editar-telefone');

    function renderizarPerfil() {
        elAvatar.textContent = gerarIniciais(usuario.nome);
        elNome.textContent = usuario.nome;
        elEmail.textContent = usuario.email;
        elTelefone.textContent = usuario.telefone.trim() || 'Não cadastrado';
    }

    renderizarPerfil();

    const formLogin = document.getElementById('form-login');
    const avisoLogin = document.getElementById('aviso-login');

    formLogin.addEventListener('submit', function (ev) {
        ev.preventDefault();
        limparAviso(avisoLogin);

        const email = document.getElementById('login-email').value.trim();
        const senha = document.getElementById('login-senha').value;

        if (!email || !email.includes('@')) {
            mostrarAviso(avisoLogin, 'Informe um e-mail válido.');
            document.getElementById('login-email').focus();
            return;
        }

        if (senha.length < 6) {
            mostrarAviso(avisoLogin, 'A senha precisa ter pelo menos 6 caracteres.');
            document.getElementById('login-senha').focus();
            return;
        }

        if (usuario.email.toLowerCase() !== email.toLowerCase()) {
            const base = email.split('@')[0].replace(/[._-]+/g, ' ');
            usuario.nome = base.charAt(0).toUpperCase() + base.slice(1);
            usuario.email = email;
            gravarUsuario(usuario);
        }

        renderizarPerfil();
        trocarAba('perfil', false);
        limparAviso(avisoPerfil);
        elNome.focus();
    });

    const modal = document.getElementById('modal-cadastro');
    const btnAbrirModal = document.getElementById('btn-abrir-cadastro');
    const btnFecharModal = document.getElementById('btn-fechar-modal');
    const btnCancelarModal = document.getElementById('btn-cancelar-cadastro');
    const formCadastro = document.getElementById('form-cadastro');
    const avisoCadastro = document.getElementById('aviso-cadastro');

    function abrirModal() {
        limparAviso(avisoCadastro);
        formCadastro.reset();
        if (typeof modal.showModal === 'function') {
            modal.showModal();
        } else {
            modal.setAttribute('open', 'open');
        }
        document.getElementById('cadastro-nome').focus();
    }

    function fecharModal() {
        if (typeof modal.close === 'function' && modal.open) {
            modal.close();
        } else {
            modal.removeAttribute('open');
        }
        btnAbrirModal.focus();
    }

    btnAbrirModal.addEventListener('click', abrirModal);
    btnFecharModal.addEventListener('click', fecharModal);
    btnCancelarModal.addEventListener('click', fecharModal);

    modal.addEventListener('click', function (ev) {
        if (ev.target === modal) fecharModal();
    });

    formCadastro.addEventListener('submit', function (ev) {
        ev.preventDefault();
        limparAviso(avisoCadastro);

        const nome = document.getElementById('cadastro-nome').value.trim();
        const email = document.getElementById('cadastro-email').value.trim();
        const senha = document.getElementById('cadastro-senha').value;

        if (nome.length < 2) {
            mostrarAviso(avisoCadastro, 'Informe seu nome.');
            document.getElementById('cadastro-nome').focus();
            return;
        }

        if (!email || !email.includes('@')) {
            mostrarAviso(avisoCadastro, 'Informe um e-mail válido.');
            document.getElementById('cadastro-email').focus();
            return;
        }

        if (senha.length < 6) {
            mostrarAviso(avisoCadastro, 'A senha precisa ter pelo menos 6 caracteres.');
            document.getElementById('cadastro-senha').focus();
            return;
        }

        usuario = { nome: nome, email: email, telefone: '' };
        gravarUsuario(usuario);
        renderizarPerfil();
        fecharModal();
        trocarAba('perfil', false);
        mostrarAviso(avisoPerfil, 'Conta criada.');
        avisoPerfil.focus();
    });

    btnEditar.addEventListener('click', function () {
        limparAviso(avisoPerfil);
        inputEditNome.value = usuario.nome;
        inputEditEmail.value = usuario.email;
        inputEditTelefone.value = usuario.telefone;

        viewPerfil.hidden = true;
        editPerfil.hidden = false;
        inputEditEmail.focus();
    });

    btnCancelarEdicao.addEventListener('click', function () {
        editPerfil.hidden = true;
        viewPerfil.hidden = false;
        btnEditar.focus();
    });

    formEditar.addEventListener('submit', function (ev) {
        ev.preventDefault();

        const nome = inputEditNome.value.trim();
        const email = inputEditEmail.value.trim();
        const telefone = inputEditTelefone.value.trim();

        if (nome.length < 2) {
            mostrarAviso(avisoPerfil, 'Informe seu nome.');
            inputEditNome.focus();
            return;
        }

        if (!email || !email.includes('@')) {
            mostrarAviso(avisoPerfil, 'Informe um e-mail válido.');
            inputEditEmail.focus();
            return;
        }

        usuario = { nome: nome, email: email, telefone: telefone };
        gravarUsuario(usuario);
        renderizarPerfil();
        editPerfil.hidden = true;
        viewPerfil.hidden = false;
        mostrarAviso(avisoPerfil, 'Dados atualizados.');
        avisoPerfil.focus();
    });

    btnSair.addEventListener('click', function () {
        editPerfil.hidden = true;
        viewPerfil.hidden = false;
        formLogin.reset();
        limparAviso(avisoLogin);
        trocarAba('login', false);
        document.getElementById('login-email').focus();
    });
})();