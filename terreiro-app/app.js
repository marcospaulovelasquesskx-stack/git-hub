(function () {
  "use strict";

  const app = document.getElementById("app");
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const maiuscula = (t) => t[0].toUpperCase() + t.slice(1);
  const LOCAL = "Jiribatuba · Vera Cruz · Ilha de Itaparica";

  /* ---------- Ícones de interface ---------- */
  const TRACOS = {
    falar: "M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11",
    seta: "M9 6l6 6-6 6",
    voltar: "M15 6l-6 6 6 6",
    baixo: "M6 9l6 6 6-6",
    avancar: "M5 12h14M13 6l6 6-6 6",
    lupa: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
    folha: "M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l9-9",
    pin: "M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    lapis: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
    balao: "M4 5h16v11H9l-5 4z",
    check: "M5 12l5 5 9-10",
    x: "M6 6l12 12M18 6L6 18",
    camera: "M4 8h4l2-3h4l2 3h4v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    externo: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  };
  const CHEIOS = {
    play: "M8 5l12 7-12 7z",
    pausa: "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z",
    estrela: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  };
  const ui = (nome, cls = "ui") => CHEIOS[nome]
    ? `<svg class="${cls} cheio" viewBox="0 0 24 24" aria-hidden="true"><path d="${CHEIOS[nome]}"/></svg>`
    : `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${TRACOS[nome]}"/></svg>`;
  const seta = () => ui("seta", "ui seta");

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
  let tocandoChave = null; // o botão Ouvir que está tocando agora

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

  function botaoPausa(pausado) {
    const btn = $("#player-pausa");
    btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${pausado ? CHEIOS.play : CHEIOS.pausa}"/></svg>`;
    btn.setAttribute("aria-label", pausado ? "Continuar" : "Pausar");
    $("#player-estado").textContent = pausado ? "Pausado" : "Tocando";
  }

  // Marca na tela o botão (e a cantiga) que está tocando.
  function marcarTocando() {
    document.querySelectorAll("[data-ler]").forEach((b) => {
      const ativo = b.dataset.ler === tocandoChave;
      b.classList.toggle("tocando", ativo);
      const cantiga = b.closest(".cantiga");
      if (cantiga) cantiga.classList.toggle("tocando", ativo);
      if (b.classList.contains("tocar")) {
        b.innerHTML = ui(ativo ? "pausa" : "play");
        b.setAttribute("aria-label", (ativo ? "Parar " : "Ouvir ") + (leituras[b.dataset.ler]?.titulo || ""));
      }
    });
  }

  function mostrarPlayer(titulo) {
    $("#player-titulo").textContent = titulo;
    botaoPausa(false);
    player.hidden = false;
    document.body.classList.add("tocando");
    marcarTocando();
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

  async function ouvir(titulo, texto, idAudio, chave = null) {
    parar();
    tocandoChave = chave;
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
    tocandoChave = null;
    marcarTocando();
  }
  audioEl.onended = parar;

  $("#player-parar").onclick = parar;
  $("#player-pausa").onclick = () => {
    const pausando = audioEl.src ? !audioEl.paused : !fala.pausado;
    if (audioEl.src) pausando ? audioEl.pause() : audioEl.play();
    else if (pausando) { fala.pausado = true; speechSynthesis.cancel(); }
    else { fala.pausado = false; falarProxima(); }
    botaoPausa(pausando);
  };

  // Cada botão "Ouvir" guarda o que deve ser lido.
  // classe "redondo" ou "tocar" faz um botão só com ícone (e então leva aria-label).
  const leituras = {};
  let nLeitura = 0;
  function botaoOuvir(titulo, texto, idAudio, rotulo = "Ouvir", classe = "") {
    const k = "l" + nLeitura++;
    leituras[k] = { titulo, texto, idAudio };
    if (classe) {
      return `<button class="ouvir ${classe}" data-ler="${k}" aria-label="Ouvir ${esc(titulo)}">${ui(classe.includes("tocar") ? "play" : "falar")}</button>`;
    }
    return `<button class="ouvir" data-ler="${k}">${ui("falar")}${esc(rotulo)}</button>`;
  }
  app.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ler]");
    if (!b) return;
    if (b.dataset.ler === tocandoChave && !player.hidden) { parar(); return; }
    const l = leituras[b.dataset.ler];
    ouvir(l.titulo, l.texto, l.idAudio, b.dataset.ler);
  });

  /* ---------- Desenhos ligados ao terreiro (atalhos, abas e marcas-d'água) ---------- */
  const svg = (corpo) => `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${corpo}</svg>`;
  const ICONES = {
    // A roda dos inkices: as cores de cada um em volta do centro, como no xirê
    inkices: () => svg(INKICES.slice(0, 10).map((i, n, a) => {
      const ang = (n / a.length) * 2 * Math.PI - Math.PI / 2;
      return `<circle cx="${(24 + 15 * Math.cos(ang)).toFixed(1)}" cy="${(24 + 15 * Math.sin(ang)).toFixed(1)}" r="4.3" fill="${i.cores[0][1]}" stroke="#fff" stroke-width="1.2"/>`;
    }).join("") + '<circle cx="24" cy="24" r="5" fill="currentColor" stroke="none"/>'),
    angolaKetu: () => svg('<path d="M9 18h28m-7-7 7 7-7 7"/><path d="M39 31H11m7-7-7 7 7 7"/>'),
    // Búzios
    nomes: () => svg([[13, 28, -25], [24, 18, 0], [35, 28, 25]].map(([x, y, a]) =>
      `<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="6.5" ry="9"/><path d="M${x} ${y - 6}v12M${x - 2.5} ${y - 3}h5M${x - 2.5} ${y}h5M${x - 2.5} ${y + 3}h5" stroke-width="1.6"/></g>`).join("")),
    // Cocar de penas
    caboclos: () => svg([-60, -30, 0, 30, 60].map((a) =>
      `<g transform="rotate(${a} 24 36)"><path d="M24 34c-3.5-6-3.5-14 0-22 3.5 8 3.5 16 0 22z"/><path d="M24 16v16" stroke-width="1.4"/></g>`).join("") + '<path d="M10 37c9 4 19 4 28 0" stroke-width="3.2"/>'),
    // Dois erês, os gêmeos
    eres: () => svg('<circle cx="16" cy="15" r="5"/><path d="M8 40l3-15h10l3 15z"/><circle cx="32" cy="15" r="5"/><path d="M24 40l3-15h10l3 15z"/>'),
    // Cachimbo do preto-velho
    pretos: () => svg('<path d="M6 21h16v8a8 8 0 0 1-16 0z"/><path d="M22 26h12l9-7"/><path d="M11 16c-2.5-3 2.5-5 0-9M17 16c-2.5-3 2.5-5 0-9" stroke-width="2"/>'),
    // Barracão com o mastro e a bandeira branca de Tempo
    terreiro: () => svg('<path d="M6 24 21 12l15 12"/><path d="M9 22v18h24V22"/><path d="M18 40v-9h6v9"/><path d="M41 40V8"/><path d="M41 9h-8l3 4-3 4h8" fill="#fff"/>'),
    // Porta-retrato com coqueiro e sol, como a beira-mar de Jiribatuba
    fotos: () => svg('<rect x="6" y="9" width="36" height="30" rx="3"/><circle cx="33" cy="17" r="3"/><path d="M6 33c8-3 14-3 22 0s12 2 14 0" stroke-width="1.8"/><path d="M17 33c0-6 1-11 3-15"/><path d="M20 18c-3-3-7-3-9-1M20 18c3-3 7-3 9-1M20 18c-1-3-4-5-7-5M20 18c1-3 4-4 7-4" stroke-width="1.8"/>'),
    // Baobá
    nacao: () => svg('<path d="M20 42c1-8 1-14-1-20h10c-2 6-2 12-1 20"/><path d="M19 22c-4-1-8-4-9-9M29 22c4-1 8-4 9-9M22 22c-1-5-1-10 2-14M26 22c1-5 2-9 5-11"/><path d="M8 13c2-3 6-3 7 0M33 13c2-3 6-3 7 0M20 9c2-3 6-3 8 0" stroke-width="1.8"/><path d="M6 42h36"/>'),
    // Livro aberto
    dicionario: () => svg('<path d="M24 14c-5-3-11-3-16-1v25c5-2 11-2 16 1 5-3 11-3 16-1V13c-5-2-11-2-16 1z"/><path d="M24 14v25"/>'),
    // Atabaque (ngoma)
    cantigas: () => svg('<ellipse cx="24" cy="10" rx="9" ry="3"/><path d="M15 10l3 31h12l3-31"/><path d="M16 17l15 8M32 17l-15 8M17 27l13 7M31 27l-13 7" stroke-width="1.4"/>'),
    // Agogô
    agogo: () => svg('<path d="M7 42l5-19h6l5 19z"/><path d="M28 38l4-14h4l4 14z"/><path d="M15 23c0-9 4-14 9-14s10 5 10 15"/>'),
    // Calendário das festas
    festas: () => svg('<rect x="8" y="11" width="32" height="29" rx="4"/><path d="M8 19h32M16 7v8M32 7v8"/><path d="M17 27h3M23 27h3M29 27h3M17 33h3M23 33h3" stroke-width="2.8"/>'),
    ajustes: () => svg('<circle cx="24" cy="24" r="6"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4"/>'),
  };

  // Ferramenta ou símbolo de cada inkice, usado como marca-d'água grande e translúcida.
  const ICONES_INKICE = {
    aluvaia: () => svg('<path d="M24 6v36M6 24h36"/><circle cx="24" cy="24" r="5"/>'),
    nkosi: () => svg('<path d="M22 32V9l2-4 2 4v23z"/><path d="M15 32h18M24 32v10"/>'),
    mutalambo: () => svg('<path d="M14 7c15 6 15 28 0 34"/><path d="M14 7v34"/><path d="M8 24h30M32 18l6 6-6 6"/>'),
    telekompensu: () => svg('<path d="M14 7c15 6 15 28 0 34"/><path d="M14 7v34"/><path d="M8 24h30M32 18l6 6-6 6"/>'),
    katende: () => svg('<path d="M9 39C9 21 21 9 40 9c0 19-12 30-31 30zM9 39l19-19"/>'),
    kavungo: () => svg('<path d="M24 5v14"/><path d="M15 19h18l-4 24h-10z"/><path d="M20 23l-1 16M28 23l1 16M24 23v18"/>'),
    angoro: () => svg('<path d="M7 36a17 17 0 0 1 34 0M13 36a11 11 0 0 1 22 0M19 36a5 5 0 0 1 10 0"/>'),
    nzazi: () => svg('<path d="M24 8v34"/><path d="M24 13c-8-7-15-1-15 6 4-3 11-3 15 2zM24 13c8-7 15-1 15 6-4-3-11-3-15 2z"/>'),
    matamba: () => svg('<path d="M28 4 12 27h11l-3 17 16-24H25z"/>'),
    dandalunda: () => svg('<circle cx="24" cy="18" r="11"/><circle cx="24" cy="18" r="5"/><path d="M24 29v14"/>'),
    kaitumba: () => svg('<path d="M4 20c5-5 9-5 14 0s9 5 14 0 9-5 14 0M4 31c5-5 9-5 14 0s9 5 14 0 9-5 14 0"/>'),
    zumbaranda: () => svg('<path d="M18 43c0-14 2-23 8-31 4-4 10-2 10 4s-6 8-10 6"/>'),
    kitembo: () => svg('<path d="M14 43V5"/><path d="M14 7h22l-5 7 5 7H14"/>'),
    lemba: () => svg('<circle cx="24" cy="10" r="5"/><path d="M24 15v28M16 22h16M18 43h12"/>'),
    vunji: () => ICONES.eres(),
  };

  function iconeDe(item) {
    if (CABOCLOS.includes(item)) return ICONES.caboclos();
    if (ENTIDADES.includes(item)) return ({ caboclos: ICONES.caboclos, eres: ICONES.eres, "pretos-velhos": ICONES.pretos }[item.id] || ICONES.caboclos)();
    return (ICONES_INKICE[item.id] || ICONES.inkices)();
  }

  const atalho = (href, icone, texto) => `<a href="${href}"><span class="icone">${ICONES[icone]()}</span>${texto}</a>`;
  const cabecalho = (sobre, titulo, texto) => `<header class="cabecalho">
      ${sobre ? `<p class="sobre">${sobre}</p>` : ""}<h1>${titulo}</h1>${texto ? `<p class="apoio">${texto}</p>` : ""}
    </header>`;
  const provisorio = (texto, verde = false) => `<div class="provisorio${verde ? " verde" : ""}">${ui("lapis")}<p>${esc(texto)}</p></div>`;
  const ehProvisorio = (t) => /^(Texto provisório|Espaço reservado)/.test(t);

  /* ---------- Pedaços de tela ---------- */
  const cor = (item) => (item.cores && item.cores[0] ? item.cores[0][1] : "#2e6b2e");
  const cor2 = (item) => (item.cores && item.cores[1] ? item.cores[1][1] : cor(item));
  const lista = (arr) => arr.join(", ");
  const ketuCurto = (item) => (item.ketu || "").split(" (")[0];
  const diaCurto = (item) => ((item.dia || "").match(/^(Segunda|Terça|Quarta|Quinta|Sexta|Sábado|Domingo)/) || [])[1] || "";
  const ehDono = (item) => /^Dono da cabeça/.test(item.destaque || "");
  const selo = (texto) => `<em class="selo${/^(Nosso pai|Dono da cabeça)/.test(texto) ? "" : " sec"}">${esc(texto)}</em>`;

  // Disco com as cores do item, em fatias iguais.
  function gradienteCores(item) {
    const p = 100 / item.cores.length;
    return `conic-gradient(${item.cores.map((c, i) => `${c[1]} ${(i * p).toFixed(2)}% ${((i + 1) * p).toFixed(2)}%`).join(", ")})`;
  }
  const disco = (item, extra = "") => `<span class="disco${ehDono(item) ? " dono" : ""}${extra}" style="--disco:${gradienteCores(item)}" aria-hidden="true"></span>`;

  function cartao(item, href) {
    const visual = item.ketu ? disco(item) : `<span class="tile-icone" aria-hidden="true">${iconeDe(item)}</span>`;
    const dia = diaCurto(item);
    const sub = item.ketu ? `No Ketu: <b>${esc(ketuCurto(item))}</b>${dia ? ` · ${dia}` : ""}` : esc(item.resumo);
    return `<a class="cartao" href="${href}">
      ${visual}
      <span class="cartao-txt">
        <span class="cartao-nome"><strong>${esc(item.nome)}</strong>${item.destaque ? selo(item.destaque) : ""}</span>
        <span class="cartao-sub">${sub}</span>
      </span>
      ${seta()}
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
  const NOMES_GRUPO = { pemba: "Pemba e rezas da casa", lugano: "Mina Lugano (Obá)", aganji: "Mina Aganji (Ewá)" };
  const gruposCantigas = () => [...INKICES.map((i) => i.id), "lugano", "aganji", "pemba"].filter((id) => cantigasDe(id).length);
  function totaisCantigas() {
    const todas = gruposCantigas().flatMap(cantigasDe);
    return { total: todas.length, casa: todas.filter((c) => c.casa).length };
  }

  // Busca a melodia no YouTube pelo começo da letra e pelo nome do inkice.
  function linkMelodia(c, grupo) {
    const comeco = c.letra.split("\n")[0].replace(/\((\^|bis|BIS)\)|[(),]/g, " ").split(/\s+/).filter(Boolean).slice(0, 7).join(" ");
    const busca = `${comeco} ${grupo || ""} cantiga angola`.replace(/\s+/g, " ").trim();
    return `<a class="link-melodia" href="https://www.youtube.com/results?search_query=${encodeURIComponent(busca)}" target="_blank" rel="noopener">${ui("externo")}Procurar a melodia</a>`;
  }

  // chave: nome do arquivo de gravação da casa (audio/<chave>-cantiga.mp3)
  function cartaoCantiga(c, grupo, chave) {
    const titulo = `Cantiga de ${grupo || "Angola"}`;
    return `<div class="cantiga${c.casa ? " da-casa" : ""}">
      ${c.titulo ? `<h3>${esc(c.titulo)}</h3>` : ""}
      ${c.casa ? selo("Cantada na casa") : ""}
      <div class="cantiga-corpo">
        <p class="letra">${esc(c.letra).replace(/\n/g, "<br>")}</p>
        ${botaoOuvir(titulo, c.letra.toLowerCase(), chave ? `${chave}-cantiga` : null, "", "tocar")}
      </div>
      ${c.nota ? `<p class="cantiga-nota">${esc(c.nota)}</p>` : ""}
      ${linkMelodia(c, grupo)}
    </div>`;
  }

  function blocoCantigas(item) {
    const proprias = (item.cantigas || []).map((c, n) => ({ c: { ...c, casa: true }, chave: `${item.id}-p${n}` }));
    const coletanea = cantigasDe(item.id).map((c, n) => ({ c, chave: `${item.id}-${n}` }));
    const todas = [...proprias, ...coletanea];
    if (!todas.length) {
      return provisorio("Os cânticos são ensinados na casa, de boca a ouvido, pelos mais velhos. Este espaço é para as letras e as gravações do próprio terreiro.");
    }
    const casa = todas.filter((x) => x.c.casa);
    const outras = todas.filter((x) => !x.c.casa);
    return `${casa.length ? casa.map((x) => cartaoCantiga(x.c, item.nome, x.chave)).join("")
        : `<p class="apoio">Ainda não marcamos quais destas cantigas são cantadas na nossa casa.</p>`}
      ${outras.length ? `<details class="mais-cantigas"${casa.length ? "" : " open"}>
        <summary>${casa.length ? "Mais" : "Ver as"} ${outras.length} cantigas da coletânea de Angola</summary>
        <p class="pequeno">Da coletânea "Cantigas de Angola". Ainda não confirmadas como cantadas na nossa casa.</p>
        ${outras.map((x) => cartaoCantiga(x.c, item.nome, x.chave)).join("")}
      </details>` : ""}`;
  }

  /* ---------- Detalhe de inkice, caboclo ou entidade ---------- */
  function capaDetalhe(item, botoes) {
    const ehCaboclo = CABOCLOS.includes(item);
    return `<header class="capa${ehCaboclo ? " com-foto" : ""}" style="--c1:${cor(item)};--c2:${cor2(item)}">
        ${ehCaboclo ? '<img class="fundo" src="img/festas/caboclos/032.webp" alt="">' : `<span class="marca-agua">${iconeDe(item)}</span>`}
        ${item.destaque ? `<em class="selo">${ui("estrela")}${esc(item.destaque)}</em>` : ""}
        <h1>${esc(item.nome)}</h1>
        ${item.ketu ? `<p class="ketu">No Ketu: <b>${esc(item.ketu)}</b></p>` : ""}
        ${item.linha ? `<p class="ketu">${esc(item.linha)}</p>` : ""}
        ${item.outros && item.outros.length ? `<p class="outros">Também chamado: ${esc(lista(item.outros))}</p>` : ""}
        <div class="acoes">${botoes}</div>
      </header>`;
  }

  function historia(item) {
    const ps = item.historia;
    const par = (t) => (ehProvisorio(t) ? provisorio(t) : `<p>${esc(t)}</p>`);
    if (ps.length < 3) return ps.map(par).join("");
    const ultimo = ps[ps.length - 1];
    const meio = ps.slice(2, -1);
    return `${ps.slice(0, 2).map(par).join("")}
      ${meio.length ? `<div class="historia" id="resto-historia" hidden>${meio.map(par).join("")}</div>
        <button class="botao" id="ler-historia" aria-expanded="false" aria-controls="resto-historia">Ler a história completa ${ui("baixo")}</button>` : ""}
      ${ehProvisorio(ultimo) ? provisorio(ultimo) : `<blockquote class="citacao">${esc(ultimo)}</blockquote>`}`;
  }

  function detalhe(item, colecao, base) {
    const idx = colecao.indexOf(item);
    const ant = colecao[idx - 1];
    const prox = colecao[idx + 1];
    const botoes = botaoOuvir(item.nome, textoParaOuvir(item), item.id, "Ouvir tudo")
      + `<button class="botao claro" data-ler-historia>${ui("falar")}Só a história</button>`;
    leituras["h-" + item.id] = { titulo: item.nome + " (história)", texto: item.historia.join(" "), idAudio: item.id + "-historia" };
    const celulas = [
      ["Dia", esc(item.dia)],
      item.dominios && ["O que rege", esc(item.dominios)],
      ["Cores", `<span class="bolinhas">${item.cores.map(([n, c]) => `<span><i style="background:${c}"></i>${esc(n)}</span>`).join("")}</span>`, true],
      item.elementos && ["Elementos", esc(item.elementos), true],
      ["Festa", esc(item.festa), true],
    ].filter(Boolean);

    return `<article class="detalhe">
      ${capaDetalhe(item, botoes)}

      <p class="resumo">${esc(item.resumo)}</p>

      <dl class="ficha">${celulas.map(([t, d, larga]) => `<div${larga ? ' class="larga"' : ""}><dt>${t}</dt><dd>${d}</dd></div>`).join("")}</dl>

      ${item.saudacao ? `<div class="saudacao">${ui("balao")}<p><b>Saudação</b>${esc(item.saudacao)}</p></div>` : ""}

      <section class="secao historia">
        <h2>História</h2>
        ${historia(item)}
      </section>

      <section class="secao">
        <h2>Folhas</h2>
        <ul class="chips">${item.folhas.map((f) => `<li>${ui("folha")}${esc(f)}</li>`).join("")}</ul>
      </section>

      <section class="secao">
        <h2>Oferendas</h2>
        <ul class="lista-simples">${item.oferendas.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      </section>

      ${(item.secoes || []).map((sec) => `<section class="secao">
        <h2>${esc(sec.titulo)}</h2>
        ${sec.texto ? `<p class="apoio">${esc(sec.texto)}</p>` : ""}
        <div class="grupo-lista">${sec.itens.map(([t, d]) => `<div class="guardiao"><strong>${esc(t)}</strong><span>${esc(d)}</span></div>`).join("")}</div>
      </section>`).join("")}

      <section class="secao">
        <div class="secao-topo"><h2>Cantigas da casa</h2><a class="link" href="#/cantigas">Ver todas ${seta()}</a></div>
        ${blocoCantigas(item)}
      </section>

      ${provisorio("Cada casa de Angola tem os seus fundamentos. Confira sempre com o Tata e os mais velhos.")}

      <nav class="vizinhos" aria-label="Outros">
        ${ant ? `<a href="${base}/${ant.id}"><small>‹ Anterior</small><strong>${esc(ant.nome)}</strong></a>` : "<span></span>"}
        ${prox ? `<a class="prox" href="${base}/${prox.id}"><small>Próximo ›</small><strong>${esc(prox.nome)}</strong></a>` : "<span></span>"}
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
    if (f.faltam === 0) return "é neste mês";
    if (f.faltam === 1) return "daqui a 1 mês";
    return `daqui a ${f.faltam} meses`;
  }
  const linkFesta = (f) => (f.id ? `#/inkices/${f.id}` : f.cab ? "#/caboclos" : null);
  const albumDoMes = (mes) => ALBUNS.find((a) => a.mes === mes && a.id !== "bori" && a.fotos.length);

  function cartaoProximaFesta(f) {
    const href = linkFesta(f);
    const dentro = `<span class="bloco-data"><small>mês</small><b>${maiuscula(MESES[f.mes - 1].slice(0, 3))}</b></span>
      <span class="festa-txt">
        <strong>${esc(f.titulo)}</strong>
        <span class="festa-quando">${maiuscula(MESES[f.mes - 1])} · ${quandoFesta(f)}</span>
        <p>${esc(f.texto)}</p>
      </span>${href ? seta() : ""}`;
    return href ? `<a class="festa-cartao" href="${href}">${dentro}</a>` : `<div class="festa-cartao">${dentro}</div>`;
  }

  function linhaDoTempo() {
    const hoje = new Date();
    const itens = festasOrdenadas().map((f) => ({ tipo: "festa", f, mes: f.mes, faltam: f.faltam }));
    CASA.datas.forEach((d) => {
      if (!itens.some((x) => x.mes === d.mes)) itens.push({ tipo: "data", mes: d.mes, faltam: mesesAte(d.mes, hoje) });
    });
    itens.sort((a, b) => a.faltam - b.faltam);
    return itens.map((x, n) => {
      const datas = CASA.datas.filter((d) => d.mes === x.mes)
        .map((d) => `<p class="data-lembrada">${d.dia} de ${MESES[d.mes - 1]}: ${esc(d.titulo)}. ${esc(d.texto)}</p>`).join("");
      let corpo;
      if (x.tipo === "festa") {
        const f = x.f;
        const href = linkFesta(f);
        const album = albumDoMes(f.mes);
        corpo = `${href ? `<a class="titulo" href="${href}">${esc(f.titulo)}</a>` : `<strong>${esc(f.titulo)}</strong>`}
          <span class="festa-quando">${maiuscula(MESES[f.mes - 1])} · ${quandoFesta(f)}</span>
          <p>${esc(f.texto)}</p>
          ${album ? `<a class="marco-fotos" href="#/galeria/${album.id}">${ui("camera")}${album.fotos.length} fotos</a>` : ""}`;
      } else {
        corpo = `<span class="festa-quando">${maiuscula(MESES[x.mes - 1])}</span>`;
      }
      return `<div class="marco-tempo${n === 0 && x.tipo === "festa" ? " proxima" : ""}">
          <span class="marco-mes">${MESES[x.mes - 1].slice(0, 3)}</span>
          <span class="trilho" aria-hidden="true"><i></i></span>
          <div class="marco-cartao">${corpo}${datas}</div>
        </div>`;
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
    const chamada = d === hoje ? `Hoje é ${dia.nome}` : maiuscula(dia.nome);
    const falado = `${chamada}, dia de ${item.nome}${item.ketu ? `, que no Ketu é ${item.ketu}` : ""}. ` + textoParaOuvir(item);
    const ketu = [item.ketu ? `${ketuCurto(item)} no Ketu` : "", outros.length ? `também ${outros.map((o) => o.item.nome).join(", ")}` : ""].filter(Boolean).join(" · ");
    return `<div class="dia-cartao">
        <a class="dia-topo" href="${href}">
          ${disco(item)}
          <span class="dia-txt">
            <span class="sobre">${esc(chamada)}</span>
            <span class="pequeno">Dia de</span>
            <span class="dia-nome">${esc(item.nome)}</span>
            ${ketu ? `<span class="pequeno">${esc(ketu)}</span>` : ""}
          </span>
          ${seta()}
        </a>
        ${semanaDoDia(d)}
        <details class="ver-mais">
          <summary>Ver mais ${ui("baixo")}</summary>
          <div class="ver-mais-corpo">
            <p>${esc(item.resumo)}</p>
            ${item.saudacao ? `<div class="saudacao">${ui("balao")}<p><b>Saudação</b>${esc(item.saudacao)}</p></div>` : ""}
            <dl class="ficha">
              <div class="larga"><dt>Folhas</dt><dd>${esc(lista(item.folhas.slice(0, 4)))}</dd></div>
              <div class="larga"><dt>Oferendas</dt><dd>${esc(lista(item.oferendas.slice(0, 4)))}</dd></div>
            </dl>
            <div class="acoes">${botaoOuvir(`${item.nome}, ${dia.nome}`, falado, item.id, "Ouvir tudo")}</div>
            ${outros.length ? `<p class="pequeno">Também neste dia: ${outros.map((o) => `<a class="link" href="${o.href}">${esc(o.item.nome)}</a>`).join(", ")}</p>` : ""}
          </div>
        </details>
      </div>`;
  }

  function semanaDoDia(d) {
    const hoje = new Date().getDay();
    return `<div class="semana" role="group" aria-label="Ver outro dia da semana">${DIAS_DA_SEMANA.map((dia, i) => {
      const it = acharItem(dia.principal);
      return `<button class="${i === d ? "ativo" : ""}${i === hoje ? " hoje" : ""}" data-dia="${i}" aria-pressed="${i === d}" aria-label="${maiuscula(dia.nome)}: ${esc(it.item.nome)}">
        ${dia.nome[0].toUpperCase()}<i style="background:${cor(it.item)}"></i></button>`;
    }).join("")}</div>`;
  }

  const gradeFotos = (fotos, album) => `<div class="galeria">${fotos.map((g, i) =>
    `<figure><button class="foto" data-album="${album}" data-foto="${i}" aria-label="Ver foto: ${esc(g.legenda)}"><img src="${g.foto}" alt="${esc(g.legenda)}" loading="lazy"></button><figcaption>${esc(g.legenda)}</figcaption></figure>`).join("")}</div>`;
  const botaoFoto = (lista, album, i) => `<button class="foto" data-album="${album}" data-foto="${i}" aria-label="Ver foto: ${esc(lista[i].legenda)}"><img src="${lista[i].foto}" alt="${esc(lista[i].legenda)}" loading="lazy"></button>`;

  /* ---------- Telas ---------- */
  const telas = {
    inicio() {
      const prox = festasOrdenadas()[0];
      const textoCasa = [CASA.nome, CASA.nacao, ...CASA.historia.filter((p) => !ehProvisorio(p))].join(". ");
      const pais = CABOCLOS.filter((c) => ["Nosso pai maior", "Pai da casa"].includes(c.destaque));
      return `<section class="hero">
          <img class="logo" src="${CASA.logo}" alt="Brasão do ${esc(CASA.nome)}">
          <p class="sobre">${esc(CASA.nacao)}</p>
          <h1>${esc(CASA.nome)}</h1>
          <p class="local">${ui("pin")}${LOCAL}</p>
          <div class="marcos">
            <div><b>${CASA.fundacao}</b><span>fundação da casa</span></div>
            <div><b>${CASA.anosDeFeitura} anos</b><span>de feitura de ${esc(CASA.sacerdote)}</span></div>
          </div>
          ${botaoOuvir("Nosso terreiro", textoCasa, "casa", "Ouvir a história do terreiro")}
          ${CASA.versao ? `<p class="versao">${esc(CASA.versao)} · app em construção</p>` : ""}
        </section>

        <div class="bloco">
          <section class="secao" id="do-dia" aria-label="Inkice do dia">
            ${cartaoDoDia(new Date().getDay())}
          </section>

          ${prox ? `<section class="secao"><h2>Próxima festa</h2>${cartaoProximaFesta(prox)}</section>` : ""}

          <section class="secao">
            <h2>Nossos pais caboclos</h2>
            <div class="lista">${pais.map((c) => cartao(c, "#/caboclos/" + c.id)).join("")}</div>
            <a class="link" href="#/caboclos">Ver todos os caboclos da casa ${seta()}</a>
          </section>

          <section class="secao">
            <h2>Donos da cabeça do ${esc(CASA.sacerdote)}</h2>
            <div class="donos">
              ${CASA.donosDaCabeca.map((d) => {
                const ink = INKICES.find((i) => i.id === d.id);
                return `<a class="dono" href="#/inkices/${d.id}" style="--c1:${cor(ink)};--c2:${cor2(ink)}">
                  <span class="marca-agua">${iconeDe(ink)}</span>
                  <strong>${esc(d.angola)}</strong><small>${esc(d.ketu)} no Ketu</small></a>`;
              }).join("")}
            </div>
          </section>

          <section class="secao">
            <div class="secao-topo"><h2>Nosso terreiro em festa</h2><a class="link" href="#/galeria">Fotos ${seta()}</a></div>
            <div class="faixa-fotos">${GALERIA.slice(0, 6).map((g, i) => botaoFoto(GALERIA, "destaques", i)).join("")}</div>
          </section>

          <section class="secao">
            <h2>Conheça</h2>
            <div class="atalhos">
              ${atalho("#/comparativo", "angolaKetu", "Angola e Ketu")}
              ${atalho("#/aprender", "nomes", "Aprenda os nomes")}
              ${atalho("#/cantigas", "cantigas", "Cantigas de Angola")}
              ${atalho("#/dicionario", "dicionario", "Dicionário Angola-Congo")}
              ${atalho("#/entidades/eres", "eres", "Erês e Ibejis")}
              ${atalho("#/galeria", "fotos", "Fotos do terreiro")}
            </div>
          </section>
        </div>`;
    },

    inkices() {
      return `<section class="bloco">
        ${cabecalho(`${INKICES.length} inkices da nação`, "Inkices", "As divindades da nação Angola-Congo, com o nome correspondente no Ketu, que é como muitas vezes chamamos na casa.")}
        <div class="faixa-acoes">
          <a class="botao" href="#/comparativo">${ICONES.angolaKetu()}Angola e Ketu</a>
          <a class="botao" href="#/aprender">${ICONES.nomes()}Aprenda os nomes</a>
          <a class="botao" href="#/cantigas">${ICONES.cantigas()}Cantigas</a>
        </div>
        <label class="busca"><span class="sr">Buscar inkice</span>${ui("lupa")}
          <input type="search" id="busca" placeholder="Buscar: Oxóssi, Matamba, sábado, mel..." autocomplete="off"></label>
        <div class="lista" id="lista">${INKICES.map((i) => cartao(i, "#/inkices/" + i.id)).join("")}</div>
      </section>`;
    },

    entidades() {
      const pai = CABOCLOS.find((c) => c.destaque === "Nosso pai maior");
      const segundo = CABOCLOS.find((c) => c.destaque === "Pai da casa");
      const resto = CABOCLOS.filter((c) => c !== pai && c !== segundo);
      return `<section class="bloco">
        ${cabecalho(`${CABOCLOS.length} caboclos da casa`, "Caboclos", `Os caboclos que estão à frente do ${esc(CASA.nome)}. Toque em um caboclo para ler e ouvir a sua história.`)}
        <nav class="segmentado" aria-label="Guias">
          <a class="ativo" href="#/caboclos" aria-current="page">Caboclos</a>
          <a href="#/entidades/eres">Erês e Ibejis</a>
          <a href="#/entidades/pretos-velhos">Pretos-Velhos</a>
        </nav>
        ${pai ? `<a class="cab-destaque" href="#/caboclos/${pai.id}">
          <img src="img/galeria/044.webp" alt="">
          ${selo(pai.destaque)}
          <strong>${esc(pai.nome)}</strong>
          <p>${esc(pai.resumo)}</p>
        </a>` : ""}
        ${segundo ? `<a class="cab-escuro" href="#/caboclos/${segundo.id}">
          <span class="icone">${ICONES.caboclos()}</span>
          <span class="cartao-txt"><small>${esc(segundo.destaque)}</small><strong>${esc(segundo.nome)}</strong></span>
          ${ui("seta", "ui")}
        </a>` : ""}
        <section class="secao">
          <h2>Todos os caboclos</h2>
          <div class="grade-cab">${resto.map((c) => `<a href="#/caboclos/${c.id}">
            <span class="tile-icone" aria-hidden="true">${ICONES.caboclos()}</span>
            <strong>${esc(c.nome)}</strong>
            <p>${esc(c.resumo)}</p>
          </a>`).join("")}</div>
        </section>
        <section class="secao">
          <h2>Quem são os caboclos</h2>
          <div class="lista">${cartao(ENTIDADES.find((e) => e.id === "caboclos"), "#/entidades/caboclos")}</div>
        </section>
      </section>`;
    },

    calendario() {
      const falado = "Calendário de festas da casa. " + CASA.festas.map((f) => `Em ${MESES[f.mes - 1]}: ${f.titulo}.`).join(" ");
      const principal = festasOrdenadas().find((f) => f.principal);
      return `<section class="bloco">
        ${cabecalho(`${CASA.festas.length} festas no ano`, "Festas da casa", `O dia muda a cada ano e é confirmado pelo ${esc(CASA.sacerdote)}; o mês é sempre o mesmo.`)}
        <div class="acoes">${botaoOuvir("Festas da casa", falado, "calendario", "Ouvir o calendário")}</div>
        ${principal ? `<a class="festa-principal" href="${linkFesta(principal)}">
          <img src="img/festas/iansa/015.webp" alt="">
          ${selo("A principal festa do terreiro").replace('class="selo sec"', 'class="selo"')}
          <strong>${esc(principal.titulo)}</strong>
          <span>${maiuscula(MESES[principal.mes - 1])} · ${quandoFesta(principal)}</span>
        </a>` : ""}
        <section class="secao">
          <h2>A partir de hoje</h2>
          <div class="linha-tempo">${linhaDoTempo()}</div>
        </section>
      </section>`;
    },

    mais() {
      const t = totaisCantigas();
      const linha = (href, icone, titulo, sub) => `<a class="linha-item" href="${href}">
          <span class="icone">${ICONES[icone]()}</span>
          <span class="linha-txt"><strong>${titulo}</strong><span>${sub}</span></span>${seta()}</a>`;
      return `<section class="bloco">
        ${cabecalho("Aprender e consultar", "Saber", "A nação Angola, as cantigas, as palavras e a casa, para estudar no seu tempo.")}
        <div class="destaque-verde">
          <p class="sobre">Exercício</p>
          <h2>Do Ketu para a Angola</h2>
          <p>Veja o nome do Ketu e escolha o nome certo na nossa nação. São ${COMPARATIVO.length} nomes para aprender.</p>
          <a class="ouvir" href="#/aprender">Começar ${ui("avancar")}</a>
        </div>
        <section class="secao">
          <p class="sobre">Aprender</p>
          <div class="grupo-lista">
            ${linha("#/aprender-cantigas", "agogo", "Aprender cantigas", "Uma cantiga por vez, no seu ritmo")}
            ${linha("#/comparativo", "angolaKetu", "Angola e Ketu", `Tabela com os ${COMPARATIVO.length} nomes`)}
          </div>
        </section>
        <section class="secao">
          <p class="sobre">Consultar</p>
          <div class="grupo-lista">
            ${linha("#/dicionario", "dicionario", "Dicionário Angola-Congo", `${DICIONARIO.length} palavras`)}
            ${linha("#/cantigas", "cantigas", "Cantigas de Angola", `${t.total} cantigas · ${t.casa} da casa`)}
            ${linha("#/nacao", "nacao", "A nação Angola", `${NACAO.length} textos sobre a nossa raiz`)}
          </div>
        </section>
        <section class="secao">
          <p class="sobre">A casa</p>
          <div class="grupo-lista">
            ${linha("#/casa", "terreiro", "Nosso terreiro", "História, zelador e caboclos")}
            ${linha("#/galeria", "fotos", "Fotos do terreiro", `${ALBUNS.filter((a) => a.fotos.length).length} pastas de festas`)}
            ${linha("#/sobre", "ajustes", "Ajustes e ajuda", "Voz, tamanho da letra e instalação")}
          </div>
        </section>
      </section>`;
    },

    cantigas() {
      const ordem = gruposCantigas();
      const t = totaisCantigas();
      const nomeDe = (id) => {
        const ink = INKICES.find((i) => i.id === id);
        return ink ? ink.nome : NOMES_GRUPO[id];
      };
      return `<section class="bloco">
        ${cabecalho(`${t.total} cantigas · ${t.casa} da casa`, "Cantigas de Angola", 'Da coletânea "Cantigas de Angola", separadas por inkice. As cantadas na nossa casa aparecem primeiro.')}
        <div class="faixa-acoes">
          <button class="botao" id="so-casa" aria-pressed="false">${ui("estrela")}Só as da nossa casa</button>
          <a class="botao" href="#/aprender-cantigas">${ICONES.agogo()}Aprender</a>
        </div>
        <label class="busca"><span class="sr">Buscar na letra</span>${ui("lupa")}
          <input type="search" id="busca-cantiga" placeholder="Buscar na letra: Matamba, Kitembu, pemba..." autocomplete="off"></label>
        <div class="filtros" role="group" aria-label="Inkice">
          <button class="filtro ativo" data-grupo-filtro="">Todas</button>
          ${ordem.map((id) => `<button class="filtro" data-grupo-filtro="${id}">${esc(nomeDe(id))}</button>`).join("")}
        </div>
        <div id="lista-cantigas" class="secao">
        ${ordem.map((id) => {
          const ink = INKICES.find((i) => i.id === id);
          const titulo = ink ? `${ink.nome} (${ketuCurto(ink)})` : NOMES_GRUPO[id];
          return `<section class="grupo-cantigas" data-grupo="${id}">
            <div class="secao-topo"><h2>${esc(titulo)}</h2>${ink ? `<a class="link" href="#/inkices/${id}">Ver a página ${seta()}</a>` : ""}</div>
            ${cantigasDe(id).map((c, n) => cartaoCantiga(c, nomeDe(id), `${id}-${n}`)).join("")}
          </section>`;
        }).join("")}
        </div>
        <div class="caixa"><p class="pequeno">O botão "Procurar a melodia" abre uma busca no YouTube pelo começo da letra. A gravação que aparecer pode ser de outra casa, com outra melodia: confira sempre com os ogãs e os mais velhos.</p></div>
      </section>`;
    },

    dicionario() {
      const inicioAno = new Date(new Date().getFullYear(), 0, 0);
      const diaDoAno = Math.floor((new Date() - inicioAno) / 864e5);
      const p = DICIONARIO[diaDoAno % DICIONARIO.length];
      return `<section class="bloco">
        ${cabecalho(`${DICIONARIO.length} palavras`, "Dicionário Angola-Congo", "Palavras de origem banto (kimbundu e kikongo) usadas no dia a dia das casas de Angola. A pronúncia e o uso podem mudar de casa para casa.")}
        <div class="palavra-dia">
          <p class="sobre">Palavra do dia</p>
          <div class="palavra-dia-linha">
            <strong>${esc(p.termo)}</strong>
            ${botaoOuvir(p.termo, `${p.termo}. ${p.sentido}`, null, "", "redondo")}
          </div>
          <p>${esc(p.sentido)}</p>
          <small>${esc(ASSUNTOS[p.cat])}</small>
        </div>
        <label class="busca"><span class="sr">Buscar palavra</span>${ui("lupa")}
          <input type="search" id="busca-dic" placeholder="Buscar: água, mãe, ngoma, feijão..." autocomplete="off"></label>
        <div class="filtros" role="group" aria-label="Assunto">
          <button class="filtro ativo" data-cat="">Todas</button>
          ${Object.entries(ASSUNTOS).map(([k, v]) => `<button class="filtro" data-cat="${k}">${esc(v)}</button>`).join("")}
        </div>
        <p class="contagem" id="dic-contagem" aria-live="polite"></p>
        <div class="grupo-lista" id="dic-lista"></div>
        <p class="fonte-rodape">As palavras marcadas com &#9670; vêm do vocabulário bantu do Unzó Maiala, publicado na cartilha "Nação Angola: das influências banto no Brasil" (KOINONIA, 2022).</p>
      </section>`;
    },

    aprender() {
      return `<section class="bloco">
        ${cabecalho("Exercício", "Aprenda os nomes", "Aparece o nome usado no Ketu. Toque no nome certo da nossa nação Angola.")}
        <div id="quiz" class="quiz-cartao"></div>
      </section>`;
    },

    galeria() {
      const destaque = ["001", "097", "044"].map((n) => GALERIA.findIndex((g) => g.foto.includes(`/${n}.webp`))).filter((i) => i >= 0);
      const pasta = (a) => {
        const capa = a.fotos[0];
        return `<a class="pasta${a.fotos.length ? "" : " vazia"}" href="#/galeria/${a.id}">
          <span class="pasta-capa">${capa ? `<img src="${capa.foto}" alt="" loading="lazy">` : `${ui("camera")}<span>Ainda sem fotos</span>`}</span>
          <span class="pasta-txt"><small>${MESES[a.mes - 1]}</small><strong>${esc(a.titulo)}</strong>
          <span>${a.fotos.length ? `${a.fotos.length} fotos` : "Ainda sem fotos"}</span></span>
        </a>`;
      };
      return `<section class="bloco">
        ${cabecalho(`${ALBUNS.length} pastas`, "Fotos do terreiro", `Uma pasta para cada festa do ${esc(CASA.nome)}, na ordem do calendário.`)}
        <div class="mosaico">${destaque.map((i) => botaoFoto(GALERIA, "destaques", i)).join("")}</div>
        <a class="link" href="#/galeria/destaques">Ver os ${GALERIA.length} destaques ${seta()}</a>
        <section class="secao">
          <h2>Festas</h2>
          <div class="pastas">${ALBUNS.map(pasta).join("")}</div>
        </section>
        ${provisorio("Tem fotos de uma festa? Envie para a administração do app.", true)}
      </section>`;
    },

    album(id) {
      const a = id === "destaques" ? { id: "destaques", titulo: "Destaques", fotos: GALERIA } : ALBUNS.find((x) => x.id === id);
      if (!a) return null;
      return `<section class="bloco">
        ${cabecalho(a.mes ? MESES[a.mes - 1] : "Fotos do terreiro", esc(a.titulo), a.sub ? esc(a.sub) : "")}
        ${a.fotos.length ? gradeFotos(a.fotos, a.id)
          : provisorio("Ainda não há fotos desta festa no app. Quando a festa acontecer, mande as melhores fotos que elas entram aqui.", true)}
        <a class="link" href="#/galeria">${ui("voltar")}Todas as pastas</a>
      </section>`;
    },

    casa() {
      return `<article class="detalhe">
        <header class="capa" style="--c1:#1A8A43;--c2:#0B5A24">
          <span class="marca-agua">${ICONES.terreiro()}</span>
          <p class="sobre" style="color:var(--ouro-claro)">${esc(CASA.nacao)}</p>
          <h1>Nosso terreiro</h1><p class="ketu">${esc(CASA.nome)}</p>
          <div class="acoes">${botaoOuvir("Nosso terreiro", CASA.historia.filter((p) => !ehProvisorio(p)).join(" "), "casa", "Ouvir")}</div>
        </header>
        <section class="secao historia"><h2>História</h2>${CASA.historia.map((p) => (ehProvisorio(p) ? provisorio(p) : `<p>${esc(p)}</p>`)).join("")}</section>
        <section class="secao"><h2>Zelador</h2>
          <dl class="ficha">
            <div class="larga"><dt>Nome</dt><dd>${esc(CASA.sacerdote)}</dd></div>
            <div class="larga"><dt>Cargo</dt><dd>${esc(CASA.titulo)}</dd></div>
            <div><dt>Fundação da casa</dt><dd>${CASA.fundacao}</dd></div>
            <div><dt>Tempo de feitura</dt><dd>${CASA.anosDeFeitura} anos</dd></div>
            <div class="larga"><dt>Donos da cabeça</dt><dd>${CASA.donosDaCabeca.map((d) => `<a class="link" href="#/inkices/${d.id}">${esc(d.angola)} (${esc(d.ketu)})</a>`).join(" e ")}</dd></div>
          </dl>
          <p>${esc(CASA.regencia)}</p>
        </section>
        <section class="secao"><h2>Caboclos da casa</h2><div class="lista">${CABOCLOS.map((c) => cartao(c, "#/caboclos/" + c.id)).join("")}</div></section>
        <a class="botao" href="#/galeria">${ICONES.fotos()}Ver as fotos do terreiro</a>
      </article>`;
    },

    comparativo() {
      const falado = "Tabela comparativa entre Angola e Ketu. " +
        COMPARATIVO.map(([dom, ang, ket]) => `${ket}, no Ketu, na nossa nação Angola é ${ang.replace(" / ", " ou ")}. Domínio: ${dom}.`).join(" ");
      return `<section class="bloco">
        ${cabecalho(`${COMPARATIVO.length} nomes`, "Angola e Ketu", "Nkisis e orixás têm o mesmo papel no mundo, mas vêm de raízes diferentes: os nkisis são bantos, da nação Angola; os orixás são iorubás, da nação Ketu.")}
        <div class="faixa-acoes">${botaoOuvir("Angola e Ketu", falado, "comparativo", "Ouvir a tabela")}
          <a class="botao" href="#/aprender">${ICONES.nomes()}Aprenda os nomes</a></div>
        <div class="comparativo">
          <div class="comp-cabeca" aria-hidden="true"><span class="rotulo">Na Angola (nkisi)</span><span class="rotulo">No Ketu (orixá)</span></div>
          ${COMPARATIVO.map(([dom, ang, ket, id]) => `<a class="comp-linha" href="#/inkices/${id}">
            <small class="comp-dom">${esc(dom)}</small>
            <strong class="comp-ang">${esc(ang)}</strong>
            <span class="comp-ket"><span class="sr">No Ketu: </span>${esc(ket)}</span>
          </a>`).join("")}
        </div>
        <p class="pequeno">Na Angola, os caboclos também fazem parte da base do terreiro, cultuados junto com os nkisis como ancestralidade da terra brasileira. <a class="link" href="#/nacao">Leia sobre a nação Angola</a></p>
      </section>`;
    },

    nacao() {
      return `<section class="bloco">
        ${cabecalho("Nossa raiz", "A nação Angola", "")}
        ${NACAO.map((s, i) => `<div class="caixa texto"><h2>${esc(s.titulo)}</h2>
          ${s.texto.map((p) => `<p>${esc(p)}</p>`).join("")}
          ${s.fonte ? `<p class="nota-fonte">Fonte: ${esc(s.fonte)}</p>` : ""}
          <div>${botaoOuvir(s.titulo, s.titulo + ". " + s.texto.join(" "), "nacao-" + (i + 1))}</div></div>`).join("")}
      </section>`;
    },

    "aprender-cantigas"() {
      const opcoes = INKICES.filter((i) => cantigasDe(i.id).length).map((i) => `<option value="${i.id}">${esc(i.nome)} (${esc(ketuCurto(i))})</option>`).join("");
      return `<section class="bloco">
        ${cabecalho("Exercício", "Aprender cantigas", "Uma cantiga de cada vez. Leia a letra, procure a melodia, cante junto e marque quando aprender. O que você marcar fica guardado neste aparelho.")}
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
        <div class="progresso" id="ap-progresso" aria-live="polite"></div>
        <div id="ap-cartao"></div>
      </section>`;
    },

    sobre() {
      return `<section class="bloco">
        ${cabecalho("Ajustes", "Ajustes e ajuda", "")}
        <div class="caixa">
          <h2>Velocidade da voz</h2>
          <input type="range" id="vel" min="0.6" max="1.3" step="0.05" value="${prefs.velocidade}" aria-label="Velocidade da voz">
          <p id="vel-txt"></p>
          <div>${botaoOuvir("Teste", "Kiuá! Este é um teste da voz do aplicativo do Centro do Caboclo Sete Flechas.", null, "Testar voz")}</div>
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
    } else if (secao === "galeria" && id) {
      html = telas.album(id);
      aba = "galeria";
    } else if (secao === "entidades" && id) {
      const item = ENTIDADES.find((i) => i.id === id);
      html = item ? detalhe(item, ENTIDADES, "#/entidades") : null;
    } else if (telas[aba] && aba !== "album") {
      html = telas[aba]();
    }
    if (!html) { aba = "inicio"; html = telas.inicio(); }
    if (["comparativo", "aprender"].includes(aba)) aba = "inkices";
    if (aba === "aprender-cantigas") aba = "mais";
    if (aba === "galeria") aba = "inicio";
    if (["casa", "nacao", "dicionario", "cantigas", "sobre"].includes(aba)) aba = aba === "casa" ? "inicio" : "mais";

    app.innerHTML = html;
    document.querySelectorAll(".abas a").forEach((a) => {
      const ativa = a.dataset.aba === aba;
      a.classList.toggle("ativa", ativa);
      if (ativa) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    $("#voltar").hidden = !secao || (!id && ["inkices", "entidades", "caboclos", "calendario", "mais"].includes(secao));
    window.scrollTo(0, 0);
    ligarEventos();
    marcarTocando();
  }

  /* ---------- Exercício: do nome do Ketu para o nome em Angola ---------- */
  const embaralhar = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const quiz = { acertos: 0, feitas: 0, baralho: [], pos: 0, atual: null };

  function desenharProgresso(respondida) {
    const total = COMPARATIVO.length;
    const n = (quiz.pos % total) + 1;
    const feitas = (quiz.pos % total) + (respondida ? 1 : 0);
    return `<div class="progresso">
        <span class="pequeno"><b>${n}</b> de ${total}</span>
        <div class="progresso-barra" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${feitas}"><i style="width:${(feitas / total) * 100}%"></i></div>
      </div>`;
  }
  const placar = () => `<div class="quiz-placar caixa"><div><b>${quiz.acertos}</b><span>Acertos</span></div><div><b>${quiz.feitas}</b><span>Respondidas</span></div></div>`;

  function novaPergunta() {
    const el = $("#quiz");
    if (!el) return;
    if (!quiz.baralho.length || quiz.pos % COMPARATIVO.length === 0 && quiz.atual) quiz.baralho = embaralhar(COMPARATIVO);
    const certa = quiz.baralho[quiz.pos % COMPARATIVO.length];
    const erradas = embaralhar(COMPARATIVO.filter((c) => c !== certa)).slice(0, 3);
    quiz.atual = certa;
    el.innerHTML = `${desenharProgresso(false)}
      <div class="caixa quiz-cartao">
        <p class="rotulo">No Ketu se diz</p>
        <p class="quiz-nome">${esc(certa[2])}</p>
        <p class="quiz-pergunta">Na nossa nação Angola, quem é?</p>
        <div class="quiz-opcoes">${embaralhar([certa, ...erradas]).map((c) =>
          `<button class="quiz-op" data-op="${esc(c[3])}"><span>${esc(c[1])}</span></button>`).join("")}</div>
      </div>
      <div class="quiz-resposta" id="quiz-resposta" aria-live="polite"></div>
      ${placar()}`;
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
      if (b.dataset.op === certa[3]) { b.classList.add("certa"); b.insertAdjacentHTML("beforeend", ui("check")); }
      else if (b === botao) { b.classList.add("errada"); b.insertAdjacentHTML("beforeend", ui("x")); }
    });
    el.querySelector(".progresso").outerHTML = desenharProgresso(true);
    el.querySelector(".quiz-placar").outerHTML = placar();
    const frase = `${certa[2]}, na Angola, é ${certa[1].replace(" / ", " ou ")}.`;
    $("#quiz-resposta").innerHTML = `<div class="quiz-painel ${acertou ? "certo" : "quase"}">
        <strong>${acertou ? "Isso mesmo! Kiuá!" : "Quase lá"}</strong>
        <p>${esc(frase)}</p>
        <div class="acoes">
          <button class="botao acao" id="quiz-prox">Próxima ${ui("avancar")}</button>
          <a class="botao" href="#/inkices/${certa[3]}">Ver a história</a>
          <button class="ouvir redondo" id="quiz-ouvir" aria-label="Ouvir a resposta">${ui("falar")}</button>
        </div>
      </div>`;
    $("#quiz-ouvir").onclick = () => ouvir("Aprenda os nomes", (acertou ? "Isso mesmo! " : "Quase! ") + frase);
    $("#quiz-prox").onclick = () => { quiz.pos++; novaPergunta(); $("#quiz").scrollIntoView({ block: "start" }); };
    $("#quiz-prox").focus();
  }

  app.addEventListener("click", (e) => {
    const b = e.target.closest("[data-dia]");
    if (!b) return;
    const d = +b.dataset.dia;
    $("#do-dia").innerHTML = cartaoDoDia(d);
    $(`#do-dia [data-dia="${d}"]`).focus();
  });

  // "Só a história" e "Ler a história completa" no detalhe.
  app.addEventListener("click", (e) => {
    const h = e.target.closest("[data-ler-historia]");
    if (h) {
      const chave = "h-" + (location.hash.split("/")[2] || "");
      const l = leituras[chave];
      if (l) { if (tocandoChave === chave && !player.hidden) parar(); else ouvir(l.titulo, l.texto, l.idAudio, chave); }
      return;
    }
    const ler = e.target.closest("#ler-historia");
    if (ler) {
      $("#resto-historia").hidden = false;
      ler.remove();
    }
  });

  function ligarDicionario() {
    const lista = $("#dic-lista");
    if (!lista) return;
    const norm = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    let cat = "";
    const desenhar = () => {
      const q = norm($("#busca-dic").value.trim());
      const achados = DICIONARIO
        .filter((d) => (!cat || d.cat === cat) && (!q || norm(d.termo + " " + d.sentido).includes(q)))
        .sort((a, b) => a.termo.localeCompare(b.termo, "pt"));
      $("#dic-contagem").textContent = `${achados.length} ${achados.length === 1 ? "palavra" : "palavras"}`;
      lista.hidden = !achados.length;
      lista.innerHTML = achados.map((d) => `<div class="verbete">
          <div class="verbete-txt">
            <strong>${esc(d.termo)}</strong>${d.fonte ? ' <span class="marca-fonte" title="Cartilha Nação Angola">&#9670;</span>' : ""}
            <p>${esc(d.sentido)}</p>
            <small>${esc(ASSUNTOS[d.cat])}</small>
          </div>
          ${botaoOuvir(d.termo, `${d.termo}. ${d.sentido}`, null, "", "redondo")}
        </div>`).join("");
      if (!achados.length) $("#dic-contagem").textContent = "Nenhuma palavra encontrada.";
      marcarTocando();
    };
    $("#busca-dic").oninput = desenhar;
    document.querySelectorAll("[data-cat]").forEach((b) => {
      b.onclick = () => {
        cat = b.dataset.cat;
        document.querySelectorAll("[data-cat]").forEach((x) => x.classList.toggle("ativo", x === b));
        desenhar();
      };
    });
    desenhar();
  }

  function ligarCantigas() {
    const busca = $("#busca-cantiga");
    if (!busca) return;
    const norm = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    let soCasa = false;
    let grupo = "";
    const filtrar = () => {
      const q = norm(busca.value.trim());
      document.querySelectorAll(".grupo-cantigas").forEach((g) => {
        let visiveis = 0;
        const doGrupo = !grupo || g.dataset.grupo === grupo;
        g.querySelectorAll(".cantiga").forEach((c) => {
          const ok = doGrupo && (!soCasa || c.classList.contains("da-casa")) && (!q || norm(c.textContent + " " + g.querySelector("h2").textContent).includes(q));
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
      filtrar();
    };
    document.querySelectorAll("[data-grupo-filtro]").forEach((b) => {
      b.onclick = () => {
        grupo = b.dataset.grupoFiltro;
        document.querySelectorAll("[data-grupo-filtro]").forEach((x) => x.classList.toggle("ativo", x === b));
        filtrar();
      };
    });
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
      $("#ap-progresso").innerHTML = lista.length ? `<span class="pequeno">Você já aprendeu <b>${feitas}</b> de ${lista.length} cantigas desta lista.</span>
        <div class="progresso-barra"><i style="width:${(feitas / lista.length) * 100}%"></i></div>` : "";
      if (!lista.length) { caixa.innerHTML = provisorio("Nenhuma cantiga nesta lista."); return; }
      pos = (pos + lista.length) % lista.length;
      const { c, ink, chave } = lista[pos];
      const sabe = !!aprendidas[chave];
      caixa.innerHTML = `<div class="aprender-cartao">
          <p class="sobre">Cantiga ${pos + 1} de ${lista.length} · <a class="link" href="#/inkices/${ink.id}">${esc(ink.nome)}</a></p>
          ${cartaoCantiga(c, ink.nome, chave)}
          <button class="botao${sabe ? " ativo" : ""}" id="ap-sei" aria-pressed="${sabe}">${sabe ? `${ui("check")}Já aprendi` : "Marcar como aprendida"}</button>
          <div class="aprender-nav">
            <button class="botao" id="ap-ant">${ui("voltar")}Anterior</button>
            <button class="botao" id="ap-sorte">Sortear</button>
            <button class="botao" id="ap-prox">Próxima${ui("seta")}</button>
          </div>
        </div>`;
      $("#ap-sei").onclick = () => { if (sabe) delete aprendidas[chave]; else aprendidas[chave] = true; salvarAprendidas(); desenhar(); };
      $("#ap-ant").onclick = () => { pos--; desenhar(); };
      $("#ap-prox").onclick = () => { pos++; desenhar(); };
      $("#ap-sorte").onclick = () => { pos = Math.floor(Math.random() * lista.length); desenhar(); };
      marcarTocando();
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
          : provisorio(`Nada encontrado para "${busca.value}".`, true);
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
  visor.innerHTML = `<button class="visor-fechar" aria-label="Fechar">${ui("x")}</button>
    <button class="visor-nav ant" aria-label="Foto anterior">${ui("voltar")}</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button class="visor-nav prox" aria-label="Próxima foto">${ui("seta")}</button>`;
  document.body.appendChild(visor);
  let fotoAtual = 0;
  let fotosVisor = GALERIA;
  function mostrarFoto(i) {
    fotoAtual = (i + fotosVisor.length) % fotosVisor.length;
    const g = fotosVisor[fotoAtual];
    $("img", visor).src = g.foto;
    $("img", visor).alt = g.legenda;
    $("figcaption", visor).textContent = `${g.legenda} (${fotoAtual + 1} de ${fotosVisor.length})`;
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
    if (!b) return;
    const album = ALBUNS.find((a) => a.id === b.dataset.album);
    fotosVisor = album ? album.fotos : GALERIA;
    mostrarFoto(+b.dataset.foto);
  });
  window.addEventListener("hashchange", () => { visor.hidden = true; });

  // A barra de baixo usa os mesmos desenhos dos atalhos.
  const ICONES_ABAS = { inicio: "terreiro", inkices: "inkices", entidades: "caboclos", calendario: "festas", mais: "dicionario" };
  document.querySelectorAll(".abas a").forEach((a) => {
    const nome = ICONES_ABAS[a.dataset.aba];
    if (nome) a.querySelector("span").innerHTML = ICONES[nome]();
  });

  $("#voltar").onclick = () => history.back();
  window.addEventListener("hashchange", rota);
  rota();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
