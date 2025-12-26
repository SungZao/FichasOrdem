const fotoIcon = document.getElementById("fotoIcon");
const uploadInput = document.getElementById("uploadFoto");

fotoIcon.onclick = async () => {
  const url = prompt(
    "Cole o link da imagem (Imgur ou outro site)\n" +
    "Ex: https://i.imgur.com/abcd123.webp"
  );

  if (!url) return;

  if (!url.startsWith("http")) {
    alert("URL inválida");
    return;
  }
  const permitidos = ["imgur.com", "i.imgur.com"];

if (!permitidos.some(d => url.includes(d))) {
  alert("Use apenas links do Imgur");
  return;
}


  // atualiza visualmente
  fotoIcon.src = url;

  // salva no Firestore
  await personagemRef.set({ fotoURL: url }, { merge: true });
};





// Pega o ID da ficha da URL
const urlParams = new URLSearchParams(window.location.search);
const idFicha = urlParams.get("doc") || "perso1"; // padrão perso1 se nada for passado

// Usa o ID para o Firestore
const personagemRef = db.collection("personagens").doc(idFicha);



let escrevendoLocal = false;
const anotacoesInput = document.getElementById("anotacoes");



// ====== FIREBASE ======


// ====== ESTADO ======
let fichaAtual = {};
let pericias = [];
let habilidades = [];
let rituais = [];
let itens = [];



// ====== ELEMENTOS ======
const modalRitual = document.getElementById("modalRitual");
const btnNovoRitual = document.getElementById("btnNovoRitual");
const salvarRitual = document.getElementById("salvarRitual");

const ritNome = document.getElementById("ritNome");
const ritPE = document.getElementById("ritPE");
const ritExec = document.getElementById("ritExec");
const ritAlcance = document.getElementById("ritAlcance");
const ritAlvo = document.getElementById("ritAlvo");
const ritDuracao = document.getElementById("ritDuracao");
const ritDesc = document.getElementById("ritDesc");

const modalHabilidade = document.getElementById("modalHabilidade");
const btnNovaHabilidade = document.getElementById("btnNovaHabilidade");
const salvarHabilidade = document.getElementById("salvarHabilidade");

const habNome = document.getElementById("habNome");
const habDesc = document.getElementById("habDesc");

const modalPericias = document.getElementById("modalPericias");
const opcoesPericias = document.getElementById("opcoesPericias");
const btnNovaPericia = document.getElementById("btnNovaPericia");

const nomeInput = document.getElementById("nome");
const nexInput  = document.getElementById("nex");

const jogadorInput = document.getElementById("jogador");
const origemInput  = document.getElementById("origem");
const classeInput  = document.getElementById("classe");
const defesaInput = document.getElementById("defesa");


const atributosInputs = {
  for: document.getElementById("for"),
  agi: document.getElementById("agi"),
  int: document.getElementById("int"),
  pre: document.getElementById("pre"),
  vig: document.getElementById("vig")
};


const TODAS_PERICIAS = [
  "Acrobacia (AGI)",
  "Adestramento (PRE)",
  "Artes (INT)",
  "Atletismo (FOR)",
  "Atualidades (INT)",
  "Ciências (INT)",
  "Crime (AGI)",
  "Diplomacia (PRE)",
  "Enganação (PRE)",
  "Fortitude (VIG)",
  "Furtividade (AGI)",
  "Iniciativa (AGI)",
  "Intimidação (PRE)",
  "Investigação (INT)",
  "Luta (FOR)",
  "Medicina (INT)",
  "Ocultismo (INT)",
  "Percepção (PRE)",
  "Pilotagem (AGI)",
  "Pontaria (AGI)",
  "Profissão (INT)",
  "Reflexos (AGI)",
  "Religião (INT)",
  "Sobrevivência (INT)",
  "Tecnologia (INT)",
  "Vontade (PRE)"
];




// ====== UTIL ======
function numSeguro(valor, fallback = 0) {
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

// ====== STATS ======
const stats = {
  vida: { atual: 0, max: 1 },
  sanidade: { atual: 0, max: 1 },
  esforco: { atual: 0, max: 1 }
};

// ====== SNAPSHOT (REALTIME) ======
personagemRef.onSnapshot(doc => {
  if (!doc.exists) return;
  if (escrevendoLocal) return;

  fichaAtual = doc.data();

  pericias    = fichaAtual.pericias || [];
  habilidades = fichaAtual.habilidades || [];
  rituais     = fichaAtual.rituais || [];
  itens = fichaAtual.itens || [];



  renderItens();
  renderPericias();
  renderHabilidades();
  renderRituais();

  preencherTudo();

if (fichaAtual.fotoURL) {
  fotoIcon.src = fichaAtual.fotoURL;
}


});

// ====== PREENCHER ======
function preencherTudo() {
  nomeInput.value = fichaAtual.nome || "";
  nexInput.value  = fichaAtual.nex || 0;

  jogadorInput.value = fichaAtual.jogador || "";
  origemInput.value  = fichaAtual.origem || "";
  classeInput.value  = fichaAtual.classe || "";
  anotacoesInput.value = fichaAtual.anotacoes || "";

  defesaInput.value = numSeguro(fichaAtual.defesa, 0);


  const atr = fichaAtual.atributos || {};
  Object.keys(atributosInputs).forEach(k => {
    atributosInputs[k].value = numSeguro(atr[k], 0);
  });

  ["vida","sanidade","esforco"].forEach(stat => {
    stats[stat].atual = numSeguro(fichaAtual[stat + "Atual"], 0);
    stats[stat].max   = numSeguro(fichaAtual[stat + "Max"], 1);
    updateStat(stat);
  });
}

// ====== COLETAR ======
function coletarTudo() {
  fichaAtual.nome = nomeInput.value;
  fichaAtual.nex  = numSeguro(nexInput.value, 0);

  fichaAtual.jogador = jogadorInput.value;
  fichaAtual.origem  = origemInput.value;
  fichaAtual.classe  = classeInput.value;

  fichaAtual.defesa = numSeguro(defesaInput.value, 0);
  fichaAtual.pericias = pericias;
  fichaAtual.habilidades = habilidades;
  fichaAtual.rituais = rituais;
  fichaAtual.itens = itens;
  fichaAtual.anotacoes = anotacoesInput.value;





  fichaAtual.atributos = {};
  Object.keys(atributosInputs).forEach(k => {
    fichaAtual.atributos[k] = numSeguro(atributosInputs[k].value, 0);
  });

  ["vida","sanidade","esforco"].forEach(stat => {
    fichaAtual[stat + "Atual"] = numSeguro(stats[stat].atual, 0);
    fichaAtual[stat + "Max"]   = numSeguro(stats[stat].max, 1);
  });
}

// ====== STATS UI ======
function updateStat(nome) {
  const s = stats[nome];

  s.atual = numSeguro(s.atual, 0);
  s.max   = numSeguro(s.max, 1);

  document.getElementById(nome + "Atual").value = s.atual;
  document.getElementById(nome + "Max").value   = s.max;

  const fill = document.getElementById(nome + "Fill");
  fill.style.width = Math.min((s.atual / s.max) * 100, 100) + "%";
}

function bindStat(nome) {
  const atual = document.getElementById(nome + "Atual");
  const max   = document.getElementById(nome + "Max");

  atual.oninput = () => {
    stats[nome].atual = numSeguro(atual.value, 0);
    updateStat(nome);
    salvarAuto();
  };

  max.oninput = () => {
    stats[nome].max = numSeguro(max.value, 1);
    if (stats[nome].atual > stats[nome].max) {
      stats[nome].atual = stats[nome].max;
    }
    updateStat(nome);
    salvarAuto();
  };
}

["vida","sanidade","esforco"].forEach(bindStat);

// ====== BOTÕES + / - ======
function changeStat(nome, delta) {
  const s = stats[nome];
  if (!s) return;

  s.atual = Math.max(0, s.atual + delta);
  updateStat(nome);
  salvarAuto();
}

// ====== AUTO SAVE ======
let saveTimeout = null;

function salvarAuto() {
  escrevendoLocal = true;

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    coletarTudo();
    try {
      await personagemRef.set(fichaAtual, { merge: true });
    } catch (e) {
      console.error("Erro ao salvar:", e);
    } finally {
      escrevendoLocal = false;
    }
  }, 300);
}

// ====== INPUTS ======
document.querySelectorAll("input, textarea").forEach(el => {
  el.addEventListener("input", salvarAuto);
});


// ====== TABS ======
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // desativa todos
    document.querySelectorAll(".tab-btn").forEach(b =>
      b.classList.remove("active")
    );
    document.querySelectorAll(".tab-content").forEach(tab =>
      tab.classList.remove("active")
    );

    // ativa o clicado
    btn.classList.add("active");
    const alvo = btn.dataset.tab;
    document.getElementById(alvo).classList.add("active");
  });
});
function renderPericias() {
  const lista = document.getElementById("listaPericias");
  lista.innerHTML = "";

  pericias.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "pericia-item";

    div.innerHTML = `
      <input type="text" value="${p.nome || ""}" placeholder="Nome">
      <input type="number" value="${p.bonus || 0}" placeholder="Bônus">
    `;

    const [nomeInput, bonusInput] = div.querySelectorAll("input");

    nomeInput.addEventListener("input", () => {
      pericias[index].nome = nomeInput.value;
      salvarAuto();
    });

    bonusInput.addEventListener("input", () => {
      pericias[index].bonus = Number(bonusInput.value) || 0;
      salvarAuto();
    });

    lista.appendChild(div);
  });
}
function renderHabilidades() {
  const lista = document.getElementById("listaHabilidades");
  lista.innerHTML = "";

  habilidades.forEach((h, index) => {
    const div = document.createElement("div");
    div.className = "habilidade-item";

    div.innerHTML = `
      <input type="text" value="${h.nome || ""}" placeholder="Nome">
      <textarea placeholder="Descrição">${h.desc || ""}</textarea>
    `;

    const nome = div.querySelector("input");
    const desc = div.querySelector("textarea");

    nome.addEventListener("input", () => {
      habilidades[index].nome = nome.value;
      salvarAuto();
    });

    desc.addEventListener("input", () => {
      habilidades[index].desc = desc.value;
      salvarAuto();
    });

    lista.appendChild(div);
  });
}
function renderRituais() {
  const lista = document.getElementById("listaRituais");
  lista.innerHTML = "";

  rituais.forEach((r, index) => {
    const div = document.createElement("div");
    div.className = "ritual-item";

    div.innerHTML = `
      <input type="text" value="${r.nome || ""}" placeholder="Nome">
      <input type="number" value="${r.pe || 0}" placeholder="PE">
      <textarea placeholder="Descrição">${r.desc || ""}</textarea>
    `;

    const [nome, pe] = div.querySelectorAll("input");
    const desc = div.querySelector("textarea");

    nome.addEventListener("input", () => {
      rituais[index].nome = nome.value;
      salvarAuto();
    });

    pe.addEventListener("input", () => {
      rituais[index].pe = Number(pe.value) || 0;
      salvarAuto();
    });

    desc.addEventListener("input", () => {
      rituais[index].desc = desc.value;
      salvarAuto();
    });

    lista.appendChild(div);
  });
}
btnNovaPericia.addEventListener("click", () => {
  opcoesPericias.innerHTML = "";

  TODAS_PERICIAS
    .filter(p => !pericias.some(x => x.nome === p))
    .forEach(p => {
      const btn = document.createElement("button");
      btn.textContent = p;

      btn.onclick = () => {
        adicionarPericia(p);
      };

      opcoesPericias.appendChild(btn);
    });

  modalPericias.classList.add("active");
});
function adicionarPericia(nome) {
  pericias.push({
    nome,
    bonus: 0
  });

  modalPericias.classList.remove("active");
  renderPericias();
  salvarAuto();
}
modalPericias.addEventListener("click", e => {
  if (e.target === modalPericias) {
    modalPericias.classList.remove("active");
  }
});
function renderPericias() {
  const lista = document.getElementById("listaPericias");
  lista.innerHTML = "";

  pericias.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "pericia-item";

    div.innerHTML = `
      <span>${p.nome}</span>
      <input type="number" value="${p.bonus || 0}">
    `;

    const input = div.querySelector("input");
    input.addEventListener("input", () => {
      pericias[index].bonus = Number(input.value) || 0;
      salvarAuto();
    });

    lista.appendChild(div);
  });
}
btnNovaHabilidade.addEventListener("click", () => {
  modalHabilidade.classList.add("active");
});
salvarHabilidade.addEventListener("click", () => {
  const nome = habNome.value.trim();
  const desc = habDesc.value.trim();

  if (!nome) return;

  habilidades.push({ nome, desc });

  habNome.value = "";
  habDesc.value = "";

  modalHabilidade.classList.remove("active");
  renderHabilidades();
  salvarAuto();
});
modalHabilidade.addEventListener("click", e => {
  if (e.target === modalHabilidade) {
    modalHabilidade.classList.remove("active");
  }
});
function renderHabilidades() {
  const lista = document.getElementById("listaHabilidades");
  lista.innerHTML = "";

  habilidades.forEach((h, index) => {
    const div = document.createElement("div");
    div.className = "card-item";

    div.innerHTML = `
      <div class="card-top">
        <strong>${h.nome}</strong>
        <button class="btn-delete">🗑️</button>
      </div>
      ${h.desc ? `<div class="card-desc">${h.desc}</div>` : ""}
    `;

    div.querySelector(".btn-delete").onclick = () => {
      habilidades.splice(index, 1);
      renderHabilidades();
      salvarAuto();
    };

    lista.appendChild(div);
  });
}
btnNovoRitual.addEventListener("click", () => {
  modalRitual.classList.add("active");
});
salvarRitual.addEventListener("click", () => {
  const ritual = {
    nome: ritNome.value.trim(),
    pe: Number(ritPE.value),
    exec: ritExec.value,
    alcance: ritAlcance.value.trim(),
    alvo: ritAlvo.value.trim(),
    duracao: ritDuracao.value.trim(),
    desc: ritDesc.value.trim()
  };

  if (!ritual.nome || !ritual.pe) return;

  rituais.push(ritual);

  [ritNome, ritPE, ritAlcance, ritAlvo, ritDuracao, ritDesc].forEach(i => i.value = "");
  ritExec.value = "";

  modalRitual.classList.remove("active");
  renderRituais();
  salvarAuto();
});
modalRitual.addEventListener("click", e => {
  if (e.target === modalRitual) {
    modalRitual.classList.remove("active");
  }
});
function renderRituais() {
  const lista = document.getElementById("listaRituais");
  lista.innerHTML = "";

  rituais.forEach((r, index) => {
    const div = document.createElement("div");
    div.className = "card-item";

    div.innerHTML = `
      <div class="card-top">
        <strong>${r.nome}</strong>
        <div class="card-extra">
          PE: ${r.pe}
          ${r.exec ? ` • ${r.exec}` : ""}
          ${r.alcance ? ` • Alcance: ${r.alcance}` : ""}
          ${r.alvo ? ` • Alvo: ${r.alvo}` : ""}
          ${r.duracao ? ` • Duração: ${r.duracao}` : ""}
        </div>
        <button class="btn-delete">🗑️</button>
      </div>
      ${r.desc ? `<div class="card-desc">${r.desc}</div>` : ""}
    `;

    div.querySelector(".btn-delete").onclick = () => {
      rituais.splice(index, 1);
      renderRituais();
      salvarAuto();
    };

    lista.appendChild(div);
  });
}
const btnNovoItem = document.getElementById("btnNovoItem");

btnNovoItem.addEventListener("click", () => {
  abrirModalItem();
});
function abrirModalItem() {
  const modal = document.createElement("div");
  modal.className = "pericias-modal active";

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Novo Item</h3>

      <label>Nome
        <input type="text" id="itemNome">
      </label>

      <label>Espaços
        <input type="number" id="itemEspacos" min="0">
      </label>

      <label>Detalhes
        <textarea id="itemDetalhes" rows="4"></textarea>
      </label>

      <button class="btn-novo" id="salvarItem">Salvar</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", e => {
    if (e.target === modal) modal.remove();
  });

  modal.querySelector("#salvarItem").onclick = () => {
    const nome = modal.querySelector("#itemNome").value.trim();
    const espacos = Number(modal.querySelector("#itemEspacos").value);
    const detalhes = modal.querySelector("#itemDetalhes").value.trim();

    if (!nome || isNaN(espacos)) return;

    itens.push({ nome, espacos, detalhes });

    modal.remove();
    renderItens();
    salvarAuto();
  };
}
function renderItens() {
  const lista = document.getElementById("listaItens");
  lista.innerHTML = "";

  itens.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "card-item";

    div.innerHTML = `
      <div class="card-top">
        <strong>${item.nome}</strong>
        <span>Espaços: ${item.espacos}</span>
        <button class="btn-delete">🗑️</button>
      </div>
      ${item.detalhes ? `<div class="card-desc">${item.detalhes}</div>` : ""}
    `;

    div.querySelector(".btn-delete").onclick = () => {
      itens.splice(index, 1);
      renderItens();
      salvarAuto();
    };

    lista.appendChild(div);
  });
}

const IMGUR_CLIENT_ID = "SEU_CLIENT_ID_AQUI";

uploadInput.onchange = async () => {
  const file = uploadInput.files[0];
  if (!file) return;

  try {
    const blob = await comprimirImagem(file, 512, 0.8);
    const url = await enviarParaImgur(blob);

    // salva no Firestore
    await personagemRef.set({ fotoURL: url }, { merge: true });

    // atualiza na tela
    fotoIcon.src = url;

  } catch (err) {
    console.error(err);
    alert("Erro ao processar imagem");
  }
};



