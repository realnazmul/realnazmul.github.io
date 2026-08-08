/* 
   PORTFOLIO INTERACTIVITY SCRIPT
   Author: Nazmul Hossain
*/

document.addEventListener("DOMContentLoaded", () => {

    /* 
       SCROLL REVEAL ANIMATION
     */
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length > 0) {
        const revealObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        revealEls.forEach(el => revealObserver.observe(el));
    }

    /* 
       SYSTEM-AWARE THEME ENGINE
       Follows OS dark/light preference; toggle overrides manually.
     */
    const themeToggle = document.getElementById("themeToggle");
    const themeLabel  = document.querySelector(".theme-label");
    const systemPref  = window.matchMedia("(prefers-color-scheme: light)");

    function applyTheme(isLight) {
        document.body.classList.toggle("light-mode", isLight);
        if (themeToggle) themeToggle.checked = isLight;
        if (themeLabel)  themeLabel.textContent = isLight ? "Dark Mode" : "Light Mode";
    }

    /* Default: light mode; respect saved preference */
    const savedTheme = localStorage.getItem("theme");
    applyTheme(savedTheme !== null ? savedTheme === "light" : true);

    /* Manual override via toggle — persist choice */
    if (themeToggle) {
        themeToggle.addEventListener("change", () => {
            const isLight = themeToggle.checked;
            applyTheme(isLight);
            localStorage.setItem("theme", isLight ? "light" : "dark");
        });
    }

    /* 
       SKILL BAR ANIMATION
     */
    const skillBars = document.querySelectorAll(".skill-progress");
    const skillsSection = document.getElementById("skills");

    if (skillsSection && skillBars.length > 0) {
        const skillObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        skillBars.forEach(bar => {
                            bar.style.width = bar.dataset.level + "%";
                        });
                        skillObserver.disconnect();
                    }
                });
            },
            { threshold: 0.4 }
        );

        skillObserver.observe(skillsSection);
    }

    /* 
       CONTACT FORM — Web3Forms email delivery
     */
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", async e => {
            e.preventDefault();
            const btn  = contactForm.querySelector(".btn-send");
            const icon = btn.querySelector("i");
            const orig = btn.innerHTML;

            /* Loading state */
            btn.disabled = true;
            icon.className = "fa-solid fa-circle-notch fa-spin";
            btn.childNodes[0].textContent = "Sending… ";

            try {
                const res  = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body:   new FormData(contactForm)
                });
                const data = await res.json();

                if (data.success) {
                    /* Success state */
                    btn.style.setProperty("background",
                        "linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 100%), #34c759",
                        "important"
                    );
                    btn.style.setProperty("box-shadow",
                        "inset 0 1px 0 rgba(255,255,255,.28), 0 4px 14px rgba(52,199,89,.45)",
                        "important"
                    );
                    icon.className = "fa-solid fa-check";
                    btn.childNodes[0].textContent = "Sent! ";
                    contactForm.reset();
                } else {
                    throw new Error("failed");
                }
            } catch {
                /* Error state */
                btn.disabled = false;
                btn.style.setProperty("background",
                    "linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 100%), #ff3b30",
                    "important"
                );
                icon.className = "fa-solid fa-xmark";
                btn.childNodes[0].textContent = "Failed — try again ";
            }

            /* Reset button after 4 s */
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = orig;
                btn.style.removeProperty("background");
                btn.style.removeProperty("box-shadow");
            }, 4000);
        });
    }

    /* 
       NEWSLETTER FORM FEEDBACK
     */
    const newsletterForm = document.getElementById("newsletterForm");
    const newsletterEmail = document.getElementById("newsletterEmail");
    const newsletterMessage = document.getElementById("newsletterMessage");

    if (newsletterForm && newsletterEmail && newsletterMessage) {
        newsletterForm.addEventListener("submit", event => {
            event.preventDefault();

            if (newsletterEmail.value.trim() === "") {
                newsletterMessage.textContent = "Please enter a valid email address.";
                return;
            }

            newsletterMessage.textContent = "Thank you for subscribing!";
            newsletterForm.reset();
        });
    }

});


/* 
   MOBILE NAV — SCROLL SPY + LIQUID GLASS SLIDING INDICATOR
 */

document.addEventListener("DOMContentLoaded", () => {

    const mobileLinks = document.querySelectorAll(".mobile-link");
    const sections    = document.querySelectorAll("section");

    /* ── Click: set active + smooth scroll ── */
    mobileLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            mobileLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            const target = document.getElementById(
                link.getAttribute("href").substring(1)
            );
            if (target) {
                window.scrollTo({ top: target.offsetTop - 68, behavior: "smooth" });
            }
        });
    });

    /* ── Scroll spy: update active on scroll ── */
    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 150) current = sec.id;
        });
        mobileLinks.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
        });
    }, { passive: true });

    /* ────────────────────────────────────────────────
       LIQUID GLASS SLIDING INDICATOR
       Creates a glass pill that slides smoothly between
       tabs — matches Apple iOS 26 tab bar behaviour.
    ──────────────────────────────────────────────── */
    function initLiquidGlassNav() {
        const nav = document.querySelector(".mobile-nav");
        if (!nav || window.innerWidth > 768) return;

        /* Remove any existing indicator before (re)init */
        const old = nav.querySelector(".tab-indicator");
        if (old) old.remove();

        const indicator = document.createElement("div");
        indicator.className = "tab-indicator";
        nav.prepend(indicator);           /* prepend keeps it behind the links */

        /* Position indicator over a given link */
        function place(link, animate) {
            const nr = nav.getBoundingClientRect();
            const lr = link.getBoundingClientRect();
            const pt = parseFloat(getComputedStyle(nav).paddingTop) || 6;

            if (!animate) indicator.style.transition = "none";

            indicator.style.left   = (lr.left - nr.left)   + "px";
            indicator.style.top    = pt                     + "px";
            indicator.style.width  = lr.width               + "px";
            indicator.style.height = lr.height              + "px";

            if (!animate) {
                /* Re-enable CSS transition after 2 frames */
                requestAnimationFrame(() =>
                    requestAnimationFrame(() => {
                        indicator.style.transition = "";
                    })
                );
            }
        }

        /* Initial placement (no animation) */
        const firstActive = nav.querySelector(".mobile-link.active");
        if (firstActive) requestAnimationFrame(() => place(firstActive, false));

        /* Watch for .active class changes (covers both click and scroll-spy) */
        let lastActive = firstActive;
        const classWatcher = new MutationObserver(() => {
            const nowActive = nav.querySelector(".mobile-link.active");
            if (nowActive && nowActive !== lastActive) {
                lastActive = nowActive;
                place(nowActive, true);   /* animated slide */
            }
        });
        mobileLinks.forEach(link =>
            classWatcher.observe(link, { attributes: true, attributeFilter: ["class"] })
        );

        /* Reposition on window resize */
        window.addEventListener("resize", () => {
            if (window.innerWidth > 768) {
                classWatcher.disconnect();
                indicator.remove();
                return;
            }
            const cur = nav.querySelector(".mobile-link.active");
            if (cur) place(cur, false);
        }, { passive: true });
    }

    initLiquidGlassNav();

});
