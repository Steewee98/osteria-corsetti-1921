// Osteria Corsetti 1921, bozza del sito: menu sul telefono, comparse, moduli (senza invio reale), schede del menù.
(() => {
  document.documentElement.classList.add("js");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Testata: bordo quando la pagina non è più in cima (sentinella, niente ascolto dello scroll)
  const IO = "IntersectionObserver" in window;
  const testata = $(".testata"), sentinella = $("#cima");
  if (IO && testata && sentinella) {
    new IntersectionObserver(([e]) => testata.classList.toggle("giu", !e.isIntersecting)).observe(sentinella);
  }

  // Menu sul telefono
  const bott = $(".apri-menu"), nav = $(".testata nav");
  if (bott && nav) {
    const chiudi = () => { nav.classList.remove("aperto"); bott.setAttribute("aria-expanded", "false"); };
    bott.addEventListener("click", () => {
      const aperto = nav.classList.toggle("aperto");
      bott.setAttribute("aria-expanded", String(aperto));
    });
    $$("a", nav).forEach(a => a.addEventListener("click", chiudi));
    document.addEventListener("keydown", e => { if (e.key === "Escape") chiudi(); });
  }

  // Comparsa delle sezioni quando entrano nello schermo
  const daVedere = $$(".appare");
  if (IO) {
    const oss = new IntersectionObserver(voci => voci.forEach(v => {
      if (v.isIntersecting) { v.target.classList.add("visto"); oss.unobserve(v.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    daVedere.forEach(el => oss.observe(el));
  } else daVedere.forEach(el => el.classList.add("visto"));

  // Data minima = oggi (ora locale)
  $$('input[type="date"]').forEach(i => {
    const d = new Date(), p = n => String(n).padStart(2, "0");
    i.min = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  });

  // Moduli: controllo dei campi obbligatori, poi messaggio di conferma.
  // BOZZA: qui andrà la chiamata al registro prenotazioni; ora non parte nessun dato.
  $$("form[data-modulo]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      let primo = null;
      $$(".campo", form).forEach(c => {
        c.classList.remove("no");
        $$("input,select,textarea", c).forEach(x => x.removeAttribute("aria-invalid"));
        // obbligatori, più i facoltativi già compilati (es. email scritta male)
        const campi = $$("input,select,textarea", c).filter(x => x.required || (x.type !== "radio" && x.value.trim() !== ""));
        if (!campi.length) return;
        const valido = x => {
          if (x.type === "radio") return $$("input[type=radio]", c).some(r => r.checked);
          if (x.dataset.tel !== undefined) return x.value.replace(/\D/g, "").length >= 6 && /^[0-9 +().\/-]+$/.test(x.value.trim());
          return x.checkValidity() && (!x.required || x.value.trim() !== "");
        };
        const ok = campi.every(valido);
        c.classList.toggle("no", !ok);
        campi.forEach(x => x.setAttribute("aria-invalid", String(!ok)));
        if (!ok && !primo) primo = campi[0];
      });
      if (primo) { primo.focus(); return; }
      const box = form.closest(".modulo");
      box.classList.add("inviato");
      const esito = $(".esito", box);
      if (esito) { esito.setAttribute("tabindex", "-1"); esito.focus(); }
    });
    form.addEventListener("input", e => {
      const c = e.target.closest(".campo");
      if (c && c.classList.contains("no")) c.classList.remove("no");
    });
  });

  // Pagina menù: la scheda della portata visibile si accende
  const schede = $$(".schede-menu a");
  if (IO && schede.length) {
    const perId = new Map(schede.map(a => [a.hash.slice(1), a]));
    const oss = new IntersectionObserver(voci => voci.forEach(v => {
      if (!v.isIntersecting) return;
      schede.forEach(a => a.classList.remove("on"));
      const a = perId.get(v.target.id);
      if (a) { a.classList.add("on"); a.parentElement.parentElement.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" }); }
    }), { rootMargin: "-140px 0px -65% 0px" });
    $$(".portata").forEach(s => oss.observe(s));
  }
})();
