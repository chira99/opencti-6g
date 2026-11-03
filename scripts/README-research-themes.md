# Research platform themes

Daylight, Graphite Light and Graphite Dark use the reviewed preview palettes in `opencti-platform/opencti-front/src/utils/researchThemes.ts`. Graphite Light is the intended platform default: light content with a charcoal navigation rail.

## Install and select

Use Node.js 22.18.0 or a newer supported LTS release. The installer imports the frontend TypeScript preset module using Node's built-in TypeScript support. It targets OpenCTI **7.261016.0** and uses the existing GraphQL API.

Run from the repository root in PowerShell, with a user token that can set platform parameters:

```powershell
$env:OPENCTI_URL = 'http://localhost:8080'
$env:OPENCTI_TOKEN = '<your OpenCTI user token>'
node scripts/install-research-themes.mjs --set-default --audit research-theme-installation.json
```

The installer creates missing themes, reuses matching rows, reads each installed theme back by ID, and records the before/after default in the optional audit file. It preserves an existing same-named theme if its colours differ and stops with an error. It never replaces that customized row.

`--set-default` selects Graphite Light as the shared default. Omit this flag on later runs to retain a subsequently chosen default:

```powershell
node scripts/install-research-themes.mjs
```

A personal theme selected in Profile takes priority over the shared default. Choose **Default** in Profile to follow the platform, or explicitly pass `--follow-default` to reset only the token user's preference. Other users' personal choices remain unchanged.

## Change appearance

In the custom frontend, open **Settings → Parameters → Appearance** and choose **Use as default** on a preset card. The existing default-theme selector remains available. These choices persist on the server and apply to users following the platform theme. Profile also lists the installed themes for personal selection.

## Deploy the matching frontend

The installer saves theme data; it does not deploy application code. An unmodified stock Docker image serves its bundled upstream assets and does not recognize the new light theme names. The current local deployment uses the custom image described below. For a fresh host, build and deploy the matching custom image to serve the updated theme resolver, navigation styling and picker; use the source preview while iterating. Stored rows alone are insufficient to reproduce the intended light appearance in the stock frontend.

## Deployed frontend

On 3 November 2026, release `7.261016.0-ui.20261103.1` was deployed at http://localhost:8080 using the existing Docker stack. See [Docker frontend release](README-docker-frontend.md) for the exact image, build procedure and rollback. Port 3000 remains the optional development preview.
