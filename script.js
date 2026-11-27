(() => {
    'use strict';

    function iniciarFiltros() {
        const catalogo = document.querySelector('#lista-destinos');
        if (!catalogo) return;

        const cartoes = Array.from(
            catalogo.querySelectorAll('.cartao-destino')
        );

        const campoLocal = document.querySelector('#filtro-local');
        const campoTopo = document.querySelector('#busca-topo');
        const formularioTopo = campoTopo
            ? campoTopo.closest('form')
            : null;

        const botoesCidade = Array.from(
            document.querySelectorAll('[data-filter-city]')
        );

        const botoesRecurso = Array.from(
            document.querySelectorAll('[data-filter-resource]')
        );

        const botaoLimpar = document.querySelector('#btn-clear-filters');
        const resumo = document.querySelector('#resumo-resultados');
        const mensagemVazia = document.querySelector('#sem-resultados');

        const estado = {
            municipio: 'all',
            recursos: new Set(),
            busca: ''
        };

        function normalizar(valor) {
            return String(valor || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLocaleLowerCase('pt-BR')
                .trim();
        }

        function atualizarBotoes() {
            botoesCidade.forEach((botao) => {
                const selecionado =
                    botao.dataset.filterCity === estado.municipio;

                botao.classList.toggle('ativo', selecionado);
                botao.setAttribute(
                    'aria-pressed',
                    String(selecionado)
                );
            });

            botoesRecurso.forEach((botao) => {
                const selecionado = estado.recursos.has(
                    botao.dataset.filterResource
                );

                botao.classList.toggle('ativo', selecionado);
                botao.setAttribute(
                    'aria-pressed',
                    String(selecionado)
                );
            });
        }

        function atualizarResumo(visiveis) {
            if (!resumo) return;

            const quantidadeRecife = visiveis.filter(
                (cartao) => cartao.dataset.city === 'recife'
            ).length;

            const quantidadeOlinda = visiveis.filter(
                (cartao) => cartao.dataset.city === 'olinda'
            ).length;

            const total = visiveis.length;

            if (total === 0) {
                resumo.textContent = 'Nenhum destino encontrado.';
                return;
            }

            const textoTotal = total === 1
                ? '1 destino encontrado'
                : `${total} destinos encontrados`;

            const partes = [];

            if (quantidadeRecife > 0) {
                partes.push(`Recife (${quantidadeRecife})`);
            }

            if (quantidadeOlinda > 0) {
                partes.push(`Olinda (${quantidadeOlinda})`);
            }

            resumo.textContent = partes.length > 0
                ? `${textoTotal}: ${partes.join(' e ')}.`
                : `${textoTotal}.`;
        }

        function definirVisibilidade(elemento, visivel) {
            elemento.hidden = !visivel;
            elemento.style.display = visivel ? '' : 'none';
        }

        function aplicarFiltros() {
            const termo = normalizar(estado.busca);
            const visiveis = [];

            cartoes.forEach((cartao) => {
                const municipio = cartao.dataset.city || '';

                const recursosDoCartao = (
                    cartao.dataset.resources || ''
                )
                    .split(/\s+/)
                    .filter(Boolean);

                const textoCartao = normalizar(cartao.textContent);

                const municipioCorresponde =
                    estado.municipio === 'all' ||
                    municipio === estado.municipio;

                // Lógica E: precisa possuir todos os recursos selecionados.
                const recursoCorresponde =
                    estado.recursos.size === 0 ||
                    Array.from(estado.recursos).every(
                        (recurso) => recursosDoCartao.includes(recurso)
                    );

                const buscaCorresponde =
                    termo === '' || textoCartao.includes(termo);

                const corresponde =
                    municipioCorresponde &&
                    recursoCorresponde &&
                    buscaCorresponde;

                definirVisibilidade(cartao, corresponde);

                if (corresponde) {
                    visiveis.push(cartao);
                }
            });

            if (mensagemVazia) {
                definirVisibilidade(
                    mensagemVazia,
                    visiveis.length === 0
                );
            }

            atualizarResumo(visiveis);
            atualizarBotoes();
        }

        function definirBusca(valor, origem) {
            estado.busca = valor;

            if (campoLocal && origem !== 'lateral') {
                campoLocal.value = valor;
            }

            if (campoTopo && origem !== 'topo') {
                campoTopo.value = valor;
            }

            aplicarFiltros();
        }

        botoesCidade.forEach((botao) => {
            botao.addEventListener('click', () => {
                estado.municipio = botao.dataset.filterCity || 'all';

                // Limpa a busca textual ao trocar de município para não bloquear resultados da outra cidade
                estado.busca = '';
                if (campoLocal) campoLocal.value = '';
                if (campoTopo) campoTopo.value = '';

                aplicarFiltros();
            });
        });

        botoesRecurso.forEach((botao) => {
            botao.addEventListener('click', () => {
                const recurso = botao.dataset.filterResource;

                if (!recurso) return;

                if (estado.recursos.has(recurso)) {
                    estado.recursos.delete(recurso);
                } else {
                    estado.recursos.add(recurso);
                }

                aplicarFiltros();
            });
        });

        if (campoLocal) {
            campoLocal.addEventListener('input', () => {
                definirBusca(campoLocal.value, 'lateral');
            });
        }

        if (campoTopo) {
            campoTopo.addEventListener('input', () => {
                definirBusca(campoTopo.value, 'topo');
            });
        }

        if (formularioTopo) {
            formularioTopo.addEventListener('submit', (evento) => {
                evento.preventDefault();

                definirBusca(
                    campoTopo ? campoTopo.value : '',
                    'topo'
                );

                const secaoCatalogo =
                    document.querySelector('#catalogo');

                if (secaoCatalogo) {
                    secaoCatalogo.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }

        if (botaoLimpar) {
            botaoLimpar.addEventListener('click', () => {
                estado.municipio = 'all';
                estado.recursos.clear();
                estado.busca = '';

                if (campoLocal) campoLocal.value = '';
                if (campoTopo) campoTopo.value = '';

                aplicarFiltros();

                if (campoLocal) {
                    campoLocal.focus();
                }
            });
        }

        // Aplica termo de busca vindo pela URL (?q=...) a partir de outras páginas
        const params = new URLSearchParams(location.search);
        const termoUrl = params.get('q');
        if (termoUrl) {
            definirBusca(termoUrl, null);
        } else {
            aplicarFiltros();
        }
    }

    function iniciarBuscaPaginasInternas() {
        const catalogo = document.querySelector('#lista-destinos');
        if (catalogo) return;

        const inputTopo = document.querySelector('#busca-topo');
        const formTopo = inputTopo ? inputTopo.closest('form') : null;

        if (formTopo) {
            formTopo.addEventListener('submit', (evento) => {
                evento.preventDefault();
                const termo = inputTopo.value.trim();
                location.href =
                    '../index.html' +
                    (termo ? '?q=' + encodeURIComponent(termo) : '') +
                    '#catalogo';
            });
        }
    }

    function iniciarControlesAcessibilidade() {
        const raiz = document.documentElement;

        const botoesContraste = [
            document.querySelector('#btn-toggle-contrast'),
            document.querySelector('#btn-header-contrast')
        ].filter(Boolean);

        const botoesFonte = [
            document.querySelector('#btn-toggle-font'),
            document.querySelector('#btn-header-font')
        ].filter(Boolean);

        function lerPreferencia(chave) {
            try {
                return localStorage.getItem(chave) === 'true';
            } catch (erro) {
                return false;
            }
        }

        function salvarPreferencia(chave, valor) {
            try {
                localStorage.setItem(chave, String(valor));
            } catch (erro) {
                // Mantém a funcionalidade mesmo sem armazenamento.
            }
        }

        function aplicarContraste(ativado) {
            raiz.classList.toggle('alto-contraste', ativado);

            botoesContraste.forEach((botao) => {
                botao.setAttribute('aria-pressed', String(ativado));
                botao.setAttribute(
                    'aria-label',
                    ativado ? 'Desativar alto contraste' : 'Ativar alto contraste'
                );
            });
        }

        function aplicarFonte(ampliada) {
            raiz.classList.toggle('fonte-ampliada', ampliada);

            botoesFonte.forEach((botao) => {
                botao.setAttribute('aria-pressed', String(ampliada));
                botao.setAttribute(
                    'aria-label',
                    ampliada
                        ? 'Restaurar tamanho original do texto'
                        : 'Aumentar tamanho do texto'
                );
            });
        }

        // Recupera as preferências anteriores entre páginas.
        aplicarContraste(lerPreferencia('recife-acessivel-alto-contraste'));
        aplicarFonte(lerPreferencia('recife-acessivel-fonte-ampliada'));

        botoesContraste.forEach((botao) => {
            botao.addEventListener('click', () => {
                const ativado = !raiz.classList.contains('alto-contraste');
                aplicarContraste(ativado);
                salvarPreferencia('recife-acessivel-alto-contraste', ativado);
            });
        });

        botoesFonte.forEach((botao) => {
            botao.addEventListener('click', () => {
                const ampliada = !raiz.classList.contains('fonte-ampliada');
                aplicarFonte(ampliada);
                salvarPreferencia('recife-acessivel-fonte-ampliada', ampliada);
            });
        });
    }

    function iniciarPerfil() {
        const abaLogin = document.getElementById('aba-login');
        const abaPerfil = document.getElementById('aba-perfil');
        const painelLogin = document.getElementById('painel-login');
        const painelPerfil = document.getElementById('painel-perfil');
        const formLogin = document.getElementById('form-login');

        if (!abaLogin || !abaPerfil || !painelLogin || !painelPerfil || !formLogin) {
            return;
        }

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
            } catch (e) { }
            return { ...usuarioInicial };
        }

        function gravarUsuario(dados) {
            try {
                localStorage.setItem(CHAVE_USUARIO, JSON.stringify(dados));
            } catch (e) { }
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

        abaLogin.addEventListener('click', () => {
            trocarAba('login', false);
        });

        abaPerfil.addEventListener('click', () => {
            trocarAba('perfil', false);
        });

        [abaLogin, abaPerfil].forEach((aba) => {
            aba.addEventListener('keydown', (ev) => {
                if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
                    ev.preventDefault();
                    trocarAba(aba === abaLogin ? 'perfil' : 'login', true);
                }
            });
        });

        document.querySelectorAll('[data-toggle-senha]').forEach((btn) => {
            btn.addEventListener('click', () => {
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

        const avisoLogin = document.getElementById('aviso-login');

        formLogin.addEventListener('submit', (ev) => {
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

        modal.addEventListener('click', (ev) => {
            if (ev.target === modal) fecharModal();
        });

        formCadastro.addEventListener('submit', (ev) => {
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

        btnEditar.addEventListener('click', () => {
            limparAviso(avisoPerfil);
            inputEditNome.value = usuario.nome;
            inputEditEmail.value = usuario.email;
            inputEditTelefone.value = usuario.telefone;

            viewPerfil.hidden = true;
            editPerfil.hidden = false;
            inputEditEmail.focus();
        });

        btnCancelarEdicao.addEventListener('click', () => {
            editPerfil.hidden = true;
            viewPerfil.hidden = false;
            btnEditar.focus();
        });

        formEditar.addEventListener('submit', (ev) => {
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

        btnSair.addEventListener('click', () => {
            editPerfil.hidden = true;
            viewPerfil.hidden = false;
            formLogin.reset();
            limparAviso(avisoLogin);
            trocarAba('login', false);
            document.getElementById('login-email').focus();
        });
    }

    function iniciarTudo() {
        iniciarFiltros();
        iniciarBuscaPaginasInternas();
        iniciarControlesAcessibilidade();
        iniciarPerfil();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarTudo, { once: true });
    } else {
        iniciarTudo();
    }
})();
