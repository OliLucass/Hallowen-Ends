// Programação oficial — outubro/2026. Não altere títulos sem querer.
// type: filme | serie | curta | curinga   |  anim: true = animação
const I = (title, type, extra = {}) => ({ title, type, ...extra });
const OSAJ = (eps, sub) => I("O Segredo Além do Jardim", "serie", { eps, anim: true, sub });
const CRY = () => I("Crystal Lake", "serie", { eps: "2 episódios" });
const JOKER = { joker: true, items: [] };
const PROGRAM = {
  1: { items: [OSAJ("2 episódios")] },
  2: { items: [I("Supernatural", "serie", { sub: "“It's the Great Pumpkin, Sam Winchester” — T4E7" })] },
  3: { items: [I("Halloween: A Noite do Terror", "filme")] },
  4: JOKER,
  5: { items: [OSAJ("2 episódios")] },
  6: { items: [I("Alma (2009)", "curta", { anim: true }), I("La Noria (2018)", "curta", { anim: true })], note: "Ambos são curtas." },
  7: { items: [I("Junji Ito Collection (2018)", "serie", { eps: "2 episódios", anim: true })] },
  8: { items: [I("Uzumaki", "serie", { eps: "2 episódios", anim: true })] },
  9: { items: [I("ParaNorman", "filme", { anim: true })] },
  10: { items: [I("Pânico", "filme")] },
  11: JOKER,
  12: { items: [OSAJ("2 episódios"), I("Histórias Macabras do Japão", "serie", { eps: "2 episódios", anim: true })] },
  13: { items: [I("Saka Men", "curta"), I("Other Side of the Box", "curta")], note: "Ambos são curtas." },
  14: { items: [I("Apenas um Show", "serie", { sub: "Contos de Terror do Parque — T3E4", anim: true }), I("Bob Esponja", "serie", { sub: "Turno da Noite — T2E16", anim: true })] },
  15: { items: [I("O Incrível Mundo de Gumball", "serie", { sub: "“O Halloween” — T2E8", anim: true }), I("Os Simpsons", "serie", { sub: "“A Casa da Árvore dos Horrores” — T6E6", anim: true })] },
  16: { items: [I("Sexta-Feira 13", "filme")] },
  17: { items: [CRY()] },
  18: JOKER,
  19: { items: [OSAJ("2 episódios")] },
  20: { items: [I("A Maldição da Residência Hill", "serie", { eps: "1 episódio" })] },
  21: { items: [I("O Gabinete de Curiosidades de Guillermo del Toro", "serie", { sub: "T1E3" })] },
  22: { items: [I("Into the Dark", "serie", { sub: "T1E11" })] },
  23: { items: [I("O Massacre da Serra Elétrica", "filme")] },
  24: { items: [CRY()] },
  25: JOKER,
  26: { items: [I("Black Mirror", "serie", { sub: "T3E3" })] },
  27: { items: [OSAJ("Episódios finais")] },
  28: { items: [CRY()] },
  29: { items: [CRY()] },
  30: { items: [I("O Massacre da Serra Elétrica", "filme")] },
  31: { special: true, items: [I("O Estranho Mundo de Jack", "filme", { anim: true })] },
};
