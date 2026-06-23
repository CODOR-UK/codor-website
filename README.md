# CODOR Website

Repository: https://github.com/CODORChris/codor-website

## What was done

1. Configured `rclone` on the server with a CODOR OneDrive/SharePoint remote.
2. Mounted the remote and verified access to the `Documents/Website` SharePoint folder.
3. Copied the live website source from `Documents/Website/_archive/Codor/Codor/` to `/srv/codor/website`.
4. Initialized a Git repository in `/srv/codor/website`.
5. Committed the website files and created the GitHub repository `CODORChris/codor-website`.
6. Pushed the repository to GitHub on branch `main`.

## Current contents

- `index.html`
- `privacy.html`
- `terms.html`
- `script.js`
- `styles.css`
- `favicon.svg`
- `CODOR-website-rules-register.docx`
- `Website tags workflow.docx`

## Workflow

### On this server

- Edit files under `/srv/codor/website`.
- Run `git add . && git commit -m "..." && git push`.

### On GitHub

- The canonical repository is:
  https://github.com/CODORChris/codor-website

## GoDaddy integration options

### Option 1: GitHub Pages

If the website is static HTML/CSS/JS, the simplest deployment is GitHub Pages.
- Add a GitHub Pages workflow or enable Pages from the repository settings.
- Point the GoDaddy domain DNS to GitHub Pages.

### Option 2: GoDaddy hosting with FTP/SFTP

If the live site is hosted on GoDaddy web hosting, deploy from GitHub to GoDaddy using:
- GitHub Actions with FTP/SFTP upload
- A server-side deploy script on `/srv/codor`

For this we need:
- GoDaddy hosting type (shared web hosting, cPanel, etc.)
- FTP/SFTP hostname
- username/password or SSH key
- web root path for the website

### Option 3: DNS-only to GitHub Pages

If GoDaddy is only used for DNS, we can point the domain directly to GitHub Pages.
This is the cleanest option for static sites.

## Next step

Choose how the site should be published from GitHub to the live domain:
- `GitHub Pages` (preferred for static sites)
- `FTP/SFTP deploy` to GoDaddy hosting
- `GoDaddy DNS` to another hosted destination

Once we have GoDaddy hosting details, I can set up the deployment pipeline.
