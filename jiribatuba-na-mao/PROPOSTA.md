# Jiribatuba na Mão — Proposta do aplicativo

> Nome provisório. Outras opções: **Voz de Jiribatuba**, **Câmara na Mão**, **Olho na Câmara**.

Documento de trabalho para orientar a equipe, buscar apoio e dar início ao desenvolvimento.
Data: outubro de 2026. Horizonte: eleições municipais de **1º de outubro de 2028**.

---

## 1. O problema

- Jiribatuba é o distrito mais populoso de Vera Cruz (Ilha de Itaparica, BA) e concentra o
  maior eleitorado do município, mas há cerca de 12 anos não elege um vereador.
- Em toda eleição, candidatos de fora do distrito levam muitos votos de lá com promessas rasas,
  atendimento individual a famílias e "agrados".
- O eleitor tem pouca informação sobre o que a Câmara e a Prefeitura fazem, o que cada vereador
  vota e o que é feito (ou não) em Jiribatuba.

## 2. A virada estratégica: informação + organização da comunidade

O app não deve ser só um "catálogo de políticos". Ele precisa responder três perguntas:

1. **O que está acontecendo?** — Câmara, Prefeitura, dinheiro público, obras.
2. **O que Jiribatuba quer?** — uma pauta construída pelos próprios moradores.
3. **Quem cumpre?** — acompanhamento de promessas e de mandatos, antes e depois da eleição.

Quando o morador vê, com números, quantos votos o distrito "exporta" e quanto recebe de volta em
obras e serviços, o argumento para votar em quem é daqui e se compromete com a pauta local passa a
ser concreto — e não depende de discurso.

### Por que o app deve ser apartidário

- **Confiança:** se o app parecer ferramenta de um grupo ou de um pré-candidato, metade do distrito
  deixa de usar e passa a desconfiar.
- **Lei eleitoral:** conteúdo pago ou mantido por candidato pode ser enquadrado como propaganda
  (inclusive antecipada) e os gastos podem precisar entrar na prestação de contas.
- **Recomendação:** criar ou usar uma **associação civil** (ex.: associação de moradores) como
  responsável formal pelo app, com regras públicas de conteúdo, igual espaço para todos os
  candidatos e financiamento transparente. O objetivo "eleger alguém de Jiribatuba" é alcançado
  pela conscientização, não por propaganda dentro do app.

## 3. Funcionalidades

### 3.1 Câmara Municipal na palma da mão
- Perfil de cada vereador: foto, partido, bairro/distrito de origem, votos recebidos (total e
  **em Jiribatuba**), contatos, comissões.
- Presença nas sessões e como votou em cada projeto ("placar das votações").
- Projetos de lei, indicações e requerimentos com **resumo em linguagem simples** e etiqueta
  "afeta Jiribatuba".
- Agenda de sessões, pauta, atas e link para a transmissão.
- "Como funciona a Câmara": o que faz um vereador, diferença entre lei, indicação e requerimento.

### 3.2 Prefeitura
- Prefeito, vice e secretários, com contatos.
- Orçamento (LOA/LDO/PPA): quanto está previsto e quanto foi gasto em Jiribatuba.
- Mapa de obras com status, valor, empresa contratada e fotos enviadas pelos moradores.
- Licitações e contratos relevantes (a partir do portal da transparência e do TCM-BA).

### 3.3 Jiribatuba em Números (funcionalidade-chave)
Usando os **dados abertos do TSE** (resultados por seção eleitoral, 2012–2024):
- Quantos eleitores votam nas seções de Jiribatuba.
- Para quem foram os votos para vereador em cada eleição e quanto foi para candidatos de fora.
- Simulador: "se X% desses votos tivessem ido para candidatos daqui, quantas cadeiras o distrito
  teria?" — explicando **quociente eleitoral e partidário** (ver seção 5).
- Comparativo: votos que o distrito deu × investimentos que recebeu.

### 3.4 Pauta de Jiribatuba (demandas da comunidade)
- Moradores registram problemas (iluminação, estrada, saúde, escola, água, pesca, turismo) com
  foto e localização.
- A comunidade apoia as demandas mais importantes → forma-se um **ranking de prioridades**.
- Em 2028, a pauta vira uma **Carta-Compromisso de Jiribatuba**: todos os candidatos (de dentro e
  de fora) são convidados a assinar publicamente. O app mostra quem assinou e quem não assinou.

### 3.5 Promessômetro e acompanhamento de mandato
- Registro público das promessas feitas por candidatos (com fonte: vídeo, foto, panfleto).
- Após a posse, acompanhamento: cumprida, em andamento, não cumprida.
- Isso combate diretamente a "promessa rasa": a promessa fica registrada e é cobrada.

### 3.6 Voto consciente e combate à compra de votos
- Conteúdo educativo: compra de voto é crime para **quem oferece e para quem aceita**
  (art. 299 do Código Eleitoral; art. 41-A da Lei 9.504/97 cassa o registro/diploma do candidato).
- Botão "Denunciar" que encaminha para o **Pardal** (app oficial da Justiça Eleitoral) e para o
  Ministério Público Eleitoral. O nosso app **não** deve receber nem guardar denúncias — evita
  risco jurídico e de vazamento.

### 3.7 Candidatos 2028
- A partir do registro das candidaturas (até 15/08/2028), ficha de todos os candidatos a prefeito
  e vereador com dados do **DivulgaCandContas** (TSE): bens, certidões, partido, propostas.
- Comparador lado a lado e filtro "candidatos de Jiribatuba".
- Sabatinas/debates comunitários gravados, com as mesmas perguntas para todos.

### 3.8 Consultas e enquetes — com cuidado legal
- **Permitido e recomendado:** enquetes sobre prioridades do distrito, avaliação de serviços,
  temas de projetos de lei.
- **Evitar sempre:** perguntar "em quem você vai votar". Enquetes de intenção de voto são
  **proibidas** no período eleitoral, e desde 1º/01/2028 qualquer pesquisa eleitoral divulgada
  precisa de registro na Justiça Eleitoral (Lei 9.504/97, art. 33), sob pena de multa e crime.
- Toda enquete deve exibir: "consulta sem valor científico".

### 3.9 Comunicação
- Notificações: "sessão hoje", "projeto que afeta Jiribatuba entrou em pauta", "obra atualizada".
- Integração com **WhatsApp** (canal e/ou robô) — é onde a população realmente está.

## 4. Alcance: o app sozinho não basta

- Muita gente tem celular simples e internet ruim → app leve (PWA), funcionar com pouca
  conexão, letra grande, áudio explicando os conteúdos.
- **Embaixadores por rua/comunidade:** voluntários que ajudam a instalar, cadastrar e usar.
- Cartazes com QR Code em comércios, escolas, igrejas, postos de saúde, colônia de pescadores.
- Rádio comunitária / carro de som com os "números de Jiribatuba".
- Encontros mensais presenciais para apresentar a Pauta e os dados.

## 5. Ponto crítico: o sistema proporcional

Vereador é eleito pelo sistema proporcional. Não basta o candidato ser bem votado — o **partido**
(ou federação) precisa atingir o quociente eleitoral, e o candidato precisa de pelo menos 10% do
quociente. Desde 2020 não há coligação para vereador.

Consequências práticas para Jiribatuba:
- **Fragmentação:** vários candidatos do distrito em partidos fracos dividem os votos e ninguém
  entra. Isso provavelmente explica parte dos 12 anos sem vereador.
- O app deve **explicar isso com o simulador** (seção 3.3), para que comunidade e lideranças
  locais discutam, de forma aberta, como não pulverizar os votos.
- Ação fora do app: lideranças de Jiribatuba precisam negociar com partidos com chance real de
  atingir o quociente em Vera Cruz.

## 6. Segurança, privacidade e confiabilidade

- **LGPD:** opinião política é **dado pessoal sensível** (art. 5º, II). Coletar o mínimo,
  consentimento explícito, nunca vender ou repassar dados, política de privacidade clara,
  encarregado de dados (DPO) nomeado e possibilidade de apagar a conta.
- Não pedir CPF nem título de eleitor. Cadastro com telefone (código SMS) para limitar contas
  falsas; um voto por conta nas enquetes; limite de requisições contra robôs.
- Dados criptografados em trânsito (HTTPS) e em repouso; backups; senhas e chaves fora do código.
- Toda informação com **fonte e data** (link para o documento oficial).
- Moderação de comentários e regra contra ataques pessoais e notícias falsas; registro de quem
  publicou o quê.
- Revisão jurídica (advogado eleitoral) antes de cada fase, principalmente em 2028.

## 7. Tecnologia sugerida (MVP de baixo custo)

| Camada | Sugestão | Motivo |
|---|---|---|
| App | **PWA** (Next.js ou React) | Abre no navegador, instala sem loja, roda em celular simples |
| App nativo (depois) | Flutter ou React Native | Publicar na Play Store quando houver tração |
| Backend | Supabase (Postgres + autenticação + storage) | Gratuito no início, seguro, fácil |
| Dados | Scripts que importam CSV do TSE, portal da transparência e da Câmara | Atualização automática |
| Mapas | OpenStreetMap / Leaflet | Gratuito |
| Mensagens | WhatsApp Business API / canal | Alcance real |

Fontes de dados públicos:
- TSE — Portal de Dados Abertos (resultados por seção, eleitorado, candidatos) e DivulgaCandContas.
- Câmara Municipal de Vera Cruz — site, portal da transparência, atas e diário oficial.
- Prefeitura de Vera Cruz — portal da transparência e diário oficial.
- TCM-BA — contas e licitações dos municípios baianos.
- IBGE — população e dados do distrito.

## 8. Cronograma

| Fase | Período | Entregas |
|---|---|---|
| 0 — Preparação | nov/2026 – mar/2027 | Equipe, associação responsável, levantamento de dados, pesquisa com moradores, identidade visual |
| 1 — MVP | abr – ago/2027 | Câmara, Prefeitura, **Jiribatuba em Números**, conteúdo educativo |
| 2 — Participação | set/2027 – jun/2028 | Pauta de Jiribatuba, enquetes de prioridades, mapa de obras, WhatsApp |
| 3 — Eleição | jul – out/2028 | Carta-Compromisso, fichas e comparador de candidatos, sabatinas, voto consciente (sem pesquisas de intenção de voto) |
| 4 — Mandato | 2029 em diante | Promessômetro, acompanhamento dos eleitos, prestação de contas |

## 9. Equipe mínima

- Coordenação geral e articulação comunitária
- 1–2 desenvolvedores (front-end + back-end)
- Designer (pode ser voluntário)
- Conteúdo: pessoa que acompanhe sessões e traduza projetos para linguagem simples
- Apoio jurídico (eleitoral + LGPD)
- Rede de embaixadores comunitários

## 10. Apoio e financiamento

- Associação de moradores / colônia de pescadores / comerciantes locais.
- Editais de inovação cívica, transparência e cidadania (fundações, institutos, universidades).
- Parceria com universidades (UFBA, UNEB, IFBA) — projeto de extensão com alunos de computação,
  direito e jornalismo.
- Prestação de contas pública do próprio projeto, dentro do app.
- Atenção: evitar dinheiro de pré-candidatos e partidos para manter a neutralidade.

## 11. Como medir o sucesso

- Nº de usuários ativos em Jiribatuba (meta: X% do eleitorado).
- Nº de demandas registradas e quantas foram atendidas.
- Nº de candidatos que assinaram a Carta-Compromisso.
- Percentual dos votos de Jiribatuba que ficaram com candidatos comprometidos com a pauta local
  (comparar 2024 × 2028).

## 12. Próximos passos imediatos

1. Confirmar com dados oficiais: número de eleitores e seções de Jiribatuba, número de cadeiras
   da Câmara de Vera Cruz, resultados de 2016, 2020 e 2024.
2. Montar o núcleo da equipe e definir a entidade responsável.
3. Conversar com 30–50 moradores (idades diferentes) para validar o que eles querem no app.
4. Construir o protótipo da tela inicial + "Jiribatuba em Números".
