# 6G CTI branding

The original SVG artwork is in `opencti-platform/opencti-front/src/static/images/6g-cti/`. The wordmark is outlined, so it has no runtime font dependency. `logo-light.svg` is for light surfaces; `logo-dark.svg` is for dark surfaces. `mark.svg` is the compact navigation symbol and `favicon.svg` is the browser icon. The public static favicon is copied into the production build by Vite.

The frontend uses these assets as defaults on login/OTP, navigation, password-change and public-sharing screens. Explicit theme logo URLs and a configured platform favicon retain priority. The draft rail retains its warning colours while using the same platform logo. The default login aside uses a faint 6G CTI symbol. Visible login, password-change and sidebar credits say Made by NetsLab. Custom aside backgrounds and the existing whitemark behavior remain supported; source license notices are unchanged.

Run from the repository root using Node.js 22.18 or a newer supported LTS version:

```powershell
$env:OPENCTI_URL = 'http://localhost:8080'
$env:OPENCTI_TOKEN = '<your OpenCTI user token>'
node scripts/install-research-branding.mjs --audit research-branding-installation.json
```

The script checks OpenCTI 7.261016.0, saves `platform_title` as `6G CTI`, and reads it back. Repeating it when the title already matches makes no write. It does not modify credentials, themes, logos or favicon settings. Audit files omit the token.

The local source frontend runs on port 3000. Rebuild and deploy the custom platform image for the bundled branding to appear in the Docker-served frontend; saving the title alone does not deploy logo assets.

## Loading and navigation

The shared page loader uses the corrected 6G CTI mark, with a 1.8-second rotation and a reduced-motion rule. Its inline, element and page variants retain 24/40/80 px sizing; rotating messages keep their ten-second interval.

The research frontend omits the XTM registration promotion, the header AI entry cluster and the product dropdown. Expanded navigation is 240 px (collapsed 48 px), with theme-scoped scrollbar colours and the full Telecom Workspace label. These are source UI changes; platform API permissions, other service warnings and model support are not changed.

## Deployed frontend

On 3 November 2026, release `7.261016.0-ui.20261103.1` was deployed at http://localhost:8080 using the existing Docker stack. See [Docker frontend release](README-docker-frontend.md) for the exact image, build procedure and rollback. Port 3000 remains the optional development preview.
