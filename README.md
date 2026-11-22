# The Foundry Room - Website

Marketing site for The Foundry Room, a studio that designs, deploys and supervises custom AI agents. Plain HTML, CSS and JavaScript with no build step.

## What is on the page

- Animated agent-network background that reacts to the mouse
- Live, simulated agent demo with four scenarios (support, invoices, leads, research)
- Services, process, reliability and engagement-model sections
- ROI estimator with sliders (INR)
- Example engagements, FAQ, and a contact form that opens the visitor's email app
- Responsive, keyboard accessible, respects reduced-motion settings
- SEO tags, Open Graph tags and JSON-LD structured data

## Structure

```
index.html        # all content
css/styles.css    # design tokens (colors, fonts) at the top in :root
js/script.js      # network canvas, demo scenarios, ROI maths, form
CNAME             # thefoundryroom.in
```

## Things to edit

- Copy: all text lives in `index.html`
- Demo scripts: the `scenarios` object in `js/script.js`
- Contact address: `TO` in `js/script.js`, plus the `mailto:` link and JSON-LD in `index.html`
- Example engagements are illustrative. Replace them with real case studies and testimonials once you have them.

## Deploy (GitHub Pages)

Repository Settings, then Pages, then source `main` branch. The `CNAME` file points it at `thefoundryroom.in`.

## Ideas for later

- Form backend (Formspree, Netlify Forms, or a small API) instead of mailto
- Real case studies and client logos
- Blog and a booking widget (Cal.com)
- Analytics
