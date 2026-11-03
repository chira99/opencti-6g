# Telecom workspace

UI layout preview at `/dashboard/telecom`, available from the authenticated navigation for users with knowledge access. It inherits the platform theme and uses the Filigran Design System.

The example is constructed, held in browser memory, and never imported into OpenCTI. Context selection and the Investigation, Evidence and STIX mapping tabs are functional. Mapping is an empty state until actual model-backed storage/query/export results exist. The model is being revised; the fixture is not a schema or an API contract.

## Local development

Start the existing Docker platform at `http://localhost:8080`, then run from `opencti-platform/opencti-front` in PowerShell:

```powershell
corepack yarn install --immutable
$env:BACK_END_URL = "http://localhost:8080"
corepack yarn dev
```

Open `http://localhost:3000/dashboard/telecom` and sign in normally. The development proxy forwards GraphQL/auth/storage routes to the local backend. An ignored `.env.development.local` can hold these non-secret development settings. No admin token belongs in frontend code or this file. Stop the Vite process to stop the preview.

The installed dependency graph remains pinned by the existing package.json/yarn.lock. No backend, connector, Docker image or data migration is included in this UI change.

## Next integration step

Replace the presentation fixture through a versioned view-model adapter after agreeing the model/query contract. Keep source evidence, unknowns, mapping version, stored IDs and server export independently traceable. Do not draw a successful mapping from browser-only fixture data.
