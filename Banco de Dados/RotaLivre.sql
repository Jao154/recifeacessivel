CREATE SCHEMA rota_livre;

USE rota_livre;

CREATE TABLE recursos_acess
(
    id_recurso   INT AUTO_INCREMENT,
    nome_recurso VARCHAR(100) NOT NULL,
    descricao    VARCHAR(500),

    CONSTRAINT pk_recursos_acess
        PRIMARY KEY (id_recurso),
    CONSTRAINT unique_nome_recurso
        UNIQUE (nome_recurso)
) AUTO_INCREMENT = 1;

CREATE TABLE validacoes
(
    id_validacao   INT AUTO_INCREMENT,
    data_envio     DATE                                       NOT NULL DEFAULT (CURRENT_DATE),
    status         ENUM ('PENDENTE', 'APROVADO', 'REJEITADO') NOT NULL DEFAULT 'PENDENTE',
    validado_por   VARCHAR(50)                                NOT NULL,
    url_formulario VARCHAR(2048)                              NOT NULL,

    CONSTRAINT pk_validacaos
        PRIMARY KEY (id_validacao)
) AUTO_INCREMENT = 1000;

CREATE TABLE categorias
(
    id_categoria INT AUTO_INCREMENT,
    nome         VARCHAR(50) NOT NULL,

    CONSTRAINT pk_categorias
        PRIMARY KEY (id_categoria),
    CONSTRAINT unique_nome
        UNIQUE (nome)
) AUTO_INCREMENT = 500;

CREATE TABLE pontos_turisticos
(
    id_ponto  INT AUTO_INCREMENT,
    nome      VARCHAR(50)   NOT NULL,
    descricao VARCHAR(2048) NOT NULL,
    endereco  VARCHAR(200)  NOT NULL,

    CONSTRAINT pk_ponto_turistico
        PRIMARY KEY (id_ponto),
    CONSTRAINT unique_ponto_turistico
        UNIQUE (nome)
) AUTO_INCREMENT = 100;

CREATE TABLE horarios_pontos
(
    id_ponto        INT,
    abre_seg_sexta  TIME,
    fecha_seg_sexta TIME,
    abre_sabado     TIME,
    fecha_sabado    TIME,
    abre_domingo    TIME,
    fecha_domingo   TIME,

    CONSTRAINT pk_horarios_ponto
        PRIMARY KEY (id_ponto),
    CONSTRAINT fk_horarios_ponto
        FOREIGN KEY (id_ponto)
            REFERENCES pontos_turisticos (id_ponto),
    CONSTRAINT check_horario_domingo
        CHECK (
            (abre_domingo IS NULL AND fecha_domingo IS NULL)
                OR
            (abre_domingo IS NOT NULL AND fecha_domingo IS NOT NULL)
            )
);

CREATE TABLE valores_ingressos
(
    id_ponto      INT,
    tipo_ingresso VARCHAR(20),
    segunda       NUMERIC(5, 2),
    terca         NUMERIC(5, 2),
    quarta        NUMERIC(5, 2),
    quinta        NUMERIC(5, 2),
    sexta         NUMERIC(5, 2),
    sabado        NUMERIC(5, 2),
    domingo       NUMERIC(5, 2),

    CONSTRAINT tipos_ingresso
        CHECK (
            tipo_ingresso IN ('INTEGRAL', 'ESTUDANTE', 'PCD')
            ),
    CONSTRAINT pk_valores_int
        PRIMARY KEY (id_ponto, tipo_ingresso),
    CONSTRAINT fk_valores_int
        FOREIGN KEY (id_ponto)
            REFERENCES pontos_turisticos (id_ponto)
);

CREATE TABLE contas_usuarios
(
    id_usuario INT AUTO_INCREMENT,
    email      VARCHAR(100) NOT NULL,
    nome       VARCHAR(100) NOT NULL,
    telefone   VARCHAR(11),

    CONSTRAINT pk_usuarios
        PRIMARY KEY (id_usuario),
    CONSTRAINT unique_email
        UNIQUE (email)
) AUTO_INCREMENT = 10000;

CREATE TABLE fotos_pontos
(
    id_foto  INT AUTO_INCREMENT,
    id_ponto INT           NOT NULL,
    url_foto VARCHAR(2048) NOT NULL,

    CONSTRAINT pk_fotos
        PRIMARY KEY (id_foto),
    CONSTRAINT fk_fotos_pontos
        FOREIGN KEY (id_ponto)
            REFERENCES pontos_turisticos(id_ponto)
) AUTO_INCREMENT = 2000;

CREATE TABLE telefones_pontos
(
    telefone VARCHAR(11),
    id_ponto INT,

    CONSTRAINT pk_telefones
        PRIMARY KEY (id_ponto, telefone),
    CONSTRAINT fk_telefones_ponto
        FOREIGN KEY (id_ponto)
            REFERENCES pontos_turisticos(id_ponto)
);

CREATE TABLE ponto_categoria
(
    id_ponto     INT,
    id_categoria INT,

    CONSTRAINT pk_ponto_cat
        PRIMARY KEY (id_ponto, id_categoria),
    CONSTRAINT fk_ponto_categoria
        FOREIGN KEY (id_ponto)
            REFERENCES pontos_turisticos (id_ponto),
    CONSTRAINT fk_cat
        FOREIGN KEY (id_categoria)
            REFERENCES categorias (id_categoria)

);

CREATE TABLE senhas_contas
(
    id_usuario   INT         NOT NULL,
    hashed_senha VARCHAR(60) NOT NULL,

    CONSTRAINT pk_senhas_contas
        PRIMARY KEY (id_usuario),
    CONSTRAINT fk_contas
        FOREIGN KEY (id_usuario)
            REFERENCES contas_usuarios (id_usuario)
);

CREATE TABLE favoritos
(
    id_ponto   INT,
    id_usuario INT,

    CONSTRAINT pk_favoritos
        PRIMARY KEY (id_ponto, id_usuario),
    CONSTRAINT fk_ponto_favoritos
        FOREIGN KEY (id_ponto)
            REFERENCES pontos_turisticos (id_ponto),
    CONSTRAINT fk_usuarios_favoritos
        FOREIGN KEY (id_usuario)
            REFERENCES contas_usuarios (id_usuario)
);

CREATE TABLE avaliacoes
(
    id_avaliacao   INT AUTO_INCREMENT,
    id_ponto       INT                         NOT NULL,
    id_usuario     INT                         NOT NULL,
    nota           NUMERIC(2, 1)               NOT NULL,
    data_avaliacao DATE DEFAULT (CURRENT_DATE) NOT NULL,
    comentario     VARCHAR(300),

    CONSTRAINT pk_avaliacao
        PRIMARY KEY (id_avaliacao),
    CONSTRAINT fk_ponto_avaliacao
        FOREIGN KEY (id_ponto)
            REFERENCES pontos_turisticos (id_ponto),
    CONSTRAINT fk_usuario_avaliacao
        FOREIGN KEY (id_usuario)
            REFERENCES contas_usuarios (id_usuario),
    CONSTRAINT nota_range
        CHECK (
            nota BETWEEN 0.0 AND 5.0
            ),
    CONSTRAINT unique_data_avaliacao
        UNIQUE (id_usuario, id_ponto, data_avaliacao)
) AUTO_INCREMENT = 5000;

CREATE TABLE validacao_ponto
(
    id_ponto       INT                         NOT NULL,
    id_recurso     INT                         NOT NULL,
    id_validacao   INT                         NOT NULL,
    data_validacao DATE DEFAULT (CURRENT_DATE) NOT NULL,
    resultado ENUM('VERIFICADO', 'NAO_VERIFICADO') NOT NULL DEFAULT ('NAO_VERIFICADO'),

    CONSTRAINT pk_validacao_ponto
        PRIMARY KEY (id_ponto, id_recurso, id_validacao),
    CONSTRAINT fk_validacao_ponto
        FOREIGN KEY (id_ponto)
            REFERENCES pontos_turisticos (id_ponto),
    CONSTRAINT fk_validacao_recurso
        FOREIGN KEY (id_recurso)
            REFERENCES recursos_acess (id_recurso),
    CONSTRAINT fk_validacao
        FOREIGN KEY (id_validacao)
            REFERENCES validacoes (id_validacao)
);










