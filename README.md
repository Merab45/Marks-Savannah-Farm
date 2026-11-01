# Mark's Savannah Farm

A farm website for Mark's Savannah Farm, serving Kenya from Laikipia, Narok and Nakuru since 1997. It covers livestock, crops, poultry farming, dairy products and agri-consultancy, with WhatsApp enquiries throughout.

## Pages

- `index.html` – public farm website: hero, Products & Services, livestock listings with filters, gallery, buying guide and contact
- `about-us.html` – page banner, "Our Story", what the farm does and where it works. The About, sign-in, create-account and buyer dashboard pages all use the same navbar as the homepage.
- `sign-in.html`, `create-account.html`, `customer-account.html` – buyer accounts (prototype)
- `herdbook.html` – the farm's private record keeper (not linked from the public site)

## Features

- **Products & Services menu** – a mega-menu (Livestock, From the farm, Services) that opens on hover on desktop and on tap on touch devices. A photo panel changes as you hover each item. The livestock links filter the listings on the homepage.
- **WhatsApp button** – a floating "WhatsApp us" button with a pulsing glow on every public page (not on `herdbook.html`).
- **Installable and offline-friendly** – `manifest.webmanifest` and `service-worker.js` make the site installable and keep the core pages and images available offline.

## Project folders

- `CSS/site.css` – shared styles for all pages, scoped by each page's class
- `JS/site.js` – shared behaviour, initialised only on the matching page. Farm contact details (WhatsApp, phone, email) are set once at the top of this file.
- `Assets/` – logos, hero and About images, the dropdown photos (cattle, goats, sheep, pigs, turkeys, poultry farming, crops, dairy, agri-consultancy), and `placeholder-about-banner.svg` / `placeholder-about-story.svg`, which are stand-ins for the About page photos. To use real photos, change the two `url(...)` paths in `site.css` (`.about-banner` and `.about-story-photo`) and add the new files to `service-worker.js`.
- The HTML pages, `manifest.webmanifest`, `service-worker.js`, and this README stay in the project root.

## Preview locally

Open `index.html` in a browser. Keep the `CSS/`, `JS/`, and `Assets/` folders alongside the HTML pages, manifest, and service worker.

## Publish with GitHub Pages

1. Create a GitHub repository for the website.
2. Upload the contents of this folder to the repository root. Make sure `index.html` is at the root, not inside another folder.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose the `main` branch and `/ (root)`, then save.
5. Open the Pages URL shown there after GitHub finishes publishing.

## Updating the site

Whenever you change a site file, bump the version number in **both** places so returning visitors get the new version:

1. `service-worker.js` – the `CACHE` name (for example `marks-savannah-farm-v89`)
2. Every page's stylesheet link – `CSS/site.css?v=89`, on all six HTML pages. Use the same number everywhere.

Every file listed in `FILES` in `service-worker.js` must exist in the project, with the exact same name. If one is missing, the offline cache fails to install. This includes the images in `Assets/`.

## Known limits of this prototype

- Buyer accounts, saved animals, and herdbook records are stored in the browser (localStorage). They do not sync between devices, and animals added in herdbook are **not** visible to other visitors of the public site.
- `herdbook.html` has no password. Anyone who knows the address can open it, so do not rely on it for private data.
- Buyer sign-in only checks a password saved in the same browser, so it is not secure.
- Live M-Pesa payments are not enabled.

## Farm contact

- Phone/WhatsApp: 0706 894 568
- Email: meraprenish@gmail.com
- Locations: Laikipia, Narok and Nakuru, Kenya
