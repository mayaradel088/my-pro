# Portfolio

Plain HTML + CSS + vanilla JS. No build step: open `index.html` in a browser.

## Replace images (keep the same file names, or edit the `src` in `index.html`)
- Profile: `assets/images/profile.jpg` (portrait, ~4:5) · About: `assets/images/about.jpg`
- Projects: `assets/images/projects/project-01.jpg` … `project-04.jpg` (any proportion; shown cropped 4:3 in the grid, full in the modal)
- Testimonials: `assets/images/testimonials/` (slides currently use initials; add an `<img>` in `.avatar` if wanted)
- Missing images show a labelled placeholder, not a broken icon.

## Edit content
Search `index.html` for `[YOUR NAME]`, `your@email.com`, and `EDIT` comments. Project title/category/description live on each `.proj` button (`data-cat`, `data-desc`). To add a project, copy a `.proj` block; for a new category add a matching `.chip` filter.

## Contact form
`js/script.js` → `FORM_ENDPOINT` (e.g. a Formspree URL) enables real sending. While empty, the form opens a `mailto:` draft to `CONTACT_EMAIL` and says so honestly.
