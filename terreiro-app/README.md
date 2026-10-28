# App do Centro do Caboclo Sete Flechas

Aplicativo para ler e **ouvir** as histórias dos inkices da nação Angola-Congo (com o nome correspondente no Ketu), dos caboclos, erês, ibejis e pretos-velhos, além da história da casa, do calendário de festas e de um glossário.

- Funciona no celular, no tablet e no computador, e pode ser instalado na tela inicial.
- Depois de aberto uma vez, funciona sem internet.
- Tem letra ajustável (A− / A+) e botão **Ouvir** em todas as histórias. Se houver uma gravação na pasta `audio/`, ela toca; se não houver, o próprio aparelho lê o texto em voz alta.

## Como abrir

É um site simples, sem instalação. Para testar no computador:

```bash
cd terreiro-app && python3 -m http.server 8000
```

Depois abra `http://localhost:8000`. Para todos da casa usarem, publique a pasta `terreiro-app` em um site gratuito (GitHub Pages, Netlify ou Vercel) e compartilhe o link.

## Como personalizar

- **Logomarca:** o brasão oficial está em `img/logo.png` (e `img/logo-192.png` para o ícone).
- **Textos:** tudo fica em `data.js` (história da casa, caboclos da casa, festas, inkices, guias, glossário).
- **Caboclos da casa:** cada um tem um bloco em `window.CABOCLOS`, dentro de `data.js`. Os textos marcados como provisórios são para trocar pelas histórias contadas pelos mais velhos. Os cânticos entram no campo `cantigas` (letra) e na pasta `audio/` (gravação).
- **Prévia:** enquanto `versao: "Prévia"` estiver em `data.js`, a tela inicial avisa que o app está em construção. Para o lançamento, deixe `versao: ""`.
- **Gravações:** veja `audio/LEIAME.md`.

## Sobre o conteúdo

Os textos reúnem o que é mais comum nas casas de Angola e o que dizem estudos sobre o candomblé banto (Bate Folha, Tumba Junsara, Tumbensi). Cada casa tem os seus fundamentos: cores, dias, folhas, comidas e saudações devem ser conferidos com o Tata e os mais velhos antes da apresentação.
