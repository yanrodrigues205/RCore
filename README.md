# Contexto da Aplicação 

 
 R Core é um serviço para rastreamento veicular, a aplicação utiliza o framework Nest JS para dividir a aplicação em camadas, o banco Postgres foi escolhido pela sua robustes e controle dos dados. ORM escolhido para o gerênciamento dos dados da aplicação é o PRISMA.

 * Aplicação foi desenvolvida sem utilizar inteligência artificial, justamente para construir algo escalável e duradouro. Não realizar qualquer manutenção ou correção usando IA.

 * Repositório deve ser dividido em três ambientes para uma melhor organização, seguindo o respectivo fluxo: developer -> staging -> produção (main), enquanto o projeto for uma POC a alteração do fluxo pode ser alterada.

 * Qualquer alteração de banco de dados deve ser realizada por meio de uma migration, assim o fluxo ficará dinâmico e aumenta a facilidade na mudança de infraestrutura.

 * Testes unitários ainda não estão sendo aplicados porém todos os módulos devem incluir seus respectivos arquivos(specs) para implementação futura.

 * A porta da API é a 3000, já a porta do gataway receptor(TCP) dos dados de rastreamento é a 5000.

 * Toda documentação de integração está disponível no endpoint `/docs`, no mesmo é possível testar toda integração por meio do swagger.


 ### Documentação dos Módulos da Aplicação

| Nomenclatura | Construção | Caminho | Objetivo 
| :--- | :---: | :---: | :--- |
| Tracker | WebSocket | `./src/tracker/` | Módulo que disponha de um serviço web socket para que os rastreadores fechem conexão e enviem os dados pelo protocolo GT06. | 
| Auth | API | `./src/auth/` | Módulo responsável por realizar toda autenticação dentro da API, inclusive o mesmo é responsável pelo "guard", o middleware de autenticação das rotas. |
| Tracker Data | API | `./src/tracker-data/` | Administrar os dados que são entregues pelo WebSocket no banco de dados, essas informações englobam latitude, longitude, quantidade de satélites próximos, velocidade e etc.. |
| Tracking Devices | API |`./src/tracking-devices/` | Administrar os dados de identiticação de cada dispositivos, como por exemplo, o modelo do equipamento, o IMEI, Telefone vínculado ao chip do módulo e etc... | 
| Vehicles | API | `./src/vehicles` | Administrar os dados identificação dos veículos,importante a se destacar é que um usuário pode ter vários veículos(frota), porém cada veículo deve estar vínuculado a apenas um módulo de rastreamento, sem identificação do módulo não deve ser cadastrado. |


### Fluxo inicial após clonar o projeto

* 1 - Rodar o comando `npm install` para baixar todas dependências do projeto.

* 2 - Configurar o arquivo `.env` com as credenciais de conexão com o banco e a secret de segurança da API, pode gerar a mesma pelo LastPass, se basear no arquivo `.env.example`, FOCO AO REALIZAR A CONFIGURAÇÃO DAS VARIÁVEIS DO BANCO DE DADOS.

* 3 - Rodar todas as migrations no novo banco de dados conectado pelo comando `npx prisma migrate dev`.

* 4 - Gerar os arquivos e dependências necessárias para aplicação conversar com o banco de dados por meio do PRISMA `npx prisma generate`.

* 5 - Realizar o build de todos arquivos para que o ambiente de produção fique pré-configurado, por meio do `npm run build`.

* 6 - Rodar a aplicação como ambiente de desenvolvimento, por meio do comando `npm run start:dev`.


### Criar módulos dentro da aplicação

* 1 - Criar o controlador responsável por manipulação dos dados e apontar para o respectivo serviço: `nest g controller NOME_DO_CONTROLLER`.

* 2 - Criar módulo responsável por administrar conteúdo dos arquivos de service e controller, importar informações e vincular\integrar outros módulos: `nest g module NOME_DO_MÓDULO`.

* 3 - Criar serviço responsável pela comunicação direta com banco de dados ou com integração com serviços externos: `nest g service NOME_DO_SERVIÇO`.


### Documentação da API
<img width="1357" height="651" alt="image" src="https://github.com/user-attachments/assets/ff7b084e-fc6e-4961-8d28-eed37a3bea50" />

### Diagrama do Banco de Dados Atualmente
<img width="859" height="459" alt="image" src="https://github.com/user-attachments/assets/b005b22f-cf6d-4539-84b2-b9c30b702c89" />


