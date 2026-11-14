document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll("nav .nav-link, nav a");
    if (!links.length) return;

    const usaHash = Array.from(links).some(l =>
        l.getAttribute("href")?.startsWith("#")
    );

    // ---------------------------------------------------------
    // 1) Marcar un enlace como activo (y limpiar los demás)
    // ---------------------------------------------------------
    function marcarActivo(enlace) {
        if (!enlace) return;
        links.forEach(function (item) {
            item.classList.remove("active");
            item.removeAttribute("aria-current");
        });
        enlace.classList.add("active");
        enlace.setAttribute("aria-current", "page");
    }

    // ---------------------------------------------------------
    // 2) Click en cualquier enlace del menú
    // ---------------------------------------------------------
    links.forEach(function (enlace) {
        enlace.addEventListener("click", function () {
            marcarActivo(enlace);
        });
    });

    // ---------------------------------------------------------
    // 3) Detección inicial (data-page → hash → primero)
    // ---------------------------------------------------------
    const currentPage = document.body.dataset.page;
    let inicialMarcado = false;

    if (currentPage) {
        const porDataPage = document.querySelector(
            'nav .nav-link[data-page="' + currentPage + '"], nav a[data-page="' + currentPage + '"]'
        );
        if (porDataPage) {
            marcarActivo(porDataPage);
            inicialMarcado = true;
        }
    }

    const hashActual = window.location.hash;
    if (!inicialMarcado && hashActual && hashActual !== "#") {
        const porHash = document.querySelector(
            'nav .nav-link[href="' + hashActual + '"], nav a[href="' + hashActual + '"]'
        );
        if (porHash) {
            marcarActivo(porHash);
            inicialMarcado = true;
        }
    }

    if (!inicialMarcado) marcarActivo(links[0]);

    // ---------------------------------------------------------
    // 4) SCROLL-SPY — solo si hay enlaces con hash (#seccion)
    // ---------------------------------------------------------
    if (!usaHash) return;

    const secciones = Array.from(links)
        .map(l => {
            const href = l.getAttribute("href");
            if (!href || !href.startsWith("#") || href === "#") return null;
            const el = document.querySelector(href);
            return el ? { enlace: l, seccion: el } : null;
        })
        .filter(Boolean);

    if (!secciones.length) return;

    const visibles = new Map();

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                if (entry.isIntersecting) {
                    visibles.set(id, entry.intersectionRatio);
                } else {
                    visibles.delete(id);
                }
            });

            if (visibles.size) {
                let mejorId = null;
                let mejorRatio = -1;
                visibles.forEach((ratio, id) => {
                    if (ratio > mejorRatio) {
                        mejorRatio = ratio;
                        mejorId = id;
                    }
                });
                const elegido = secciones.find(s => s.seccion.id === mejorId);
                if (elegido) marcarActivo(elegido.enlace);
            }
        },
        {
            rootMargin: "-90px 0px -55% 0px",
            threshold: [0, 0.15, 0.35, 0.55, 0.75, 1]
        }
    );

    secciones.forEach(s => observer.observe(s.seccion));

    // ---------------------------------------------------------
    // 5) Refuerzo: al llegar al fondo, activar el último enlace
    // ---------------------------------------------------------
    window.addEventListener("scroll", function () {
        const alFinal =
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 5;

        if (alFinal && secciones.length) {
            marcarActivo(secciones[secciones.length - 1].enlace);
        }
    }, { passive: true });
});