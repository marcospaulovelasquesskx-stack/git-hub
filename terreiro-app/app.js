(function () {
  "use strict";

  const app = document.getElementById("app");
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  /* ---------- Preferências (tamanho da letra, velocidade da voz) ---------- */
  const prefs = { fonte: 1.15, velocidade: 0.9 };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem("prefs") || "{}")); } catch (e) { /* sem armazenamento */ }
  const salvarPrefs = () => { try { localStorage.setItem("prefs", JSON.stringify(prefs)); } catch (e) { /* ignora */ } };
  const aplicarFonte = () => document.documentElement.style.setProperty("--escala", prefs.fonte);
  aplicarFonte();
  $("#mais").onclick = () => { prefs.fonte = Math.min(1.8, +(prefs.fonte + 0.1).toFixed(2)); aplicarFonte(); salvarPrefs(); };
  $("#menos").onclick = () => { prefs.fonte = Math.max(0.9, +(prefs.fonte - 0.1).toFixed(2)); aplicarFonte(); salvarPrefs(); };

  /* ---------- Logomarca: se existir img/logo.png, ela substitui o ícone ---------- */
  let temLogo = false;
  const testeLogo = new Image();
  testeLogo.onload = () => { temLogo = true; $("#logo-topo").src = CASA.logo; rota(); };
  testeLogo.src = CASA.logo;

  /* ---------- Áudio ----------
     Se houver uma gravação em audio/<id>.mp3 (por exemplo, a voz do Pai Adilson
     ou de um mais velho), ela é tocada. Se não houver, o próprio aparelho lê o texto. */
  const player = $("#player");
  const audioEl = new Audio();
  const fala = { partes: [], i: 0, pausado: false, ativo: false };
  let vozPt = null;

  function escolherVoz() {
    if (!("speechSynthesis" in window)) return;
    const vozes = speechSynthesis.getVoices().filter((v) => /^pt(-|_)?BR/i.test(v.lang));
    const outras = speechSynthesis.getVoices().filter((v) => /^pt/i.test(v.lang));
    vozPt = vozes.find((v) => /google|luciana|francisca|natural/i.test(v.name)) || vozes[0] || outras[0] || null;
  }
  if ("speechSynthesis" in window) {
    escolherVoz();
    speechSynthesis.onvoiceschanged = escolherVoz;
  }

  // Textos longos são cortados por alguns navegadores, então lemos frase a frase.
  function partir(texto) {
    return texto.replace(/\s+/g, " ").match(/[^.!?;:]+[.!?;:]*/g)?.map((s) => s.trim()).filter(Boolean) || [];
  }

  function falarProxima() {
    if (!fala.ativo || fala.pausado) return;
    if (fala.i >= fala.partes.length) return parar();
    const u = new SpeechSynthesisUtterance(fala.partes[fala.i]);
    u.lang = "pt-BR";
    if (vozPt) u.voice = vozPt;
    u.rate = prefs.velocidade;
    u.onend = () => { if (fala.ativo && !fala.pausado) { fala.i++; falarProxima(); } };
    u.onerror = u.onend;
    speechSynthesis.speak(u);
  }

  function mostrarPlayer(titulo) {
    $("#player-titulo").textContent = titulo;
    $("#player-estado").textContent = "Tocando";
    $("#player-pausa").innerHTML = "&#10074;&#10074;";
    $("#player-pausa").setAttribute("aria-label", "Pausar");
    player.hidden = false;
    document.body.classList.add("tocando");
  }

  function lerTexto(titulo, texto) {
    if (!("speechSynthesis" in window)) {
      alert("Este aparelho não consegue ler o texto em voz alta. Tente pelo navegador Chrome.");
      return;
    }
    fala.partes = partir(texto);
    fala.i = 0;
    fala.pausado = false;
    fala.ativo = true;
    mostrarPlayer(titulo);
    falarProxima();
  }

  async function ouvir(titulo, texto, idAudio) {
    parar();
    if (idAudio) {
      const src = `audio/${idAudio}.mp3`;
      try {
        const r = await fetch(src, { method: "HEAD" });
        if (r.ok) {
          audioEl.src = src;
          audioEl.playbackRate = 1;
          mostrarPlayer(titulo + " (voz da casa)");
          await audioEl.play();
          return;
        }
      } catch (e) { /* sem gravação: lê o texto */ }
    }
    lerTexto(titulo, texto);
  }

  function parar() {
    fala.ativo = false;
    fala.pausado = false;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    audioEl.pause();
    audioEl.removeAttribute("src");
    player.hidden = true;
    document.body.classList.remove("tocando");
  }
  audioEl.onended = parar;

  $("#player-parar").onclick = parar;
  $("#player-pausa").onclick = () => {
    const btn = $("#player-pausa");
    const pausando = audioEl.src ? !audioEl.paused : !fala.pausado;
    if (audioEl.src) pausando ? audioEl.pause() : audioEl.play();
    else if (pausando) { fala.pausado = true; speechSynthesis.cancel(); }
    else { fala.pausado = false; falarProxima(); }
    btn.innerHTML = pausando ? "&#9654;" : "&#10074;&#10074;";
    btn.setAttribute("aria-label", pausando ? "Continuar" : "Pausar");
    $("#player-estado").textContent = pausando ? "Pausado" : "Tocando";
  };

  // Cada botão "Ouvir" guarda o que deve ser lido.
  const leituras = {};
  let nLeitura = 0;
  function botaoOuvir(titulo, texto, idAudio, rotulo = "Ouvir") {
    const k = "l" + nLeitura++;
    leituras[k] = { titulo, texto, idAudio };
    return `<button class="ouvir" data-ler="${k}"><span aria-hidden="true">&#128266;</span> ${esc(rotulo)}</button>`;
  }
  app.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ler]");
    if (!b) return;
    const l = leituras[b.dataset.ler];
    ouvir(l.titulo, l.texto, l.idAudio);
  });

  /* ---------- Pedaços de tela ---------- */
  const cor = (item) => (item.cores && item.cores[0] ? item.cores[0][1] : "#2e6b2e");
  const cor2 = (item) => (item.cores && item.cores[1] ? item.cores[1][1] : cor(item));
  const lista = (arr) => arr.join(", ");

  function cartao(item, href) {
    const sub = item.ketu ? `No Ketu: ${esc(item.ketu)}` : esc(item.resumo);
    return `<a class="cartao" href="${href}" style="--c1:${cor(item)};--c2:${cor2(item)}">
      <span class="faixa" aria-hidden="true"></span>
      <span class="cartao-txt">
        <strong>${esc(item.nome)}</strong>
        <small>${sub}</small>
        ${item.destaque ? `<em class="selo">${esc(item.destaque)}</em>` : ""}
      </span>
      <span class="seta" aria-hidden="true">&#8250;</span>
    </a>`;
  }

  function textoParaOuvir(item) {
    const p = [item.nome + "."];
    if (item.ketu) p.push(`Na nação Ketu, é conhecido como ${item.ketu}.`);
    if (item.outros && item.outros.length) p.push(`Outros nomes: ${lista(item.outros)}.`);
    p.push(item.resumo);
    p.push(...item.historia);
    p.push(`Cores: ${lista(item.cores.map((c) => c[0]))}.`);
    p.push(`Dia da semana: ${item.dia}.`);
    if (item.elementos) p.push(`Elementos: ${item.elementos}.`);
    p.push(`Folhas: ${lista(item.folhas)}.`);
    p.push(`Oferendas: ${lista(item.oferendas)}.`);
    p.push(`Festa: ${item.festa}`);
    return p.join(" ");
  }

  function detalhe(item, colecao, base) {
    const idx = colecao.indexOf(item);
    const ant = colecao[idx - 1];
    const prox = colecao[idx + 1];
    const info = [
      ["Dia da semana", esc(item.dia)],
      ["Saudação", esc(item.saudacao)],
      item.elementos && ["Elementos", esc(item.elementos)],
      item.dominios && ["O que rege", esc(item.dominios)],
      ["Festa", esc(item.festa)],
    ].filter(Boolean);

    return `<article class="detalhe">
      <header class="capa" style="--c1:${cor(item)};--c2:${cor2(item)}">
        <div class="folhagem" aria-hidden="true"></div>
        ${item.destaque ? `<em class="selo">${esc(item.destaque)}</em>` : ""}
        <h1>${esc(item.nome)}</h1>
        ${item.ketu ? `<p class="ketu">No Ketu: <b>${esc(item.ketu)}</b></p>` : ""}
        ${item.outros && item.outros.length ? `<p class="outros">Também chamado: ${esc(lista(item.outros))}</p>` : ""}
      </header>

      <div class="acoes">
        ${botaoOuvir(item.nome, textoParaOuvir(item), item.id, "Ouvir tudo")}
        ${botaoOuvir(item.nome + " (história)", item.historia.join(" "), item.id + "-historia", "Só a história")}
      </div>

      <p class="resumo">${esc(item.resumo)}</p>

      <section>
        <h2>História</h2>
        ${item.historia.map((p) => `<p>${esc(p)}</p>`).join("")}
      </section>

      <section>
        <h2>Cores</h2>
        <ul class="cores">${item.cores.map(([n, c]) => `<li><span style="background:${c}"></span>${esc(n)}</li>`).join("")}</ul>
      </section>

      <section>
        <dl class="ficha">${info.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join("")}</dl>
      </section>

      <section>
        <h2>Folhas</h2>
        <ul class="chips folha">${item.folhas.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      </section>

      <section>
        <h2>Oferendas</h2>
        <ul class="chips oferenda">${item.oferendas.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      </section>

      <section class="cantigas">
        <h2>Cânticos</h2>
        <p>Os cânticos são ensinados na casa, de boca a ouvido, pelos mais velhos. Este espaço é para as gravações do próprio terreiro.</p>
        ${botaoOuvir("Cântico de " + item.nome, "Ainda não há cântico gravado para " + item.nome + ". Peça aos mais velhos da casa.", item.id + "-cantiga", "Ouvir cântico da casa")}
      </section>

      <p class="aviso">Cada casa de Angola tem os seus fundamentos. Confira sempre com o Tata e os mais velhos.</p>

      <nav class="vizinhos">
        ${ant ? `<a href="${base}/${ant.id}">&#8249; ${esc(ant.nome)}</a>` : "<span></span>"}
        ${prox ? `<a href="${base}/${prox.id}">${esc(prox.nome)} &#8250;</a>` : "<span></span>"}
      </nav>
    </article>`;
  }

  /* ---------- Calendário ---------- */
  const DATAS_GERAIS = [
    { mes: 1, dia: null, titulo: "Lembá (Oxalá)", texto: "Mês de Lembá, junto da Lavagem do Bonfim, em muitas casas.", id: "lemba" },
    { mes: 2, dia: 2, titulo: "Kaitumbá (Iemanjá)", texto: "Dia das águas do mar em muitas casas.", id: "kaitumba" },
    { mes: 4, dia: 23, titulo: "Nkosi (Ogum)", texto: "Junto do dia de São Jorge, em muitas casas.", id: "nkosi" },
    { mes: 5, dia: 13, titulo: "Pretos-Velhos", texto: "Memória da abolição e da liberdade conquistada.", ent: "pretos-velhos" },
    { mes: 7, dia: 2, titulo: "Caboclos", texto: "Independência da Bahia, dia dos caboclos.", ent: "caboclos" },
    { mes: 7, dia: 26, titulo: "Nzumbarandá (Nanã)", texto: "Dia de Sant'Ana, em muitas casas.", id: "zumbaranda" },
    { mes: 8, dia: null, titulo: "Kavungo e Tempo", texto: "Mês de Kavungo (Omolu) e, em muitas casas de Angola, de Kitembo.", id: "kavungo" },
    { mes: 9, dia: 27, titulo: "Erês e Vunji", texto: "Caruru de Cosme e Damião.", ent: "eres" },
  ];

  function proximaData(f, hoje) {
    const dia = f.dia || 1;
    let d = new Date(hoje.getFullYear(), f.mes - 1, dia);
    const fimDoMes = new Date(hoje.getFullYear(), f.mes, 0);
    if ((f.dia ? d : fimDoMes) < hoje) d = new Date(hoje.getFullYear() + 1, f.mes - 1, dia);
    return d;
  }

  function festasOrdenadas() {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    return [...CASA.festas.map((f) => ({ ...f, daCasa: true })), ...DATAS_GERAIS]
      .map((f) => ({ ...f, data: proximaData(f, hoje), dias: Math.round((proximaData(f, hoje) - hoje) / 864e5) }))
      .sort((a, b) => a.data - b.data);
  }

  function linhaFesta(f) {
    const quando = f.dia ? `${f.dia} de ${MESES[f.mes - 1]}` : `Mês de ${MESES[f.mes - 1]}`;
    const falta = f.dia ? (f.dias === 0 ? "É hoje!" : `Faltam ${f.dias} dias`) : "";
    const link = f.id ? `#/inkices/${f.id}` : f.ent ? `#/entidades/${f.ent}` : null;
    const dentro = `<span class="data"><b>${f.dia || "&#9679;"}</b><small>${MESES[f.mes - 1].slice(0, 3)}</small></span>
      <span class="festa-txt"><strong>${esc(f.titulo)}</strong>${f.daCasa ? ' <em class="selo">Nossa casa</em>' : ""}
      <small>${esc(quando)}${falta ? " · " + falta : ""}</small><span>${esc(f.texto)}</span></span>`;
    return link ? `<a class="festa${f.daCasa ? " da-casa" : ""}" href="${link}">${dentro}</a>`
      : `<div class="festa${f.daCasa ? " da-casa" : ""}">${dentro}</div>`;
  }

  /* ---------- Telas ---------- */
  const telas = {
    inicio() {
      const prox = festasOrdenadas()[0];
      const textoCasa = [CASA.nome, CASA.nacao, ...CASA.historia.filter((p) => !p.startsWith("Espaço reservado"))].join(". ");
      return `<section class="hero">
          <div class="folhagem" aria-hidden="true"></div>
          <img class="logo" src="${temLogo ? CASA.logo : "img/icone.svg"}" alt="Logomarca do ${esc(CASA.nome)}">
          <p class="nacao">${esc(CASA.nacao)}</p>
          <h1>${esc(CASA.nome)}</h1>
          <p class="anos"><b>${CASA.anosDeFeitura}</b> anos de axé com ${esc(CASA.sacerdote)}</p>
          ${botaoOuvir("Nossa casa", textoCasa, "casa", "Ouvir a história da casa")}
        </section>

        <section class="bloco">
          <h2>Donos da cabeça do ${esc(CASA.sacerdote)}</h2>
          <div class="donos">
            ${CASA.donosDaCabeca.map((d) => {
              const ink = INKICES.find((i) => i.id === d.id);
              return `<a class="dono" href="#/inkices/${d.id}" style="--c1:${cor(ink)};--c2:${cor2(ink)}">
                <strong>${esc(d.angola)}</strong><small>${esc(d.ketu)}</small></a>`;
            }).join("")}
          </div>
        </section>

        ${prox ? `<section class="bloco"><h2>Próxima data</h2>${linhaFesta(prox)}</section>` : ""}

        <section class="bloco">
          <h2>Conheça</h2>
          <div class="atalhos">
            <a href="#/inkices"><span>&#10024;</span>Inkices</a>
            <a href="#/entidades/caboclos"><span>&#127993;</span>Caboclos</a>
            <a href="#/entidades/eres"><span>&#127880;</span>Erês e Ibejis</a>
            <a href="#/entidades/pretos-velhos"><span>&#128255;</span>Pretos-Velhos</a>
            <a href="#/casa"><span>&#127968;</span>Nossa casa</a>
            <a href="#/nacao"><span>&#127757;</span>Nação Angola</a>
          </div>
        </section>`;
    },

    casa() {
      const cab = CASA.caboclosDaCasa.length
        ? CASA.caboclosDaCasa.map((c) => `<div class="caixa"><h3>${esc(c.nome)}</h3><p>${esc(c.texto)}</p>${botaoOuvir(c.nome, c.nome + ". " + c.texto)}</div>`).join("")
        : `<p class="aviso">Em breve: os caboclos que estão à frente da nossa casa, com as suas histórias contadas pelos mais velhos.</p>`;
      return `<article class="detalhe">
        <header class="capa" style="--c1:#1e3a22;--c2:#6d3b1f"><div class="folhagem" aria-hidden="true"></div>
          <h1>Nossa casa</h1><p class="ketu">${esc(CASA.nome)} · ${esc(CASA.nacao)}</p></header>
        <div class="acoes">${botaoOuvir("Nossa casa", CASA.historia.join(" "), "casa", "Ouvir")}</div>
        <section><h2>História</h2>${CASA.historia.map((p) => `<p>${esc(p)}</p>`).join("")}</section>
        <section><h2>Zelador</h2><dl class="ficha">
          <div><dt>Nome</dt><dd>${esc(CASA.sacerdote)}</dd></div>
          <div><dt>Cargo</dt><dd>${esc(CASA.titulo)}</dd></div>
          <div><dt>Tempo de feitura</dt><dd>${CASA.anosDeFeitura} anos</dd></div>
          <div><dt>Donos da cabeça</dt><dd>${CASA.donosDaCabeca.map((d) => `<a href="#/inkices/${d.id}">${esc(d.angola)} (${esc(d.ketu)})</a>`).join(" e ")}</dd></div>
        </dl><p>${esc(CASA.regencia)}</p></section>
        <section><h2>Caboclos da casa</h2>${cab}</section>
      </article>`;
    },

    inkices() {
      return `<section class="bloco">
        <h1>Inkices</h1>
        <p>As divindades da nação Angola-Congo, com o nome correspondente no Ketu, que é como muitas vezes chamamos na casa.</p>
        <label class="busca"><span class="sr">Buscar</span>
          <input type="search" id="busca" placeholder="Buscar: Oxóssi, Matamba, sábado, mel..." autocomplete="off"></label>
        <div class="lista" id="lista">${INKICES.map((i) => cartao(i, "#/inkices/" + i.id)).join("")}</div>
      </section>`;
    },

    entidades() {
      return `<section class="bloco">
        <h1>Guias e entidades</h1>
        <p>Os que vêm à terra para conversar, aconselhar e cuidar da comunidade.</p>
        <div class="lista">${ENTIDADES.map((e) => cartao(e, "#/entidades/" + e.id)).join("")}</div>
      </section>`;
    },

    calendario() {
      return `<section class="bloco">
        <h1>Festas e datas</h1>
        <p>As festas da nossa casa e as datas que muitas casas de Angola celebram, da mais próxima para a mais distante.</p>
        <div class="festas">${festasOrdenadas().map(linhaFesta).join("")}</div>
        <p class="aviso">As datas das festas da casa são confirmadas pelo Pai Adilson a cada ano.</p>
      </section>`;
    },

    mais() {
      return `<section class="bloco">
        <h1>Saber mais</h1>
        <div class="atalhos">
          <a href="#/nacao"><span>&#127757;</span>A nação Angola</a>
          <a href="#/glossario"><span>&#128172;</span>Palavras da Angola</a>
          <a href="#/casa"><span>&#127968;</span>Nossa casa</a>
          <a href="#/sobre"><span>&#9881;</span>Ajustes e ajuda</a>
        </div>
      </section>`;
    },

    nacao() {
      return `<section class="bloco">
        <h1>A nação Angola</h1>
        ${NACAO.map((s, i) => `<div class="caixa"><h2>${esc(s.titulo)}</h2>
          ${s.texto.map((p) => `<p>${esc(p)}</p>`).join("")}
          ${botaoOuvir(s.titulo, s.titulo + ". " + s.texto.join(" "), "nacao-" + (i + 1))}</div>`).join("")}
      </section>`;
    },

    glossario() {
      return `<section class="bloco">
        <h1>Palavras da Angola</h1>
        <p>Algumas palavras de origem banto (quimbundo e quicongo) usadas nas casas de Angola. A pronúncia e o uso podem mudar de casa para casa.</p>
        <dl class="glossario">${GLOSSARIO.map(([t, d]) => `<div><dt>${esc(t)} ${botaoOuvir(t, t + ". " + d, null, "")}</dt><dd>${esc(d)}</dd></div>`).join("")}</dl>
      </section>`;
    },

    sobre() {
      return `<section class="bloco">
        <h1>Ajustes e ajuda</h1>
        <div class="caixa">
          <h2>Velocidade da voz</h2>
          <input type="range" id="vel" min="0.6" max="1.3" step="0.05" value="${prefs.velocidade}" aria-label="Velocidade da voz">
          <p><span id="vel-txt"></span></p>
          ${botaoOuvir("Teste", "Kiuá! Este é um teste da voz do aplicativo do Terreiro de Caboclos e Guias.", null, "Testar voz")}
        </div>
        <div class="caixa">
          <h2>Tamanho da letra</h2>
          <p>Use os botões <b>A−</b> e <b>A+</b> no alto da tela.</p>
        </div>
        <div class="caixa">
          <h2>Instalar no celular</h2>
          <p><b>Android (Chrome):</b> toque nos três pontinhos e depois em "Adicionar à tela inicial".</p>
          <p><b>iPhone (Safari):</b> toque no botão de compartilhar e depois em "Adicionar à Tela de Início".</p>
          <p>Depois de aberto uma vez, o app funciona mesmo sem internet.</p>
        </div>
        <div class="caixa">
          <h2>Sobre o conteúdo</h2>
          <p>Os textos foram reunidos a partir da tradição oral e de estudos sobre o candomblé de Angola. Cada casa tem os seus fundamentos, e a palavra final é sempre do Tata e dos mais velhos.</p>
        </div>
      </section>`;
    },
  };

  /* ---------- Navegação ---------- */
  function rota() {
    const partes = (location.hash.replace(/^#\/?/, "") || "").split("/");
    const [secao, id] = partes;
    let html;
    let aba = secao || "inicio";

    if (secao === "inkices" && id) {
      const item = INKICES.find((i) => i.id === id);
      html = item ? detalhe(item, INKICES, "#/inkices") : null;
    } else if (secao === "entidades" && id) {
      const item = ENTIDADES.find((i) => i.id === id);
      html = item ? detalhe(item, ENTIDADES, "#/entidades") : null;
    } else if (telas[aba]) {
      html = telas[aba]();
    }
    if (!html) { aba = "inicio"; html = telas.inicio(); }
    if (["casa", "nacao", "glossario", "sobre"].includes(aba)) aba = aba === "casa" ? "inicio" : "mais";

    app.innerHTML = html;
    document.querySelectorAll(".abas a").forEach((a) => a.classList.toggle("ativa", a.dataset.aba === aba));
    $("#voltar").hidden = !secao || (!id && ["inkices", "entidades", "calendario", "mais"].includes(secao));
    window.scrollTo(0, 0);
    ligarEventos();
  }

  function ligarEventos() {
    const busca = $("#busca");
    if (busca) {
      const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
      busca.oninput = () => {
        const q = norm(busca.value.trim());
        const achados = INKICES.filter((i) => !q || norm(JSON.stringify(i)).includes(q));
        $("#lista").innerHTML = achados.length
          ? achados.map((i) => cartao(i, "#/inkices/" + i.id)).join("")
          : `<p class="aviso">Nada encontrado para "${esc(busca.value)}".</p>`;
      };
    }
    const vel = $("#vel");
    if (vel) {
      const rotulo = () => { $("#vel-txt").textContent = vel.value < 0.85 ? "Bem devagar" : vel.value < 1 ? "Devagar" : vel.value < 1.15 ? "Normal" : "Rápida"; };
      rotulo();
      vel.oninput = () => { prefs.velocidade = +vel.value; salvarPrefs(); rotulo(); };
    }
  }

  $("#voltar").onclick = () => history.back();
  window.addEventListener("hashchange", rota);
  rota();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
