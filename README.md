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


📷 Use Case
<img width="1536" height="751" alt="image" src="https://github.com/user-attachments/assets/51b752f8-7293-43fb-b51f-9b0eb8ea00a6" />

📷 DER
<img width="931" height="561" alt="61ad6f96-1ecf-4566-902f-d1410b8239b3" src="https://github.com/user-attachments/assets/902cfcbf-014d-497c-98bd-51734c7593bb" />

📷 Mockup
<img width="999" height="564" alt="Captura de tela 2026-07-16 163521" src="https://github.com/user-attachments/assets/ff361bb4-cc00-464f-adbc-4a1db8312e23" />
<img width="1003" height="641" alt="Captura de tela 2026-07-16 163544" src="https://github.com/user-attachments/assets/98051822-ed37-4d34-a297-9156c4f46993" />
<img width="978" height="660" alt="Captura de tela 2026-07-16 163611" src="https://github.com/user-attachments/assets/398a80fa-c251-4e89-a847-0056106cf334" />
<img width="840" height="602" alt="Captura de tela 2026-07-16 163649" src="https://github.com/user-attachments/assets/5c414120-fe37-4abd-b5b6-7bdd5dda0add" />
<img width="837" height="629" alt="Captura de tela 2026-07-16 163710" src="https://github.com/user-attachments/assets/3cfbb2ba-074b-4bba-ba5f-d9bb0ae30d2f" />

📷 Dashboard
<img width="1362" height="643" alt="cf8a5b9e-06a8-4fa2-aaf7-8e4f0502fd0a" src="https://github.com/user-attachments/assets/6590c7bf-75d1-4eed-96f6-e1bfa89c2af8" />

📷 Cadastro de Participantes
<img width="1363" height="639" alt="3cc462de-8b3d-427f-8e39-b27a1134b76a" src="https://github.com/user-attachments/assets/34f3ba12-b51a-4bcd-8377-1e9477e77fee" />

📷 Cadastro de Equipes
<img width="1365" height="640" alt="318abe92-c62a-479d-ba8e-ede7d0f6f1d7" src="https://github.com/user-attachments/assets/a411e570-32be-495a-b48b-327d4735dacf" />


📷 Estatísticas
<img width="1364" height="641" alt="1378b97a-77aa-421b-b628-c680e4902399" src="https://github.com/user-attachments/assets/29974290-7d3b-4823-9b7a-dd0c22722a5b" />


📷 Exportação
<img width="1366" height="640" alt="f92fa03d-5df9-4de2-bbf6-926cc9876f03" src="https://github.com/user-attachments/assets/015b3ba1-c745-47f6-bad5-20909864b5f5" />


---

# 📄 Licença

Este projeto possui finalidade **acadêmica** e foi desenvolvido exclusivamente para fins de estudo e demonstração de conhecimentos em Engenharia de Software e Desenvolvimento Web para o curso de TI do Colégio Ulbra São Lucas.

---

<div align="center">

### ⭐ Se este projeto foi útil para você, considere deixar uma estrela no repositório!

**Hackathon Manager 2026**

</div>
