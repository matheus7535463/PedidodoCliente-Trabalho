# 🚀 Hackathon Manager

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Responsive](https://img.shields.io/badge/Responsive-✔-success?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Concluído-blue?style=for-the-badge)

### Sistema de Gerenciamento de Equipes para Hackathons e Eventos

Projeto desenvolvido para substituir o gerenciamento manual de participantes e equipes por uma plataforma web moderna, intuitiva e eficiente.

</div>


# 📖 Sobre o Projeto

O **Hackathon Manager** é uma aplicação web desenvolvida para facilitar a organização de hackathons, maratonas de programação e eventos estudantis.

O sistema centraliza todas as informações do evento em uma única plataforma, permitindo que organizadores realizem o gerenciamento completo de participantes e equipes de forma rápida, segura e organizada.

Atualmente muitos eventos utilizam planilhas, papéis e aplicativos de mensagens para controlar equipes, o que torna o processo demorado e sujeito a erros.

Este projeto foi desenvolvido para resolver esse problema oferecendo uma interface moderna inspirada em plataformas como **GitHub**, **Notion** e **Trello**.


# 🎯 Objetivos

O sistema foi criado para permitir que o organizador consiga:

- cadastrar participantes;
- criar equipes;
- distribuir integrantes;
- definir líderes;
- visualizar indicadores do evento;
- acompanhar equipes em tempo real;
- reduzir erros de organização;
- facilitar futuras expansões da plataforma.


# ✨ Funcionalidades

## 📊 Dashboard

- Total de participantes
- Total de equipes
- Equipes completas
- Equipes com vagas
- Participantes sem equipe


## 👥 Gerenciamento de Participantes

- Cadastro
- Edição
- Exclusão
- Upload de foto (opcional)
- Associação à equipe
- Pesquisa rápida
- Filtros por habilidade
- Filtros por situação


## 👨‍💻 Gerenciamento de Equipes

- Cadastro
- Edição
- Exclusão de equipes vazias
- Definição da capacidade máxima
- Adição de integrantes
- Remoção de integrantes
- Transferência entre equipes
- Definição de líder


## 📈 Estatísticas

- Distribuição das habilidades
- Gráfico de equipes
- Indicadores do evento


## 📄 Exportação

- Exportação para CSV
- Geração de PDF
- Lista de participantes
- Lista de equipes


## 📱 Interface

- Layout Responsivo
- Dashboard moderno
- Navegação intuitiva
- Formulários simples
- Feedback visual
- Confirmações antes de exclusões
- Compatível com Desktop, Tablet e Mobile


# 🔒 Regras de Negócio

O sistema implementa diversas validações para garantir a integridade das informações.

✔ Um participante não pode pertencer a mais de uma equipe.

✔ Não é permitido cadastrar participantes duplicados.

✔ Equipes não podem ultrapassar sua capacidade máxima.

✔ Não é permitido excluir equipes que possuam integrantes.

✔ Não é permitido excluir participantes vinculados a equipes.

✔ A capacidade de uma equipe nunca pode ser reduzida abaixo da quantidade atual de integrantes.


# 🛠 Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Chart.js
- jsPDF
- Font Awesome
- LocalStorage


# 📂 Estrutura do Projeto

```
Hackathon-Manager/
│
├── index.html
├── style.css
├── script.js
│
└── README.md
```

---

# 💾 Armazenamento

Nesta primeira versão, os dados são armazenados localmente utilizando o **LocalStorage** do navegador.

Isso permite:

- persistência dos dados;
- rapidez na execução;
- funcionamento sem backend.


# 🚀 Como Executar

## 1️⃣ Clonar o repositório

```bash
git clone https://github.com/SEU-USUARIO/Hackathon-Manager.git
```


## 2️⃣ Acessar a pasta

```bash
cd Hackathon-Manager
```


## 3️⃣ Executar

Basta abrir o arquivo:

```
index.html
```

ou utilizar uma extensão como:

- Live Server (VS Code)


# 💡 Futuras Melhorias

O projeto foi preparado para futuras evoluções, como:

- Login de usuários
- Controle de permissões
- Múltiplos eventos
- Banco de Dados
- API REST
- Integração com Backend
- Relatórios avançados
- Exportação em Excel
- Envio de e-mails
- Aplicativo Mobile


# 📋 Documentação Desenvolvida

Durante o desenvolvimento do projeto foram produzidos os seguintes artefatos da Engenharia de Software:

- ✅ Levantamento de Requisitos
- ✅ Requisitos Funcionais
- ✅ Requisitos Não Funcionais
- ✅ Casos de Uso
- ✅ Diagrama de Entidade e Relacionamento (DER)
- ✅ Protótipos (Mockups)
- ✅ Estrutura do Banco de Dados
- ✅ Documentação do Projeto
- ✅ Versionamento utilizando Git e GitHub


# 👨‍💻 Equipe de Desenvolvimento

Projeto desenvolvido por:

- **Matheus**
- **Erick Matheus**
- **Kelvyn Prichoa**
- **Erika Perfeito**


# 📚 Disciplina

Projeto desenvolvido como atividade prática da disciplina de **Análise e Desenvolvimento de Sistemas**, aplicando conceitos de:

- Engenharia de Software
- Modelagem UML
- Requisitos
- Casos de Uso
- DER
- Desenvolvimento Web
- Versionamento de Código
- Interface Responsiva


# 📸 Preview

> *(Adicione aqui imagens ou GIFs do sistema.)*

```
📷 Dashboard

📷 Cadastro de Participantes

📷 Cadastro de Equipes

📷 Estatísticas

📷 Exportação
```

---

# 📄 Licença

Este projeto possui finalidade **acadêmica** e foi desenvolvido exclusivamente para fins de estudo e demonstração de conhecimentos em Engenharia de Software e Desenvolvimento Web para o curso de TI do Colégio Ulbra São Lucas.

---

<div align="center">

### ⭐ Se este projeto foi útil para você, considere deixar uma estrela no repositório!

**Hackathon Manager 2026**

</div>
