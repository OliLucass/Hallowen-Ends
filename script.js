/* Halloween 2026 — versão compartilhada
   1) Crie a tabela usando o supabase.sql fornecido.
   2) Preencha SUPABASE_URL e SUPABASE_ANON_KEY abaixo.
   3) Os dois acessos usam a mesma sessão compartilhada.
*/

const SUPABASE_URL = "https://umadhvkiqiiogjekaxtd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xXd5uRn_TWZ0nZn39poKRQ_ldWnao2I";
const TABLE = "halloween_state";
const ROW_ID = 1;

const DEF = { names: ["Eu", "Você"], days: {} };
let S = structuredClone(DEF);

const ready = SUPABASE_URL.startsWith("https://") && !SUPABASE_ANON_KEY.startsWith("COLE_");
const sb = ready ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let syncing = false;
let saveTimer = null;
let lastRemoteJson = "";

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const st = d => (S.days[d] ??= { w: [false, false], r: [0, 0], c: ["", ""], pick: null, img: {} });
const done = d => st(d).w[0] && st(d).w[1];
const TL = { filme: "🎬 Filme", serie: "📺 Série", curta: "🎞️ Curta", curinga: "🎲 Noite Coringa" };
let filter = "all";

function normalizeState(value) {
  const x = value && typeof value === "object" ? value : {};
  x.names = Array.isArray(x.names) ? x.names : [...DEF.names];
  x.names[0] = x.names[0] || "Eu";
  x.names[1] = x.names[1] || "Você";
  x.days = x.days && typeof x.days === "object" ? x.days : {};
  return x;
}

function setStatus(text, kind = "") {
  const el = $("syncStatus");
  if (!el) return;
  el.textContent = text;
  el.className = "sync-status " + kind;
}

async function loadRemote() {
  if (!sb) {
    setStatus("⚠️ Configure o Supabase", "warn");
    return;
  }
  setStatus("☁️ Conectando...", "loading");
  const { data, error } = await sb.from(TABLE).select("state").eq("id", ROW_ID).maybeSingle();
  if (error) {
    console.error(error);
    setStatus("⚠️ Erro ao conectar", "error");
    return;
  }
  if (data?.state) S = normalizeState(data.state);
  lastRemoteJson = JSON.stringify(S);
  setStatus("☁️ Sincronizado", "ok");
  render();
  updateNamesInputs();
}

async function saveRemote() {
  if (!sb || syncing) return;
  syncing = true;
  setStatus("☁️ Salvando...", "loading");
  const payload = { id: ROW_ID, state: S, updated_at: new Date().toISOString() };
  const { error } = await sb.from(TABLE).upsert(payload, { onConflict: "id" });
  syncing = false;
  if (error) {
    console.error(error);
    setStatus("⚠️ Erro ao salvar", "error");
    return;
  }
  lastRemoteJson = JSON.stringify(S);
  setStatus("☁️ Sincronizado", "ok");
}

function save() {
  if (!sb) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveRemote, 350);
}

function refresh() { save(); render(); }

function updateNamesInputs() {
  [0, 1].forEach(i => {
    const el = $("n" + i);
    if (el && document.activeElement !== el) el.value = S.names[i];
  });
}

// Itens efetivos do dia (Noite Coringa usa a escolha salva)
const items = d => PROGRAM[d].joker ? (st(d).pick ? [st(d).pick] : []) : PROGRAM[d].items;
const FILTERS = [["all", "Mostrar tudo"], ["filme", "🎬 Filmes"], ["serie", "📺 Séries"], ["curta", "🎞️ Curtas"], ["joker", "🎲 Noites Coringa"], ["done", "✅ Assistidos"], ["todo", "⏳ Não assistidos"]];
function match(d) {
  if (filter === "all") return true;
  if (filter === "joker") return !!PROGRAM[d].joker;
  if (filter === "done") return done(d);
  if (filter === "todo") return !done(d);
  return items(d).some(i => i.type === filter);
}
function card(d) {
  const p = PROGRAM[d], s = st(d);
  let h = `<span class="n">${d}</span>`;
  if (p.joker && !s.pick) h += `<div class="jk">🎲 NOITE CORINGA</div><div class="it">“Hoje vocês escolhem!”</div>`;
  else {
    if (p.joker) h += ` <span class="tg">🎲 Coringa</span>`;
    if (p.special) h += `<div class="jk" style="color:var(--orange)">🎃 O ESTRANHO MUNDO DE JACK 🎃</div>`;
    items(d).forEach((i, k) => {
      const im = s.img[k]; if (im) h += `<img class="thumb" src="${esc(im)}" alt="" onerror="this.remove()">`;
      if (!p.special) h += `<div class="it"><b>${esc(i.title)}</b>${i.sub ? `<small>${esc(i.sub)}</small>` : ""}<small>${TL[i.type]}${i.anim ? " · Animação" : ""}${i.eps ? " · " + esc(i.eps) : ""}</small></div>`;
    });
  }
  return h;
}
function render() {
  const first = new Date(2026, 9, 1).getDay();
  let h = '<div class="day pad"></div>'.repeat(first);
  for (let d = 1; d <= 31; d++) {
    const p = PROGRAM[d];
    h += `<button class="day${p.joker ? " joker" : ""}${p.special ? " special" : ""}${done(d) ? " done" : ""}${match(d) ? "" : " off"}" data-d="${d}" aria-label="Dia ${d}">${card(d)}</button>`;
  }
  $("cal").innerHTML = h;
  const n = Object.keys(PROGRAM).filter(d => done(d)).length, pct = Math.round(n / 31 * 100);
  $("sDone").textContent = n; $("sLeft").textContent = 31 - n;
  $("pTxt").textContent = `${n} / 31 noites concluídas`; $("pBar").style.width = pct + "%"; $("pPct").textContent = pct + "%";
  $("filters").innerHTML = FILTERS.map(([k, l]) => `<button data-f="${k}" class="${filter === k ? "on" : ""}">${l}</button>`).join("");
}
function modal(d) {
  const p = PROGRAM[d], s = st(d); let h = `<h2>📅 ${d} de outubro${p.special ? " 🎃" : ""}</h2>`;
  if (p.joker) {
    h += `<p>🎲 <b>Noite Coringa</b> — ${s.pick ? "escolha feita:" : "“Hoje vocês escolhem!”"}</p>
    <input type="text" id="jt" placeholder="Título do filme ou série" value="${esc(s.pick?.title)}">
    <select id="jy">${["filme", "serie", "curta"].map(t => `<option value="${t}"${s.pick?.type === t ? " selected" : ""}>${TL[t]}</option>`).join("")}</select>
    <div class="row"><button class="btn pri" id="jsave">💾 Salvar escolha</button>${s.pick ? `<button class="btn" id="jclr">↩️ Voltar a escolher</button>` : ""}</div>`;
  }
  if (p.note) h += `<p class="note">${esc(p.note)}</p>`;
  items(d).forEach((i, k) => {
    h += `<div class="itembox"><b>${esc(i.title)}</b>${i.sub ? `<small>${esc(i.sub)}</small>` : ""}${i.eps ? `<small>${esc(i.eps)}</small>` : ""}</div>`;
    if (s.img[k] !== undefined || true) h += `<input class="cover" data-img="${k}" placeholder="URL da capa (opcional)" value="${esc(s.img[k] || "")}">`;
  });
  h += `<div class="both"><button class="btn pri" id="both">${done(d) ? "↩️ Desmarcar os dois" : "✅ Marcar os dois como assistido"}</button></div>`;
  [0, 1].forEach(i => {
    h += `<div class="person"><h3>👤 ${esc(S.names[i])}</h3><label class="check"><input type="checkbox" data-w="${i}" ${s.w[i] ? "checked" : ""}> Assistido</label><div class="stars" data-p="${i}">${[1,2,3,4,5].map(n => `<button data-r="${n}" class="${s.r[i] >= n ? "on" : ""}" aria-label="${n} estrelas">★</button>`).join("")}</div><textarea rows="2" data-c="${i}" placeholder="Comentário...">${esc(s.c[i])}</textarea></div>`;
  });
  $("mBody").innerHTML = h; $("modal").hidden = false; $("modal").dataset.d = d;
}
const cur = () => +$("modal").dataset.d;

$("cal").onclick = e => { const b = e.target.closest(".day[data-d]"); if (b) modal(+b.dataset.d); };
$("filters").onclick = e => { const b = e.target.closest("[data-f]"); if (b) { filter = b.dataset.f; render(); } };
$("close").onclick = () => $("modal").hidden = true;
$("modal").onclick = e => { if (e.target.id === "modal") $("modal").hidden = true; };
document.onkeydown = e => { if (e.key === "Escape") $("modal").hidden = true; };
$("mBody").onclick = e => {
  const d = cur(), s = st(d), t = e.target;
  if (t.id === "jsave") { const v = $("jt").value.trim(); if (!v) return $("jt").focus(); s.pick = { title: v, type: $("jy").value }; refresh(); modal(d); }
  else if (t.id === "jclr") { if (confirm("Voltar a Noite Coringa? Nota e marcações deste dia serão apagadas.")) { S.days[d] = undefined; delete S.days[d]; refresh(); modal(d); } }
  else if (t.id === "both") { const v = !done(d); s.w = [v, v]; refresh(); modal(d); }
  else if (t.dataset.r) { const i = +t.parentElement.dataset.p, n = +t.dataset.r; s.r[i] = s.r[i] === n ? 0 : n; refresh(); modal(d); }
};
$("mBody").onchange = e => { const d = cur(), s = st(d), t = e.target;
  if (t.dataset.w !== undefined) { s.w[+t.dataset.w] = t.checked; refresh(); modal(d); }
};
$("mBody").oninput = e => { const d = cur(), s = st(d), t = e.target;
  if (t.dataset.c !== undefined) s.c[+t.dataset.c] = t.value;
  if (t.dataset.img !== undefined) s.img[+t.dataset.img] = t.value.trim();
  save();
};
[0, 1].forEach(i => { const el = $("n" + i); el.value = S.names[i]; el.oninput = () => { S.names[i] = el.value || (i ? "Você" : "Eu"); save(); }; });

$("wk").innerHTML = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(x => `<div>${x}</div>`).join("");

const fx = $("fx");
function spawn(cls, txt, css, ms) { const e = document.createElement("span"); e.className = cls; e.textContent = txt; Object.assign(e.style, css); fx.appendChild(e); setTimeout(() => e.remove(), ms); }
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setInterval(() => spawn("bat", "🦇", { top: 5 + Math.random() * 30 + "%" }, 9500), 14000);
  setInterval(() => spawn("leaf", Math.random() > .5 ? "🍂" : "🍁", { left: Math.random() * 100 + "%", animationDuration: 10 + Math.random() * 8 + "s" }, 19000), 3500);
  setInterval(() => spawn("ghost", "👻", { left: 5 + Math.random() * 85 + "%" }, 4200), 25000);
}

// Realtime: quando uma pessoa altera algo, a outra recebe automaticamente.
async function startRealtime() {
  if (!sb) return;
  sb.channel("halloween-2026-shared")
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: TABLE, filter: "id=eq.1" }, payload => {
      const incoming = JSON.stringify(payload.new.state || {});
      if (incoming === lastRemoteJson) return;
      S = normalizeState(payload.new.state);
      lastRemoteJson = JSON.stringify(S);
      render();
      updateNamesInputs();
      setStatus("☁️ Atualizado agora", "ok");
    })
    .subscribe(status => {
      if (status === "SUBSCRIBED") setStatus("☁️ Sincronizado em tempo real", "ok");
    });
}

render();
loadRemote().then(startRealtime);
