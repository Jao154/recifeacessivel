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

                // Lógica OU: basta possuir um dos recursos selecionados.
                const recursoCorresponde =
                    estado.recursos.size === 0 ||
                    Array.from(estado.recursos).some(
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
                estado.municipio =
                    botao.dataset.filterCity || 'all';

                if (estado.busca !== '') {
                    definirBusca('', null);
                    return;
                }

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

    function iniciarTudo() {
        iniciarFiltros();
        iniciarBuscaPaginasInternas();
        iniciarControlesAcessibilidade();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarTudo, { once: true });
    } else {
        iniciarTudo();
    }
})();
