# Mark's Savannah Farm

A farm website for Mark's Savannah Farm in Kajiado, Kenya, featuring livestock, crops, poultry farming, dairy products, and agri-consultancy.

## Pages

- `index.html` – public farm website with product and service categories, livestock listings, and WhatsApp enquiries
- `sign-in.html`, `create-account.html`, `customer-account.html` – buyer accounts (prototype)
- `herdbook.html` – the farm's private record keeper (not linked from the public site)

## Project folders

- `CSS/site.css` – shared styles for all pages, scoped by each page's class
- `JS/site.js` – shared behavior, initialized only on the matching page
- `Assets/` – app icons and other local images
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

Whenever you change a site file, bump the cache version in `service-worker.js` so returning visitors get the new version.

## Known limits of this prototype

- Buyer accounts, saved animals, and herdbook records are stored in the browser (localStorage). They do not sync between devices, and animals added in herdbook are **not** visible to other visitors of the public site.
- `herdbook.html` has no password. Anyone who knows the address can open it, so do not rely on it for private data.
- Live M-Pesa payments are not enabled.

## Farm contact

- Phone/WhatsApp: 0706 894 568
- Email: meraprenish@gmail.com
- Location: Kajiado, Kenya
