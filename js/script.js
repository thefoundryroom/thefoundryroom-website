(() => {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Year ---------- */
    $('#year').textContent = new Date().getFullYear();

    /* ---------- Nav: scroll state, progress bar, active link, mobile menu ---------- */
    const nav = $('#nav');
    const progress = $('#progress');
    const links = $$('.nav-links a');
    const navLinks = $('#navLinks');
    const burger = $('#burger');

    function onScroll() {
        const y = window.scrollY;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        nav.classList.toggle('scrolled', y > 10);
        progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const sections = links
        .map(a => document.querySelector(a.getAttribute('href')))
        .filter(Boolean);
    const spy = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));

    function closeMenu() {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
    }
    burger.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
    });
    links.forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    /* ---------- Reveal on scroll ---------- */
    const rev = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                rev.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach((el, i) => {
        el.style.transitionDelay = Math.min((i % 4) * 70, 210) + 'ms';
        rev.observe(el);
    });

    /* ---------- Card spotlight + tilt ---------- */
    if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
        $$('.tilt').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                card.style.setProperty('--mx', x + 'px');
                card.style.setProperty('--my', y + 'px');
                const rx = ((y / r.height) - 0.5) * -5;
                const ry = ((x / r.width) - 0.5) * 5;
                card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });
    }

    /* ---------- Hero rotating text ---------- */
    const phrases = [
        'answer your customers',
        'process your invoices',
        'qualify your leads',
        'research your market',
        'run your operations'
    ];
    const rot = $('#rotator');
    let pi = 0;
    if (!reduceMotion) {
        setInterval(() => {
            pi = (pi + 1) % phrases.length;
            rot.innerHTML = '';
            const s = document.createElement('span');
            s.className = 'grad';
            s.textContent = phrases[pi];
            rot.appendChild(s);
        }, 2600);
    }

    /* ---------- Agent network canvas ---------- */
    (function network() {
        const c = $('#network');
        const ctx = c.getContext('2d');
        let w, h, dpr, nodes = [];
        const mouse = { x: -999, y: -999 };
        const colors = ['124,92,255', '34,211,238', '255,122,61'];

        function size() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = c.width = window.innerWidth * dpr;
            h = c.height = window.innerHeight * dpr;
            c.style.width = window.innerWidth + 'px';
            c.style.height = window.innerHeight + 'px';
            const count = Math.round(Math.min(90, (window.innerWidth * window.innerHeight) / 20000));
            nodes = Array.from({ length: count }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.25 * dpr, vy: (Math.random() - 0.5) * 0.25 * dpr,
                r: (Math.random() * 1.6 + 0.8) * dpr,
                col: colors[Math.floor(Math.random() * colors.length)]
            }));
        }
        size();
        window.addEventListener('resize', size);
        window.addEventListener('mousemove', e => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
        window.addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });

        const maxD = 150 * (window.devicePixelRatio > 1 ? 1.5 : 1);
        let running = true;
        document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) frame(); });

        function frame() {
            if (!running) return;
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                if (!reduceMotion) {
                    n.x += n.vx; n.y += n.vy;
                    if (n.x < 0 || n.x > w) n.vx *= -1;
                    if (n.y < 0 || n.y > h) n.vy *= -1;
                    const dx = n.x - mouse.x, dy = n.y - mouse.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < (140 * dpr) ** 2) {
                        n.x += dx * 0.002; n.y += dy * 0.002;
                    }
                }
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, 6.2832);
                ctx.fillStyle = `rgba(${n.col},.85)`;
                ctx.fill();
                for (let j = i + 1; j < nodes.length; j++) {
                    const m = nodes[j];
                    const dx = n.x - m.x, dy = n.y - m.y;
                    const d = Math.hypot(dx, dy);
                    if (d < maxD * dpr) {
                        ctx.strokeStyle = `rgba(${n.col},${(1 - d / (maxD * dpr)) * 0.28})`;
                        ctx.lineWidth = dpr * 0.8;
                        ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
                    }
                }
                const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
                const md = Math.hypot(mdx, mdy);
                if (md < 170 * dpr) {
                    ctx.strokeStyle = `rgba(34,211,238,${(1 - md / (170 * dpr)) * 0.5})`;
                    ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
                }
            }
            if (!reduceMotion) requestAnimationFrame(frame);
        }
        frame();
    })();

    /* ---------- Live agent demo ---------- */
    const scenarios = {
        support: {
            title: 'agent://support-triage',
            side: 'Resolved without a human, with a clean record',
            text: 'The agent reads the ticket, checks the order system, applies the refund policy, replies in the customer’s language and logs it. Anything outside policy goes to a person with a summary.',
            meters: [['Resolved by agent', 72], ['Avg. first response', 95], ['Escalated with context', 100]],
            lines: [
                ['think', 'New WhatsApp message: "Order #4821 arrived damaged, I want my money back"'],
                ['think', 'Plan: verify order → check refund policy → decide → reply → log'],
                ['tool', 'orders.lookup(id=4821) → delivered 2 days ago, ₹1,240, prepaid'],
                ['tool', 'kb.search("damaged item refund") → policy: full refund within 7 days with photo'],
                ['warn', 'Photo evidence missing. Asking customer before refunding.'],
                ['ok', 'Reply sent: "Sorry about that! Could you share a photo of the damage so I can process your refund?"'],
                ['think', 'Customer sent photo. Image check: visible damage, matches product.'],
                ['human', 'Refund ₹1,240 is under the ₹3,000 auto-approve limit. No human needed.'],
                ['tool', 'payments.refund(order=4821, amount=1240) → success'],
                ['ok', 'Customer notified. Ticket closed. CSAT survey queued. Total time: 2m 14s.']
            ]
        },
        invoice: {
            title: 'agent://accounts-payable',
            side: 'Entries drafted, mismatches flagged',
            text: 'The agent extracts invoice data, matches it to purchase orders and drafts the ledger entry. A person approves anything that does not match or exceeds a threshold.',
            meters: [['Auto-matched', 81], ['Entry accuracy (eval set)', 96], ['Flagged for review', 19]],
            lines: [
                ['think', 'Inbox: 14 new supplier invoices (PDF + photos). Starting batch.'],
                ['tool', 'extract(invoice_0412.pdf) → vendor, GSTIN, items, total ₹84,560'],
                ['tool', 'validate.gstin("29AAAAA0000A1Z5") → format valid'],
                ['tool', 'po.match(vendor, items) → PO-2291, qty matches, price +2.1%'],
                ['ok', 'Within 3% tolerance. Drafting purchase entry.'],
                ['tool', 'ledger.draft_entry(account="Purchases", amount=84560)'],
                ['warn', 'invoice_0415: total does not equal line items (diff ₹420). Flagged.'],
                ['human', 'Approval requested from accounts lead for invoice_0415 with side-by-side view.'],
                ['ok', 'Batch done: 11 entries drafted, 2 awaiting approval, 1 flagged. Audit log saved.']
            ]
        },
        leads: {
            title: 'agent://lead-qualifier',
            side: 'Reps spend time on the right leads',
            text: 'Inbound leads are enriched, scored against your ideal customer profile, and routed with a personalised draft reply ready for a rep to review.',
            meters: [['Leads enriched', 100], ['Routed correctly', 92], ['Rep time saved', 64]],
            lines: [
                ['think', 'New form submission: "Need a quote for 40-seat office setup, Pune"'],
                ['tool', 'enrich(company) → 120 employees, growing, IT services'],
                ['tool', 'crm.search(email) → no existing record. Creating contact.'],
                ['think', 'Score vs ICP: size ✔  region ✔  budget signal ✔  urgency unclear'],
                ['ok', 'Score 82 / 100 → route to senior rep (Priya)'],
                ['tool', 'draft_reply(tone="warm, concise", include=["case study", "calendar link"])'],
                ['human', 'Draft saved for rep review. Not sent automatically.'],
                ['ok', 'CRM updated, Slack alert posted, follow-up reminder set for 48h.']
            ]
        },
        research: {
            title: 'agent://market-research',
            side: 'A cited briefing, not a guess',
            text: 'The agent plans sub-questions, gathers sources, cross-checks claims and returns a structured report where every claim links back to a source.',
            meters: [['Claims with sources', 100], ['Sources cross-checked', 88], ['Time vs manual', 12]],
            lines: [
                ['think', 'Task: "Summarise the cloud kitchen market in Bengaluru for a board note."'],
                ['think', 'Plan: size & growth → key players → unit economics → risks'],
                ['tool', 'search("cloud kitchen India market size report") → 9 results'],
                ['tool', 'read(source_3) → extracted figures + publication date'],
                ['warn', 'Two sources disagree on growth rate. Checking a third.'],
                ['tool', 'read(source_7) → supports the lower estimate'],
                ['think', 'Reporting a range and noting the disagreement.'],
                ['ok', 'Report drafted: 6 sections, 14 sources, each claim cited. Sent for review.']
            ]
        }
    };

    const term = $('#termOut');
    const termTitle = $('#termTitle');
    const sideTitle = $('#sideTitle');
    const sideText = $('#sideText');
    const meters = $('#meters');
    let current = 'support';
    let runId = 0;

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    async function run(key) {
        const id = ++runId;
        const s = scenarios[key];
        term.innerHTML = '';
        termTitle.textContent = s.title;
        sideTitle.textContent = s.side;
        sideText.textContent = s.text;
        meters.innerHTML = '';
        const fills = s.meters.map(([label, val]) => {
            const m = document.createElement('div');
            m.className = 'meter';
            const top = document.createElement('div');
            const l = document.createElement('span'); l.textContent = label;
            const v = document.createElement('span'); v.textContent = val + '%';
            top.append(l, v);
            const tr = document.createElement('div'); tr.className = 'track';
            const f = document.createElement('div'); f.className = 'fill';
            tr.appendChild(f);
            m.append(top, tr);
            meters.appendChild(m);
            return [f, val];
        });

        let t = 0;
        for (const [type, text] of s.lines) {
            if (id !== runId) return;
            const ln = document.createElement('div');
            ln.className = 'ln ' + type;
            const stamp = document.createElement('span');
            stamp.className = 't';
            stamp.textContent = '00:' + String(t).padStart(2, '0');
            ln.append(stamp, document.createTextNode(text));
            term.appendChild(ln);
            term.scrollTop = term.scrollHeight;
            t += 1 + Math.floor(Math.random() * 3);
            await sleep(reduceMotion ? 0 : 650 + Math.random() * 450);
        }
        if (id !== runId) return;
        const cur = document.createElement('div');
        cur.className = 'ln cursor';
        term.appendChild(cur);
        fills.forEach(([f, v]) => { f.style.width = v + '%'; });
    }

    $$('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            current = tab.dataset.scn;
            run(current);
        });
    });
    $('#replay').addEventListener('click', () => run(current));

    // Start the demo when it scrolls into view
    let started = false;
    new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting && !started) {
            started = true;
            run(current);
            obs.disconnect();
        }
    }, { threshold: 0.25 }).observe($('.demo'));

    /* ---------- ROI calculator ---------- */
    const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
    const ids = ['Tasks', 'Min', 'Rate', 'Share'];
    function roi() {
        const tasks = +$('#iTasks').value;
        const min = +$('#iMin').value;
        const rate = +$('#iRate').value;
        const share = +$('#iShare').value / 100;
        $('#oTasks').textContent = tasks.toLocaleString('en-IN');
        $('#oMin').textContent = min;
        $('#oRate').textContent = inr(rate);
        $('#oShare').textContent = Math.round(share * 100) + '%';
        const hours = (tasks * min * share) / 60;
        const save = hours * rate;
        $('#rHours').textContent = Math.round(hours).toLocaleString('en-IN');
        $('#rSave').textContent = inr(save);
        $('#rYear').textContent = inr(save * 12);
        const pct = Math.min(100, (save / 500000) * 100);
        $('#rBar').style.width = Math.max(4, pct) + '%';
    }
    ids.forEach(i => $('#i' + i).addEventListener('input', roi));
    roi();

    /* ---------- Plan buttons preselect the form ---------- */
    $$('[data-plan]').forEach(b => {
        b.addEventListener('click', () => {
            const sel = $('#interest');
            const opt = Array.from(sel.options).find(o => o.text === b.dataset.plan);
            if (opt) sel.value = opt.value;
        });
    });

    /* ---------- Contact form ----------
       Sends enquiries to your inbox through FormSubmit (free, no backend).
       1. Set INBOX to a mailbox you read (Gmail works).
       2. Submit the form once from the live site, then click the
          activation link FormSubmit emails you. After that every enquiry arrives
          in that inbox and you can reply straight to the sender.
       If the service is unreachable, the form falls back to opening the
       visitor's email app so no enquiry is lost. */
    const INBOX = 'dfoundryroom@gmail.com';
    const form = $('#contactForm');
    const msg = $('#formMsg');
    const btn = form.querySelector('button[type="submit"]');

    function say(text, cls) { msg.className = 'form-msg ' + cls; msg.textContent = text; }

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const name = $('#name'), email = $('#email'), text = $('#message');
        [name, email, text].forEach(f => f.classList.remove('invalid'));
        const bad = [];
        if (!name.value.trim()) bad.push(name);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) bad.push(email);
        if (text.value.trim().length < 10) bad.push(text);
        if (bad.length) {
            bad.forEach(f => f.classList.add('invalid'));
            bad[0].focus();
            say('Please complete the highlighted fields (message needs a few words).', 'err');
            return;
        }
        if ($('#website') && $('#website').value) return; // honeypot: bots fill this

        const interest = $('#interest').value;
        const payload = {
            name: name.value.trim(),
            email: email.value.trim(),
            interest,
            message: text.value.trim(),
            _subject: `${interest} enquiry from ${name.value.trim()}`,
            _replyto: email.value.trim(),
            _template: 'table',
            _captcha: 'false'
        };

        btn.disabled = true;
        say('Sending...', 'ok');
        try {
            const res = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(INBOX), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.success === 'false' || data.success === false) throw new Error('send failed');
            say('Thank you! Your message has reached us. We will reply within one business day.', 'ok');
            form.reset();
        } catch (err) {
            const body = `Name: ${payload.name}\nEmail: ${payload.email}\nInterested in: ${interest}\n\n${payload.message}`;
            window.location.href = `mailto:${INBOX}?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(body)}`;
            say('Could not send directly, so we opened your email app instead. You can also write to ' + INBOX + '.', 'err');
        } finally {
            btn.disabled = false;
        }
    });
})();
