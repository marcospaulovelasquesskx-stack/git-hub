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

O sistema tem a função **"Dados manuais/externos"**, feita para pesquisas com perguntas diferentes das do MPVS. Ela pede o score de cada dimensão (0–100), aceita deixar em branco a dimensão não avaliada e exige uma descrição da fonte, que aparece na metodologia do relatório. Os passos:

1. **Guardar evidência:** salve os PDFs de 25/08 e 06/11 e a planilha convertida numa pasta "AFC – versão substituída". Não apague o histórico.
2. **Remover a base errada:** no ciclo da AFC, exclua as 13 respostas importadas e os 4 setores criados na importação (Administrativo/Vendas, Vendas Externo, Técnico, Estoque).
3. **Criar 1 setor consolidado**, por exemplo "AFC – Todos os setores (consolidado)". Com 13 respostas não é possível separar setores sem expor pessoas.
4. **Abrir "Dados manuais/externos"** nesse setor e preencher:

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

   **Fonte (texto sugerido):** "Pesquisa própria SKX elaborada com psicóloga organizacional (Google Forms), aplicada de 23/02 a 02/03/2026, 13 respondentes, 30 afirmações em escala de 1 a 5. Scores convertidos para as dimensões COPSOQ conforme mapeamento documentado (Anexo C). Exigências Emocionais e Sentido do Trabalho não avaliadas. Resultados apenas consolidados (mínimo de 5 respostas por grupo)."
5. **Controles já existentes:** só preencha "ações já implantadas" quando a AFC comprovar o controle (ex.: canal de escuta já em funcionamento). Cada controle reduz 1 ponto do GE.
6. **Gerar o novo relatório e o plano consolidado.** Confira se aparecem só **Estresse e Exaustão (GR 8)** e **Insegurança no Trabalho (GR 6)** como Moderado.
7. **Personalizar o plano.** Os textos automáticos do sistema são genéricos, e a AFC criticou exatamente isso. Use as ações da aba "Plano de ação revisado" da planilha de anexos: cada ação traz a evidência, se é obrigatória ou recomendação, e o indicador. Defina com a AFC o responsável e o prazo reais (não "RH da empresa / 30 dias" para tudo).
8. **Atualizar o PGR:** o inventário psicossocial passa a ter só esses dois fatores. Depois, encaminhe ao médico do PCMSO.
9. **Planejar a nova aplicação** do questionário MPVS (41 ou 76 perguntas), feita direto pelo link do sistema, com controle de participação. Ela vira a linha de base oficial e cobre as duas dimensões que faltam.

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
