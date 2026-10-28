# Levantamento de dados — outubro de 2026

Informações coletadas nos sites oficiais e nos dados abertos do TSE para alimentar o app.

## 1. Prefeitura de Vera Cruz — https://veracruz.ba.gov.br

- **Prefeito:** Igor Pinho Santos (MDB), advogado, eleito em 2024 com 66,15% dos votos válidos.
- **Vice-prefeito:** Emerson Souza de Santana, o "Mecinho Santana" (PDT).
- **Coligação:** "Pra Mudança Continuar" (MDB, PDT, PODE, DC, PRTB, UNIÃO, AVANTE, SOLIDARIEDADE).
- **Endereço:** Rua São Bento, 123 – Centro – Mar Grande. Tel. (71) 3633-1401. Seg–sex 8h30–14h30.
- **Secretarias:** Saúde, Educação, Fazenda (Sefaz), Infraestrutura (Seinfra), Administração,
  Promoção Social, Economia Criativa/Cultura/Turismo, Sucom, Superintendência de Trânsito,
  Procuradoria Geral, Controladoria Interna.
- **Transparência** (sistema Fiorilli): `baveracruz.dcfiorilli.com.br:879/transparencia/`
  (despesas, receitas, licitações, contratos, servidores).
- **Diário Oficial:** https://pmveracruzba.imprensaoficial.org/
- **e-SIC:** https://veracruz.ba.gov.br/esic?p=novo-pedido
- **Ouvidoria:** https://ouvidoria.acessoinformacao.com.br/ba/veracruz

**Para o app:** o site é WordPress e tem **API aberta** (`/wp-json/wp/v2/posts`). Dá para puxar as
notícias automaticamente e filtrar as que citam Jiribatuba.

**Dado curioso:** desde jan/2025 o site publicou 79 notícias. Só **6** citam Jiribatuba
(a última: pavimentação da Rua Nova do Campo, 24/09/2026; antes: Prefeitura Itinerante em
abr/2025 e entrega da sede social em fev/2025).

## 2. Câmara Municipal — https://camaraveracruz.ba.gov.br

- **Endereço:** Rua São Bento, 73 – Centro – Mar Grande. Tel. (71) 99109-5046.
  E-mail: camaramunicipaldeveracruz@hotmail.com. Seg–sex 8h–14h.
- **13 vereadores.**
- O site é basicamente o **Diário Oficial da Câmara** (832 edições até 27/10/2026): portarias,
  contratos, licitações, relatórios fiscais e leis municipais (ex.: Leis 1105, 1106, 1109, 1113–1117/2025
  e 1128/2026). Há uma API JSON (Open T.I.) e o WordPress também expõe `/wp-json/`.
- **Não tem:** lista de vereadores com perfil, presença, votações nominais, projetos em tramitação.
  As atas e pautas ficam num sistema externo (knack) difícil de consultar.

**Para o app:** essa falta de informação é justamente a oportunidade. O app pode ser o lugar
onde o morador encontra quem são os vereadores e o que a Câmara aprovou. As atas e projetos
podem ser pedidos via **e-SIC/Lei de Acesso à Informação**.

## 3. Eleição de vereador 2024 — dados do TSE

Fonte: dados abertos do TSE (votação por seção e locais de votação, 2024). Os recortes de Vera Cruz
estão em `dados/tse-2024/` e a análise em `scripts/analise_tse_2024.py`.

### Números gerais
- Eleitorado de Vera Cruz: **36.330** eleitores, 31 locais de votação.
- Votos válidos para vereador: **29.539** → **quociente eleitoral ≈ 2.272 votos**.
- 153 candidatos a vereador.

### Vereadores eleitos (2025–2028)

| Vereador | Partido | Votos | Onde teve mais votos | Votos nas seções de Jiribatuba |
|---|---|---:|---|---:|
| Tatinho | MDB | 1.294 | Gamboa | 18 |
| Jorge Rasta | PDT | 1.154 | Barra Grande | 34 |
| Olimpio Lima | PDT | 1.038 | Duro | 8 |
| Fabio Costa | PSD | 963 | Duro | 9 |
| Elton Castro | UNIÃO | 917 | Ilhota | 10 |
| Apollo | PSB | 827 | Coroa | 4 |
| Neto Mola | REPUBLICANOS | 782 | Barra do Gil | 9 |
| Niraldo | UNIÃO | 780 | Ilhota | 13 |
| Jeovah Família | PODE | 734 | Duro | 5 |
| Val da Caçamba | PSD | 726 | Tairu | 19 |
| Marquinhos | PODE | 725 | Coroa | 12 |
| Ivan Filho | MDB | 705 | Duro | 23 |
| João do PT | PT | 584 | Barra do Gil | 5 |

"Onde teve mais votos" é o local de votação com mais votos do candidato. Não é o endereço dele,
que o TSE não informa.

### Jiribatuba (locais de votação classificados pelo TSE como "Distrito de Jiribatuba")
- Escola Narciso de Pinho (4 seções), Nova Creche Municipal (2) e Escola Pres. Emílio G. Médici (2):
  **8 seções, 2.954 eleitores**.
- Votos nominais para vereador nessas seções: **2.338**.
  - **75,9% (1.774)** foram para candidatos cuja maior votação foi em Jiribatuba.
  - 24,1% (564) foram para candidatos de outras localidades.

### A descoberta principal: o problema é a divisão dos votos

Em 2024, **10 candidatos de Jiribatuba** disputaram e **nenhum foi eleito**:

| Candidato | Partido | Votos totais | Votos em Jiribatuba |
|---|---|---:|---:|
| Roquinho Muniz | PODE | 603 | 429 |
| Marcelo Silveira | PC do B | 444 | 252 |
| Well | PODE | 315 | 257 |
| Luiz Washington | PDT | 276 | 216 |
| Arenilson da Conceição | PODE | 198 | 142 |
| Curió | REPUBLICANOS | 170 | 148 |
| Nido Correria | UNIÃO | 156 | 116 |
| Aildes Amiga do Povo | PODE | 127 | 107 |
| Ni | PSD | 100 | 85 |
| Vaval | PSD | 48 | 22 |
| **Total** | | **2.437** | **1.774** |

- Somados, os candidatos locais tiveram **2.437 votos**, mais que o quociente eleitoral inteiro
  (≈ 2.272) e **quase o dobro** do vereador menos votado entre os eleitos (584).
- Roquinho Muniz, sozinho, teve mais votos (603) que um vereador eleito (João do PT, 584).
  Ficou de fora porque era o 3º mais votado do PODE, que conquistou só 2 cadeiras.
- Quatro candidatos locais estavam no **mesmo partido (PODE)** e disputaram os mesmos votos
  entre si.

**Conclusão:** nas seções de Jiribatuba, a maioria dos eleitores já votou em gente do distrito.
O que impediu a eleição foi a **pulverização** em muitos candidatos e partidos. A estratégia para
2028 deve focar em **unidade** (menos candidaturas locais, em partidos com chance real de atingir
o quociente) além de combater o voto para fora.

### A confirmar com a equipe
O TSE só chama de "Distrito de Jiribatuba" os 3 locais acima (2.954 eleitores). Se o distrito,
como a comunidade o entende (≈ 15 mil habitantes), inclui outras localidades, como Baiacu,
Matarandiba, Barra Grande, Tairu, Conceição ou Campinas, é preciso dizer quais. Aí a análise é
refeita. Nessas localidades o peso dos candidatos de fora pode ser bem maior.
