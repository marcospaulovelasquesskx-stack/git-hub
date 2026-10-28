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
    if (item.linha) p.push(`Linha: ${item.linha}.`);
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

  /* ---------- Cantigas ---------- */
  const cantigasDe = (id) => (window.CANTIGAS && CANTIGAS[id]) || [];

  // Busca a melodia no YouTube pelo começo da letra e pelo nome do inkice.
  function linkMelodia(c, grupo) {
    const comeco = c.letra.split("\n")[0].replace(/\((\^|bis|BIS)\)|[(),]/g, " ").split(/\s+/).filter(Boolean).slice(0, 7).join(" ");
    const busca = `${comeco} ${grupo || ""} cantiga angola`.replace(/\s+/g, " ").trim();
    return `<a class="link-melodia" href="https://www.youtube.com/results?search_query=${encodeURIComponent(busca)}" target="_blank" rel="noopener">&#9654; Procurar a melodia no YouTube</a>`;
  }

  function cartaoCantiga(c, grupo) {
    return `<div class="cantiga${c.casa ? " da-casa" : ""}">
      ${c.titulo ? `<h3>${esc(c.titulo)}</h3>` : ""}
      ${c.casa ? '<em class="selo">Cantada na nossa casa</em>' : ""}
      <p class="letra">${esc(c.letra).replace(/\n/g, "<br>")}</p>
      ${c.nota ? `<p class="cantiga-nota">${esc(c.nota)}</p>` : ""}
      ${linkMelodia(c, grupo)}
    </div>`;
  }

  function blocoCantigas(item) {
    const proprias = (item.cantigas || []).map((c) => ({ ...c, casa: true }));
    const lista = [...proprias, ...cantigasDe(item.id)];
    if (!lista.length) {
      return `<p>Os cânticos são ensinados na casa, de boca a ouvido, pelos mais velhos. Este espaço é para as letras e as gravações do próprio terreiro.</p>`;
    }
    const casa = lista.filter((c) => c.casa);
    const outras = lista.filter((c) => !c.casa);
    return `${casa.length ? casa.map((c) => cartaoCantiga(c, item.nome)).join("") : `<p>Ainda não marcamos quais destas cantigas são cantadas na nossa casa.</p>`}
      ${outras.length ? `<details class="mais-cantigas"${casa.length ? "" : " open"}>
        <summary>${casa.length ? "Mais" : "Ver as"} ${outras.length} cantigas da coletânea de Angola</summary>
        <p class="aviso">Da coletânea "Cantigas de Angola". Ainda não confirmadas como cantadas na nossa casa.</p>
        ${outras.map((c) => cartaoCantiga(c, item.nome)).join("")}
      </details>` : ""}`;
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
        ${item.linha ? `<p class="ketu">${esc(item.linha)}</p>` : ""}
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

      ${(item.secoes || []).map((sec) => `<section>
        <h2>${esc(sec.titulo)}</h2>
        ${sec.texto ? `<p>${esc(sec.texto)}</p>` : ""}
        <dl class="ficha">${sec.itens.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join("")}</dl>
      </section>`).join("")}

      <section class="cantigas">
        <h2>Cânticos</h2>
        ${blocoCantigas(item)}
        ${botaoOuvir("Cântico de " + item.nome, "Ainda não há cântico gravado para " + item.nome + ". Peça aos mais velhos da casa.", item.id + "-cantiga", "Ouvir gravação da casa")}
      </section>

      <p class="aviso">Cada casa de Angola tem os seus fundamentos. Confira sempre com o Tata e os mais velhos.</p>

      <nav class="vizinhos">
        ${ant ? `<a href="${base}/${ant.id}">&#8249; ${esc(ant.nome)}</a>` : "<span></span>"}
        ${prox ? `<a href="${base}/${prox.id}">${esc(prox.nome)} &#8250;</a>` : "<span></span>"}
      </nav>
    </article>`;
  }

  /* ---------- Calendário ---------- */
  // As festas da casa são marcadas por mês: o dia muda a cada ano, o mês não.
  const mesesAte = (mes, hoje) => (mes - 1 - hoje.getMonth() + 12) % 12;

  function festasOrdenadas() {
    const hoje = new Date();
    return CASA.festas
      .map((f) => ({ ...f, faltam: mesesAte(f.mes, hoje) }))
      .sort((a, b) => a.faltam - b.faltam);
  }

  function quandoFesta(f) {
    if (f.faltam === 0) return "É neste mês!";
    if (f.faltam === 1) return "No mês que vem";
    return `Daqui a ${f.faltam} meses`;
  }

  function linhaFesta(f) {
    const link = f.id ? `#/inkices/${f.id}` : f.cab ? "#/caboclos" : null;
    const dentro = `<span class="data"><b>${MESES[f.mes - 1].slice(0, 3)}</b></span>
      <span class="festa-txt"><strong>${esc(f.titulo)}</strong>${f.principal ? ' <em class="selo">Principal festa da casa</em>' : ""}
      <small>${esc(MESES[f.mes - 1][0].toUpperCase() + MESES[f.mes - 1].slice(1))} · ${quandoFesta(f)}</small><span>${esc(f.texto)}</span></span>`;
    const cls = `festa${f.principal ? " principal" : ""}${f.faltam === 0 ? " agora" : ""}`;
    return link ? `<a class="${cls}" href="${link}">${dentro}</a>` : `<div class="${cls}">${dentro}</div>`;
  }

  function anoDeFestas() {
    const hoje = new Date();
    return MESES.map((nome, i) => {
      const doMes = CASA.festas.filter((f) => f.mes === i + 1).map((f) => ({ ...f, faltam: mesesAte(f.mes, hoje) }));
      const datas = CASA.datas.filter((d) => d.mes === i + 1);
      const atual = i === hoje.getMonth();
      return `<section class="mes${atual ? " atual" : ""}${doMes.length ? "" : " vazio"}">
        <h2>${nome[0].toUpperCase() + nome.slice(1)}${atual ? ' <em class="selo">Este mês</em>' : ""}</h2>
        ${doMes.length ? doMes.map(linhaFesta).join("") : '<p class="sem-festa">Sem festa neste mês</p>'}
        ${datas.map((d) => `<p class="data-lembrada">${d.dia} de ${nome}: ${esc(d.titulo)}. ${esc(d.texto)}</p>`).join("")}
      </section>`;
    }).join("");
  }

  /* ---------- Inkice do dia ---------- */
  const acharItem = (id) => {
    const ink = INKICES.find((i) => i.id === id);
    if (ink) return { item: ink, href: "#/inkices/" + id };
    const cab = CABOCLOS.find((c) => c.id === id);
    return cab ? { item: cab, href: "#/caboclos/" + id } : null;
  };

  function cartaoDoDia(d) {
    const hoje = new Date().getDay();
    const dia = DIAS_DA_SEMANA[d];
    const { item, href } = acharItem(dia.principal);
    const outros = dia.tambem.map(acharItem).filter(Boolean);
    const chamada = d === hoje ? `Hoje é ${dia.nome}` : `${dia.nome[0].toUpperCase() + dia.nome.slice(1)}`;
    const falado = `${chamada}, dia de ${item.nome}${item.ketu ? `, que no Ketu é ${item.ketu}` : ""}. ` + textoParaOuvir(item);
    return `<div class="dia-cartao" style="--c1:${cor(item)};--c2:${cor2(item)}">
        <div class="dia-capa">
          <div class="folhagem" aria-hidden="true"></div>
          <p class="dia-chamada">${esc(chamada)}, dia de</p>
          <h2>${esc(item.nome)}</h2>
          ${item.ketu ? `<p class="dia-ketu">No Ketu: <b>${esc(item.ketu)}</b></p>` : ""}
          <ul class="dia-cores" aria-label="Cores">${item.cores.map(([n, c]) => `<li><span style="background:${c}"></span>${esc(n)}</li>`).join("")}</ul>
        </div>
        <div class="dia-corpo">
          <p class="dia-resumo">${esc(item.resumo)}</p>
          <p class="dia-saudacao"><b>Saudação:</b> ${esc(item.saudacao)}</p>
          <dl class="dia-ficha">
            <div><dt>Folhas</dt><dd>${esc(lista(item.folhas.slice(0, 4)))}</dd></div>
            <div><dt>Oferendas</dt><dd>${esc(lista(item.oferendas.slice(0, 4)))}</dd></div>
          </dl>
          <div class="acoes-lista">
            ${botaoOuvir(`${item.nome}, ${dia.nome}`, falado, item.id, "Ouvir tudo")}
            <a class="botao" href="${href}">História, cânticos e tudo sobre ${esc(item.nome)} &#8250;</a>
          </div>
          ${outros.length ? `<p class="dia-tambem">Também neste dia: ${outros.map((o) => `<a href="${o.href}">${esc(o.item.nome)}${o.item.ketu ? ` (${esc(o.item.ketu)})` : ""}</a>`).join(", ")}</p>` : ""}
        </div>
      </div>`;
  }

  function semanaDoDia(d) {
    const hoje = new Date().getDay();
    return `<div class="dias" role="group" aria-label="Ver outro dia da semana">${DIAS_DA_SEMANA.map((dia, i) =>
      `<button class="dia-chip${i === d ? " ativo" : ""}${i === hoje ? " hoje" : ""}" data-dia="${i}" aria-pressed="${i === d}">${dia.nome.slice(0, 3)}</button>`).join("")}</div>`;
  }

  /* ---------- Telas ---------- */
  const telas = {
    inicio() {
      const prox = festasOrdenadas()[0];
      const textoCasa = [CASA.nome, CASA.nacao, ...CASA.historia.filter((p) => !p.startsWith("Espaço reservado"))].join(". ");
      return `<section class="hero">
          <div class="folhagem" aria-hidden="true"></div>
          <img class="logo" src="${CASA.logo}" alt="Brasão do ${esc(CASA.nome)}">
          <p class="nacao">${esc(CASA.nacao)}</p>
          <h1>${esc(CASA.nome)}</h1>
          <div class="marcos">
            <p><b>${CASA.fundacao}</b><span>fundação da casa</span></p>
            <p><b>${CASA.anosDeFeitura}</b><span>anos de feitura de ${esc(CASA.sacerdote)}</span></p>
          </div>
          ${botaoOuvir("Nossa casa", textoCasa, "casa", "Ouvir a história da casa")}
          ${CASA.versao ? `<p class="versao">${esc(CASA.versao)} · app em construção</p>` : ""}
        </section>

        <section class="bloco do-dia" id="do-dia">
          ${cartaoDoDia(new Date().getDay())}
          ${semanaDoDia(new Date().getDay())}
        </section>

        <section class="bloco">
          <h2>Nossos pais caboclos</h2>
          <div class="lista">${CABOCLOS.filter((c) => ["Nosso pai maior", "Pai da casa"].includes(c.destaque)).map((c) => cartao(c, "#/caboclos/" + c.id)).join("")}</div>
          <p><a class="mais-link" href="#/caboclos">Ver todos os caboclos da casa &#8250;</a></p>
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

        ${prox ? `<section class="bloco"><h2>Próxima festa da casa</h2>${linhaFesta(prox)}</section>` : ""}

        <section class="bloco">
          <h2>Nossa casa em festa</h2>
          <div class="faixa-fotos">${GALERIA.slice(0, 6).map((g, i) => `<button class="foto" data-foto="${i}"><img src="${g.foto}" alt="${esc(g.legenda)}" loading="lazy"></button>`).join("")}</div>
          <p><a class="mais-link" href="#/galeria">Ver todas as fotos &#8250;</a></p>
        </section>

        <section class="bloco">
          <h2>Conheça</h2>
          <div class="atalhos">
            <a href="#/inkices"><span>&#10024;</span>Inkices</a>
            <a href="#/comparativo"><span>&#8646;</span>Angola e Ketu</a>
            <a href="#/aprender"><span>&#127919;</span>Aprenda os nomes</a>
            <a href="#/caboclos"><span>&#127993;</span>Caboclos da casa</a>
            <a href="#/entidades/eres"><span>&#127880;</span>Erês e Ibejis</a>
            <a href="#/entidades/pretos-velhos"><span>&#128255;</span>Pretos-Velhos</a>
            <a href="#/casa"><span>&#127968;</span>Nossa casa</a>
            <a href="#/galeria"><span>&#128247;</span>Fotos da casa</a>
            <a href="#/nacao"><span>&#127757;</span>Nação Angola</a>
          </div>
        </section>`;
    },

    galeria() {
      return `<section class="bloco">
        <h1>Fotos da casa</h1>
        <p>Festas, cortejos e a Festa das Águas do ${esc(CASA.nome)}. Toque numa foto para ver maior.</p>
        <div class="galeria">${GALERIA.map((g, i) => `<figure><button class="foto" data-foto="${i}"><img src="${g.foto}" alt="${esc(g.legenda)}" loading="lazy"></button><figcaption>${esc(g.legenda)}</figcaption></figure>`).join("")}</div>
      </section>`;
    },

    casa() {
      const cab = `<div class="lista">${CABOCLOS.map((c) => cartao(c, "#/caboclos/" + c.id)).join("")}</div>`;
      return `<article class="detalhe">
        <header class="capa" style="--c1:#0b5a24;--c2:#1f8a3a"><div class="folhagem" aria-hidden="true"></div>
          <h1>Nossa casa</h1><p class="ketu">${esc(CASA.nome)} · ${esc(CASA.nacao)}</p></header>
        <div class="acoes">${botaoOuvir("Nossa casa", CASA.historia.join(" "), "casa", "Ouvir")}</div>
        <section><h2>História</h2>${CASA.historia.map((p) => `<p>${esc(p)}</p>`).join("")}</section>
        <section><h2>Zelador</h2><dl class="ficha">
          <div><dt>Nome</dt><dd>${esc(CASA.sacerdote)}</dd></div>
          <div><dt>Cargo</dt><dd>${esc(CASA.titulo)}</dd></div>
          <div><dt>Fundação da casa</dt><dd>${CASA.fundacao}</dd></div>
          <div><dt>Tempo de feitura</dt><dd>${CASA.anosDeFeitura} anos</dd></div>
          <div><dt>Donos da cabeça</dt><dd>${CASA.donosDaCabeca.map((d) => `<a href="#/inkices/${d.id}">${esc(d.angola)} (${esc(d.ketu)})</a>`).join(" e ")}</dd></div>
        </dl><p>${esc(CASA.regencia)}</p></section>
        <section><h2>Caboclos da casa</h2>${cab}</section>
        <section><h2>Fotos</h2><p><a class="botao" href="#/galeria">&#128247; Ver as fotos da casa</a></p></section>
      </article>`;
    },

    inkices() {
      return `<section class="bloco">
        <h1>Inkices</h1>
        <p>As divindades da nação Angola-Congo, com o nome correspondente no Ketu, que é como muitas vezes chamamos na casa.</p>
        <div class="acoes-lista">
          <a class="botao" href="#/comparativo">&#8646; Tabela Angola e Ketu</a>
          <a class="botao" href="#/aprender">&#127919; Aprenda os nomes</a>
          <a class="botao" href="#/cantigas">&#127926; Cantigas</a>
        </div>
        <label class="busca"><span class="sr">Buscar</span>
          <input type="search" id="busca" placeholder="Buscar: Oxóssi, Matamba, sábado, mel..." autocomplete="off"></label>
        <div class="lista" id="lista">${INKICES.map((i) => cartao(i, "#/inkices/" + i.id)).join("")}</div>
      </section>`;
    },

    comparativo() {
      const falado = "Tabela comparativa entre Angola e Ketu. " +
        COMPARATIVO.map(([dom, ang, ket]) => `${ket}, no Ketu, na nossa nação Angola é ${ang.replace(" / ", " ou ")}. Domínio: ${dom}.`).join(" ");
      return `<section class="bloco">
        <h1>Angola e Ketu</h1>
        <p>Nkisis e orixás têm o mesmo papel no mundo, mas vêm de raízes diferentes: os nkisis são bantos, da nação Angola; os orixás são iorubás, da nação Ketu. Para chamar cada força pelo nome da nossa nação, veja abaixo o nome em Angola e o nome que se usa no Ketu.</p>
        <div class="acoes-lista">${botaoOuvir("Angola e Ketu", falado, "comparativo", "Ouvir a tabela")}
          <a class="botao" href="#/aprender">&#127919; Aprenda os nomes</a></div>
        <div class="comparativo">
          <div class="comp-cabeca" aria-hidden="true"><span>Na Angola (nkisi)</span><span>No Ketu (orixá)</span></div>
          ${COMPARATIVO.map(([dom, ang, ket, id]) => `<a class="comp-linha" href="#/inkices/${id}">
            <small class="comp-dom">${esc(dom)}</small>
            <strong class="comp-ang">${esc(ang)}</strong>
            <span class="comp-ket"><span class="sr">No Ketu: </span>${esc(ket)}</span>
          </a>`).join("")}
        </div>
        <p class="aviso">Na Angola, os caboclos também fazem parte da base do terreiro, cultuados junto com os nkisis como ancestralidade da terra brasileira. <a href="#/nacao">Leia mais sobre a nação Angola.</a></p>
      </section>`;
    },

    aprender() {
      return `<section class="bloco">
        <h1>Aprenda os nomes</h1>
        <p>Aparece o nome usado no Ketu. Toque no nome certo da nossa nação Angola.</p>
        <div id="quiz" class="caixa quiz"></div>
      </section>`;
    },

    entidades() {
      return `<section class="bloco">
        <h1>Caboclos da casa</h1>
        <p>Os caboclos que estão à frente do ${esc(CASA.nome)}. Toque em um caboclo para ler e ouvir a sua história.</p>
        <div class="lista">${CABOCLOS.map((c) => cartao(c, "#/caboclos/" + c.id)).join("")}</div>
      </section>
      <section class="bloco">
        <h2>Guias e entidades</h2>
        <p>Quem são os caboclos, os erês e os pretos-velhos, e como são cultuados nas casas de Angola.</p>
        <div class="lista">${ENTIDADES.map((e) => cartao(e, "#/entidades/" + e.id)).join("")}</div>
      </section>`;
    },

    calendario() {
      const falado = "Calendário de festas da casa. " + CASA.festas.map((f) => `Em ${MESES[f.mes - 1]}: ${f.titulo}.`).join(" ");
      return `<section class="bloco">
        <h1>Festas da casa</h1>
        <p>As festas do ${esc(CASA.nome)} ao longo do ano. O dia muda a cada ano e é confirmado pelo Pai Adilson; o mês é sempre o mesmo.</p>
        <div class="acoes-lista">${botaoOuvir("Festas da casa", falado, "calendario", "Ouvir o calendário")}</div>
        <div class="ano">${anoDeFestas()}</div>
      </section>`;
    },

    mais() {
      return `<section class="bloco">
        <h1>Saber mais</h1>
        <div class="atalhos">
          <a href="#/nacao"><span>&#127757;</span>A nação Angola</a>
          <a href="#/dicionario"><span>&#128172;</span>Dicionário Angola-Congo</a>
          <a href="#/cantigas"><span>&#127926;</span>Cantigas de Angola</a>
          <a href="#/aprender-cantigas"><span>&#127891;</span>Aprender cantigas</a>
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
          ${s.fonte ? `<p class="fonte">Fonte: ${esc(s.fonte)}</p>` : ""}
          ${botaoOuvir(s.titulo, s.titulo + ". " + s.texto.join(" "), "nacao-" + (i + 1))}</div>`).join("")}
      </section>`;
    },

    dicionario() {
      return `<section class="bloco">
        <h1>Dicionário Angola-Congo</h1>
        <p>${DICIONARIO.length} palavras de origem banto (kimbundu e kikongo) usadas no dia a dia das casas de Angola. A pronúncia e o uso podem mudar de casa para casa.</p>
        <label class="busca"><span class="sr">Buscar palavra</span>
          <input type="search" id="busca-dic" placeholder="Buscar: água, mãe, ngoma, feijão..." autocomplete="off"></label>
        <div class="filtros" role="group" aria-label="Assunto">
          <button class="filtro ativo" data-cat="">Todas</button>
          ${Object.entries(ASSUNTOS).map(([k, v]) => `<button class="filtro" data-cat="${k}">${esc(v)}</button>`).join("")}
        </div>
        <p class="contagem" id="dic-contagem" aria-live="polite"></p>
        <dl class="glossario" id="dic-lista"></dl>
        <p class="aviso">As palavras marcadas com &#9670; vêm do vocabulário bantu do Unzó Maiala, publicado na cartilha "Nação Angola: das influências banto no Brasil".</p>
      </section>`;
    },

    "aprender-cantigas"() {
      const opcoes = INKICES.filter((i) => cantigasDe(i.id).length).map((i) => `<option value="${i.id}">${esc(i.nome)} (${esc(i.ketu.split(" (")[0])})</option>`).join("");
      return `<section class="bloco">
        <h1>Aprender cantigas</h1>
        <p>Uma cantiga de cada vez. Leia a letra, procure a melodia, cante junto e marque quando aprender. O que você marcar fica guardado neste aparelho.</p>
        <div class="caixa aprender-filtros">
          <label for="ap-modo">Quais cantigas</label>
          <select id="ap-modo">
            <option value="novas">Novas para aprender (ainda não cantadas na casa)</option>
            <option value="casa">As cantadas na nossa casa (para revisar)</option>
            <option value="todas">Todas</option>
          </select>
          <label for="ap-inkice">De qual inkice</label>
          <select id="ap-inkice"><option value="">Todos os inkices</option>${opcoes}</select>
        </div>
        <p class="contagem" id="ap-progresso" aria-live="polite"></p>
        <div id="ap-cartao"></div>
      </section>`;
    },

    cantigas() {
      const nomes = { pemba: "Pemba e rezas da casa", lugano: "Mina Lugano (Obá)", aganji: "Mina Aganji (Ewá)" };
      const ordem = [...INKICES.map((i) => i.id), "lugano", "aganji", "pemba"].filter((id) => cantigasDe(id).length);
      const total = ordem.reduce((n, id) => n + cantigasDe(id).length, 0);
      const daCasa = ordem.reduce((n, id) => n + cantigasDe(id).filter((c) => c.casa).length, 0);
      return `<section class="bloco">
        <h1>Cantigas de Angola</h1>
        <p>${total} cantigas da coletânea "Cantigas de Angola", separadas por inkice. As ${daCasa} marcadas como <b>cantadas na nossa casa</b> aparecem primeiro.</p>
        <div class="acoes-lista">
          <a class="botao" href="#/aprender-cantigas">&#127891; Aprender cantigas novas</a>
          <button class="botao" id="so-casa" aria-pressed="false">&#9733; Mostrar só as da nossa casa</button>
        </div>
        <p class="aviso">O botão "Procurar a melodia no YouTube" abre uma busca pelo começo da letra. A gravação que aparecer pode ser de outra casa, com outra melodia: confira sempre com os ogãs e os mais velhos.</p>
        <label class="busca"><span class="sr">Buscar na letra</span>
          <input type="search" id="busca-cantiga" placeholder="Buscar na letra: Matamba, Kitembu, pemba..." autocomplete="off"></label>
        <div id="lista-cantigas">
        ${ordem.map((id) => {
          const ink = INKICES.find((i) => i.id === id);
          const titulo = ink ? `${ink.nome} (${ink.ketu.split(" (")[0]})` : nomes[id];
          return `<section class="grupo-cantigas" data-grupo="${id}">
            <h2>${esc(titulo)}</h2>
            ${ink ? `<p><a class="mais-link" href="#/inkices/${id}">Ver a página de ${esc(ink.nome)} &#8250;</a></p>` : ""}
            ${cantigasDe(id).map((c) => cartaoCantiga(c, ink ? ink.nome : nomes[id])).join("")}
          </section>`;
        }).join("")}
        </div>
      </section>`;
    },

    sobre() {
      return `<section class="bloco">
        <h1>Ajustes e ajuda</h1>
        <div class="caixa">
          <h2>Velocidade da voz</h2>
          <input type="range" id="vel" min="0.6" max="1.3" step="0.05" value="${prefs.velocidade}" aria-label="Velocidade da voz">
          <p><span id="vel-txt"></span></p>
          ${botaoOuvir("Teste", "Kiuá! Este é um teste da voz do aplicativo do Centro do Caboclo Sete Flechas.", null, "Testar voz")}
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
        <div class="caixa">
          <h2>Fontes</h2>
          <p><b>Cartilha "Nação Angola: das influências banto no Brasil"</b>, Coleção Saberes Pretos, KOINONIA, 2022. Redação de Mameto Laura Borges (Unzó Maiala, Salvador) e Mameto Kuangolô (Unzó Mean Dandalunda, Tombensi Filho). Licença Creative Commons BY-NC-SA 4.0. Usada no vocabulário, nos nomes dos nkisis, nos guardiões dos caminhos e na seção sobre a nação Angola.</p>
          <p><b>"Cantigas de Angola: Coletânea de Cânticos Litúrgicos dos Inquices"</b>. As cantigas cantadas na nossa casa foram marcadas pelos filhos da casa.</p>
        </div>
      </section>`;
    },
  };

  /* ---------- Navegação ---------- */
  function rota() {
    const partes = (location.hash.replace(/^#\/?/, "") || "").split("/");
    const [secao, id] = partes;
    let html;
    let aba = secao === "glossario" ? "dicionario" : secao || "inicio"; // endereço antigo do glossário

    if (secao === "inkices" && id) {
      const item = INKICES.find((i) => i.id === id);
      html = item ? detalhe(item, INKICES, "#/inkices") : null;
    } else if (secao === "caboclos" && id) {
      const item = CABOCLOS.find((i) => i.id === id);
      html = item ? detalhe(item, CABOCLOS, "#/caboclos") : null;
      aba = "entidades";
    } else if (secao === "caboclos") {
      html = telas.entidades();
      aba = "entidades";
    } else if (secao === "entidades" && id) {
      const item = ENTIDADES.find((i) => i.id === id);
      html = item ? detalhe(item, ENTIDADES, "#/entidades") : null;
    } else if (telas[aba]) {
      html = telas[aba]();
    }
    if (!html) { aba = "inicio"; html = telas.inicio(); }
    if (["comparativo", "aprender"].includes(aba)) aba = "inkices";
    if (aba === "aprender-cantigas") aba = "mais";
    if (aba === "galeria") aba = "inicio";
    if (["casa", "nacao", "dicionario", "cantigas", "sobre"].includes(aba)) aba = aba === "casa" ? "inicio" : "mais";

    app.innerHTML = html;
    document.querySelectorAll(".abas a").forEach((a) => a.classList.toggle("ativa", a.dataset.aba === aba));
    $("#voltar").hidden = !secao || (!id && ["inkices", "entidades", "caboclos", "calendario", "mais"].includes(secao));
    window.scrollTo(0, 0);
    ligarEventos();
  }

  /* ---------- Exercício: do nome do Ketu para o nome em Angola ---------- */
  const quiz = { acertos: 0, feitas: 0, atual: null };
  const embaralhar = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

  function novaPergunta() {
    const el = $("#quiz");
    if (!el) return;
    const certa = COMPARATIVO[Math.floor(Math.random() * COMPARATIVO.length)];
    const erradas = embaralhar(COMPARATIVO.filter((c) => c !== certa)).slice(0, 3);
    quiz.atual = certa;
    el.innerHTML = `<p class="quiz-placar">${quiz.feitas ? `Acertos: <b>${quiz.acertos}</b> de ${quiz.feitas}` : "Vamos começar"}</p>
      <p class="quiz-pergunta">No Ketu se diz <b>${esc(certa[2])}</b>.<br>Na nossa nação Angola, quem é?</p>
      <div class="quiz-opcoes">${embaralhar([certa, ...erradas]).map((c) =>
        `<button class="quiz-op" data-op="${esc(c[3])}">${esc(c[1])}</button>`).join("")}</div>
      <p class="quiz-resposta" id="quiz-resposta" aria-live="polite"></p>`;
    el.querySelectorAll(".quiz-op").forEach((b) => { b.onclick = () => responder(b); });
  }

  function responder(botao) {
    const el = $("#quiz");
    const certa = quiz.atual;
    const acertou = botao.dataset.op === certa[3];
    quiz.feitas++;
    if (acertou) quiz.acertos++;
    el.querySelectorAll(".quiz-op").forEach((b) => {
      b.disabled = true;
      if (b.dataset.op === certa[3]) b.classList.add("certa");
      else if (b === botao) b.classList.add("errada");
    });
    const frase = `${certa[2]}, na Angola, é ${certa[1].replace(" / ", " ou ")}.`;
    $("#quiz-resposta").innerHTML = `<b>${acertou ? "Isso mesmo!" : "Quase!"}</b> ${esc(frase)}
      <span class="quiz-acoes"><button class="ouvir" id="quiz-ouvir">&#128266; Ouvir</button>
      <a class="botao" href="#/inkices/${certa[3]}">Ver a história</a>
      <button class="botao" id="quiz-prox">Próxima &#8250;</button></span>`;
    $("#quiz-ouvir").onclick = () => ouvir("Aprenda os nomes", (acertou ? "Isso mesmo! " : "Quase! ") + frase);
    $("#quiz-prox").onclick = novaPergunta;
    $("#quiz-prox").focus();
  }

  app.addEventListener("click", (e) => {
    const b = e.target.closest("[data-dia]");
    if (!b) return;
    const d = +b.dataset.dia;
    $("#do-dia").innerHTML = cartaoDoDia(d) + semanaDoDia(d);
    $(`#do-dia [data-dia="${d}"]`).focus();
  });

  function ligarDicionario() {
    const lista = $("#dic-lista");
    if (!lista) return;
    const norm = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    let cat = "";
    const desenhar = () => {
      const q = norm($("#busca-dic").value.trim());
      const achados = DICIONARIO
        .filter((d) => (!cat || d.cat === cat) && (!q || norm(d.termo + " " + d.sentido).includes(q)))
        .sort((a, b) => a.termo.localeCompare(b.termo, "pt"));
      $("#dic-contagem").textContent = `${achados.length} ${achados.length === 1 ? "palavra" : "palavras"}`;
      lista.innerHTML = achados.length ? achados.map((d) => `<div>
          <dt>${esc(d.termo)}${d.fonte ? ' <span class="marca-fonte" title="Cartilha Nação Angola">&#9670;</span>' : ""}
            ${botaoOuvir(d.termo, `${d.termo}. ${d.sentido}`, null, "")}</dt>
          <dd>${esc(d.sentido)} <small class="assunto">${esc(ASSUNTOS[d.cat])}</small></dd></div>`).join("")
        : `<p class="aviso">Nenhuma palavra encontrada.</p>`;
    };
    $("#busca-dic").oninput = desenhar;
    document.querySelectorAll(".filtro").forEach((b) => {
      b.onclick = () => {
        cat = b.dataset.cat;
        document.querySelectorAll(".filtro").forEach((x) => x.classList.toggle("ativo", x === b));
        desenhar();
      };
    });
    desenhar();
  }

  function ligarCantigas() {
    const busca = $("#busca-cantiga");
    if (!busca) return;
    const norm = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    let soCasa = false;
    const filtrar = () => {
      const q = norm(busca.value.trim());
      document.querySelectorAll(".grupo-cantigas").forEach((g) => {
        let visiveis = 0;
        g.querySelectorAll(".cantiga").forEach((c) => {
          const ok = (!soCasa || c.classList.contains("da-casa")) && (!q || norm(c.textContent + " " + g.querySelector("h2").textContent).includes(q));
          c.hidden = !ok;
          if (ok) visiveis++;
        });
        g.hidden = !visiveis;
      });
    };
    busca.oninput = filtrar;
    $("#so-casa").onclick = () => {
      soCasa = !soCasa;
      $("#so-casa").setAttribute("aria-pressed", soCasa);
      $("#so-casa").classList.toggle("ativo", soCasa);
      $("#so-casa").innerHTML = soCasa ? "&#9733; Mostrando só as da nossa casa" : "&#9733; Mostrar só as da nossa casa";
      filtrar();
    };
  }

  /* ---------- Aprender cantigas ---------- */
  let aprendidas = {};
  try { aprendidas = JSON.parse(localStorage.getItem("cantigas-aprendidas") || "{}"); } catch (e) { /* sem armazenamento */ }
  const salvarAprendidas = () => { try { localStorage.setItem("cantigas-aprendidas", JSON.stringify(aprendidas)); } catch (e) { /* ignora */ } };

  function ligarAprender() {
    const caixa = $("#ap-cartao");
    if (!caixa) return;
    let pos = 0;
    const listaAtual = () => {
      const modo = $("#ap-modo").value;
      const so = $("#ap-inkice").value;
      return INKICES.filter((i) => !so || i.id === so).flatMap((i) =>
        cantigasDe(i.id).map((c, n) => ({ c, ink: i, chave: `${i.id}-${n}` })))
        .filter(({ c }) => modo === "todas" || (modo === "casa" ? c.casa : !c.casa));
    };
    const desenhar = () => {
      const lista = listaAtual();
      const feitas = lista.filter((x) => aprendidas[x.chave]).length;
      $("#ap-progresso").textContent = lista.length ? `Você já aprendeu ${feitas} de ${lista.length} cantigas desta lista.` : "";
      if (!lista.length) { caixa.innerHTML = '<p class="aviso">Nenhuma cantiga nesta lista.</p>'; return; }
      pos = (pos + lista.length) % lista.length;
      const { c, ink, chave } = lista[pos];
      const sabe = !!aprendidas[chave];
      caixa.innerHTML = `<div class="aprender-cartao" style="--c1:${cor(ink)};--c2:${cor2(ink)}">
          <p class="aprender-de">Cantiga ${pos + 1} de ${lista.length} · <a href="#/inkices/${ink.id}">${esc(ink.nome)}</a></p>
          ${cartaoCantiga(c, ink.nome)}
          ${botaoOuvir(`Cantiga de ${ink.nome}`, "Ainda não há gravação da casa para esta cantiga. Procure a melodia ou peça aos ogãs.", `${chave}-cantiga`, "Ouvir gravação da casa")}
          <button class="botao aprendi${sabe ? " ativo" : ""}" id="ap-sei" aria-pressed="${sabe}">${sabe ? "&#10003; Já aprendi" : "Marcar como aprendida"}</button>
          <div class="aprender-nav">
            <button class="botao" id="ap-ant">&#8249; Anterior</button>
            <button class="botao" id="ap-sorte">Sortear</button>
            <button class="botao" id="ap-prox">Próxima &#8250;</button>
          </div>
        </div>`;
      $("#ap-sei").onclick = () => { if (sabe) delete aprendidas[chave]; else aprendidas[chave] = true; salvarAprendidas(); desenhar(); };
      $("#ap-ant").onclick = () => { pos--; desenhar(); };
      $("#ap-prox").onclick = () => { pos++; desenhar(); };
      $("#ap-sorte").onclick = () => { pos = Math.floor(Math.random() * lista.length); desenhar(); };
    };
    $("#ap-modo").onchange = () => { pos = 0; desenhar(); };
    $("#ap-inkice").onchange = () => { pos = 0; desenhar(); };
    desenhar();
  }

  function ligarEventos() {
    ligarAprender();
    ligarDicionario();
    ligarCantigas();
    if ($("#quiz")) novaPergunta();
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

  /* ---------- Visor de fotos ---------- */
  const visor = document.createElement("div");
  visor.className = "visor";
  visor.hidden = true;
  visor.setAttribute("role", "dialog");
  visor.setAttribute("aria-label", "Foto");
  visor.innerHTML = `<button class="visor-fechar" aria-label="Fechar">&#10005;</button>
    <button class="visor-nav ant" aria-label="Foto anterior">&#8249;</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button class="visor-nav prox" aria-label="Próxima foto">&#8250;</button>`;
  document.body.appendChild(visor);
  let fotoAtual = 0;
  function mostrarFoto(i) {
    fotoAtual = (i + GALERIA.length) % GALERIA.length;
    const g = GALERIA[fotoAtual];
    $("img", visor).src = g.foto;
    $("img", visor).alt = g.legenda;
    $("figcaption", visor).textContent = `${g.legenda} (${fotoAtual + 1} de ${GALERIA.length})`;
    visor.hidden = false;
    $(".visor-fechar", visor).focus();
  }
  $(".visor-fechar", visor).onclick = () => { visor.hidden = true; };
  $(".ant", visor).onclick = () => mostrarFoto(fotoAtual - 1);
  $(".prox", visor).onclick = () => mostrarFoto(fotoAtual + 1);
  visor.addEventListener("click", (e) => { if (e.target === visor) visor.hidden = true; });
  document.addEventListener("keydown", (e) => {
    if (visor.hidden) return;
    if (e.key === "Escape") visor.hidden = true;
    if (e.key === "ArrowLeft") mostrarFoto(fotoAtual - 1);
    if (e.key === "ArrowRight") mostrarFoto(fotoAtual + 1);
  });
  app.addEventListener("click", (e) => {
    const b = e.target.closest("[data-foto]");
    if (b) mostrarFoto(+b.dataset.foto);
  });
  window.addEventListener("hashchange", () => { visor.hidden = true; });

  $("#voltar").onclick = () => history.back();
  window.addEventListener("hashchange", rota);
  rota();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
