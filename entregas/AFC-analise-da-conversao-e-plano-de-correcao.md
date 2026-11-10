# AFC — Análise da conversão de fevereiro para o MPVS e plano de correção

> Documento **interno** da SKX. Não enviar à AFC.

## 1. O que aconteceu

| Data | Documento | Base de dados |
|---|---|---|
| 23/02 a 02/03/2026 | Pesquisa original no Google Forms (SKX + psicóloga organizacional) | 13 respostas, 30 afirmações, 2 setores (Operacional 10, Administrativo 3) |
| ago/2026 | Planilha "convertida" para o questionário MPVS de 41 perguntas (feita com o Claude) | Mesmas 13 linhas, mesmos horários de envio, mas **com outras respostas** e 4 setores novos |
| 25/08/2026 | Relatório "Mapa Psicossocial MPVS" | Planilha convertida |
| 06/11/2026 | Relatório "SKX – Gestão Integrada de NR 01" enviado à AFC | **Idêntico** ao de 25/08 (mesmos scores; só mudou a marca) |

Os dois relatórios saíram da planilha convertida. As médias por setor batem com ela até a casa decimal (ex.: Estoque, Estresse e Exaustão = 66,7).

## 2. Por que a planilha convertida não vale como dado

A conversão não "traduziu" as respostas. Ela **gerou respostas novas** para as 41 perguntas. As evidências:

1. **As respostas convertidas não acompanham as originais.** Comparando pessoa a pessoa (cada linha tem o mesmo horário de envio nas duas planilhas), a correlação entre o score original e o convertido da mesma dimensão é praticamente nula:

   | Dimensão | Correlação original × convertido |
   |---|---|
   | Reconhecimento | −0,04 |
   | Clareza de Papéis | +0,06 |
   | Exigências Quantitativas | +0,06 |
   | Apoio dos Colegas | +0,08 |
   | Estresse e Exaustão | +0,19 |
   | Influência no Trabalho | +0,26 |
   | Conflito Trabalho-Família | +0,28 |
   | Insegurança no Trabalho | +0,50 |
   | Apoio da Liderança | +0,95 (a única que foi realmente transposta) |

2. **Exemplos concretos:**
   - Os **dois estoquistas** responderam "Sempre" (a opção mais favorável) em quase tudo. Score original de Estresse e Exaustão = **0**. Na planilha convertida eles aparecem com **42 e 67**.
   - Exigências Quantitativas: no original, 7 das 13 pessoas têm score 0 ou próximo. Na convertida, **ninguém** fica abaixo de 25.
3. **Perguntas que nunca foram feitas ganharam resposta.** Exigências Emocionais (3 perguntas) e Sentido do Trabalho (2 perguntas) não existem no formulário de fevereiro, mas têm respostas para as 13 pessoas.
4. **As pessoas foram trocadas de setor:**
   - **"Estoque"** = 1 estoquista + 1 motorista;
   - **"Vendas Externo"** = 1 estoquista + 2 vendedores;
   - **"Técnico"** = consultor externo, motorista, vendedor e os 2 técnicos.
5. **A confidencialidade foi quebrada:** os setores têm 2, 3, 3 e 5 pessoas, abaixo do mínimo de 5 do próprio MPVS.

**Conclusão:** os relatórios de 25/08 e 06/11 refletem respostas que os colaboradores não deram. O nome técnico mais adequado é **erro na conversão de dados entre instrumentos**. Não é uma diferença de interpretação.

## 3. Resultado correto (dados originais, regras do MPVS)

Recalculado direto das 30 respostas originais. A memória de cálculo está em `Anexos-B-C-AFC-resultados-e-memoria-de-calculo.xlsx`.

| Dimensão | Relatório enviado (pior setor) | **Correto (consolidado, n = 13)** |
|---|---|---|
| Estresse e Exaustão | IV – Alto (Estoque) | **III – Moderado** (score 36,5) |
| Insegurança no Trabalho | III – Moderado (3 setores) | **III – Moderado, no limite** (28,8) |
| Ritmo de Trabalho | III – Moderado (4 setores) | II – Baixo (21,8) |
| Exigências Quantitativas | III – Moderado (4 setores) | II – Baixo (17,3) |
| Exigências Emocionais | III – Moderado (4 setores) | **Não avaliada** |
| Influência no Trabalho | III – Moderado (Técnico) | II – Baixo (28,2) |
| Reconhecimento | III – Moderado (Técnico) | II – Baixo (34,6) |
| Justiça Organizacional | III – Moderado (Técnico) | II – Baixo (1,9) |
| Conflito Trabalho-Família | III – Moderado (Estoque) | II – Baixo (21,2) |
| Confiança Organizacional | III – Moderado (Estoque) | II – Baixo (16,0) |
| **Total** | **22 Moderado + 1 Alto** | **2 Moderado** |

## 4. Como refazer no MPVS (passo a passo)

> ⚠️ **Não use a lixeira "Remover setor".** No MPVS, excluir um setor apaga **todas as respostas e, em cascata, os GSEs, as funções e os riscos do PGR** daquele setor. Os 4 setores da AFC são os mesmos do PGR. O caminho seguro é **iniciar um novo ciclo**: o ciclo errado fica arquivado (nada é apagado) e o novo começa sem as respostas convertidas, com os mesmos setores.

**Etapa A – Guardar a evidência (fora do sistema)**
1. Salve numa pasta "AFC – versão substituída": os PDFs de 25/08 e 06/11, a planilha convertida (41 perguntas), a planilha original do Forms e este documento.

**Etapa B – Arquivar o ciclo errado**
2. Abra o cliente **AFC Representação e Serviços Ltda** e vá para a tela do psicossocial.
3. Clique em **"Iniciar novo ciclo"**. O sistema avisa que o ciclo atual tem 13 respostas e pergunta se quer continuar. Confirme. O ciclo antigo fica "encerrado", com tudo guardado.
4. Confira: os 4 setores continuam lá, com **0 respostas**. Os GSEs/funções de cada setor (botão "GHEs / Funções") continuam iguais.
   *Se algo der errado, o botão **"Reverter para o ciclo anterior"** desfaz.*

**Etapa C – Lançar os dados corretos**
5. No **primeiro setor**, clique em **"Dados manuais/externos"**.
6. No campo **"Fonte/descrição dos dados externos"**, cole:
   > Pesquisa própria SKX elaborada com psicóloga organizacional (Google Forms), aplicada de 23/02 a 02/03/2026, 13 respondentes, 30 afirmações em escala de 1 a 5. Scores convertidos para as dimensões COPSOQ conforme mapeamento documentado (memória de cálculo anexa). Resultado consolidado da empresa, aplicado a todos os setores por haver menos de 5 respostas por setor. Exigências Emocionais e Sentido do Trabalho não avaliadas.
7. Preencha os scores. **Deixe em branco** as duas dimensões não avaliadas:

   | Dimensão | Score |
   |---|---|
   | Exigências Quantitativas | 17,3 |
   | Ritmo de Trabalho | 21,8 |
   | Exigências Emocionais | *(em branco)* |
   | Influência no Trabalho | 28,2 |
   | Desenvolvimento e Crescimento | 28,8 |
   | Sentido do Trabalho | *(em branco)* |
   | Apoio dos Colegas | 4,8 |
   | Apoio da Liderança | 3,8 |
   | Qualidade da Liderança | 13,5 |
   | Clareza de Papéis | 7,7 |
   | Reconhecimento | 34,6 |
   | Conflito Trabalho-Família | 21,2 |
   | Insegurança no Trabalho | 28,8 |
   | Justiça Organizacional | 1,9 |
   | Confiança Organizacional | 16,0 |
   | Estresse e Exaustão | 36,5 |

8. Clique em **Salvar**.
9. **Repita os passos 5 a 8 nos outros 3 setores**, com os mesmos valores e o mesmo texto. Como o resultado é consolidado, ele vale para todos os GSEs. Assim nenhum setor fica "sem dados" e o PGR recebe os fatores em todos os GSEs.

**Etapa D – Conferir o diagnóstico**
10. Vá em **"Diagnóstico & Plano de Ação"**. Em cada setor devem aparecer como **III – Moderado** só:
    - **Estresse e Exaustão** (score 36,5, GE 2, GES 4, GR 8);
    - **Insegurança no Trabalho** (score 28,8, GE 2, GES 3, GR 6).

    Todo o resto deve aparecer como Baixo/Trivial, e as duas dimensões em branco devem aparecer sem dado. Se aparecer algo diferente, pare e me mande um print.
11. Deixe **"Nº de ações já implantadas" em 0**. Só preencha quando a AFC comprovar um controle que já existe.

**Etapa E – Ajustar o plano de ação** (nas linhas dos 2 fatores Moderados, em cada setor)
12. O texto da "Medida corretiva" é automático. Detalhe a ação concreta nos campos editáveis, usando a aba **"Plano de ação revisado"** da planilha de anexos:
    - **Estresse e Exaustão:**
      - Forma de acompanhamento: "Rodas de conversa por setor para identificar as fontes; ajustes na organização do trabalho; canal de escuta/acolhimento."
      - Aferição: "Score da dimensão abaixo de 26 na reaplicação; absenteísmo e atestados CID F."
    - **Insegurança no Trabalho:**
      - Forma de acompanhamento: "Comunicação periódica da Direção sobre a situação e os planos da empresa; descrição de cargos e critérios de carreira."
      - Aferição: "Score abaixo de 26 na reaplicação; turnover."
    - **Responsável e prazo:** só depois de combinar com a AFC (na reunião). Não deixe "RH da empresa" com 30 dias em tudo.
    - **Status:** "Não iniciado".

**Etapa F – Gerar os documentos**
13. Vá em **"Relatório Completo"** e confira três pontos:
    - a introdução deve citar a fonte "dados externos" (o texto do passo 6), e **não** "versão curta (41 perguntas)";
    - o resumo deve mostrar "Riscos altos/críticos: 0";
    - os Top riscos devem ser só os 2 Moderados.

    Depois gere o PDF.
14. Gere o **Plano de Ação Consolidado** (formato PGR) e confira.
15. **Atualize o PGR** ("Gerar PGR") com o novo inventário psicossocial e encaminhe ao médico do PCMSO.
16. Anexe à resposta à AFC: o relatório novo, o plano consolidado e a planilha `Anexos-B-C-AFC-resultados-e-memoria-de-calculo.xlsx`. **Não envie** a planilha bruta do Forms nem a convertida.

**Etapa G – Depois**
17. Programe a **nova aplicação** do questionário MPVS, pelo link do próprio sistema, com os colaboradores cadastrados para controle de participação. Ela vira a linha de base oficial e cobre as duas dimensões que faltam.

## 5. Como explicar à AFC

- **Diga o que aconteceu, sem rodeios e sem dramatizar:** "Na conversão das respostas da pesquisa de fevereiro para o formato do sistema MPVS houve erro: as respostas foram transcritas para um questionário diferente e redistribuídas em setores, e a transcrição não corresponde às respostas originais. O relatório de 06/11/2026 fica substituído."
- **Evite "mal-entendido".** A AFC já tem os dois documentos e vai comparar. Ela recebe melhor um "erro na conversão, identificado e corrigido" do que uma explicação que depois se mostre incompleta. A própria revisão mostra que o processo de controle funcionou.
- **Destaque o lado positivo, que é real:** o resultado correto é bem mais favorável à empresa (2 fatores Moderados em vez de 23 classificações de risco, nota de indicação 9,4/10, liderança muito bem avaliada).
- **Não identifique pessoas** nem mostre resultados por função.
- [Se a AFC também recebeu o relatório de 25/08, citar os dois documentos como substituídos.]

## 6. Para evitar que se repita

- **Nunca** converter resposta individual de um questionário para outro. Quando as perguntas são diferentes, use **só** "Dados manuais/externos", com score por dimensão e mapeamento documentado.
- Antes de emitir o relatório, confira se o número de respostas por setor é pelo menos 5 e se as dimensões sem pergunta ficaram em branco.
- Guarde junto com cada relatório a planilha de origem e a memória de cálculo.
