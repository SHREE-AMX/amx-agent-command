# AMX Agent Food Command v2

This package adds a production-shaped Azure connector layer and an Expo Go mobile flow for provider connection, delivery address, restaurant search, route distance/ETA, itemized quote review, expiring human approval, and guarded order submission.

## Important platform limitation

The included connectors are intentionally fail-closed. Provider partner credentials and approved scopes are required. Uber Eats Marketplace is merchant/POS oriented; DoorDash Drive creates delivery fulfillment for orders originating in your system; Grubhub integration access is partner-oriented. Do not claim consumer checkout support until each provider confirms and enables the applicable ordering scopes for your account.

Customizations

The devcontainer includes VS Code extensions for React Native / Expo development.

## Codespace

Open in GitHub Codespaces — the devcontainer auto-installs all dependencies.

```bash
bash start.sh --web --tunnel
```

Port 8081 is forwarded automatically. Open the "Ports" tab and click "Open in Browser."

## Local (no codespace)

```bash
npm install
npx expo install --fix
npx expo start
```

For web mode: `npx expo start --web --port 8081`.

Set `EXPO_PUBLIC_AGENT_API_URL` to the Azure Functions base URL.

## Run backend

```bash
cd backend
npm install
func start
```

Copy `local.settings.example.json` to `local.settings.json` for local use. In Azure, keep every secret in Key Vault-backed app settings. Never put secrets or payment data in Expo environment variables.

## Production gates

1. Use Entra ID or an equivalent identity provider on every endpoint.
2. Complete the partner application and test certification required by each delivery provider.
3. Store OAuth refresh tokens and signing secrets only in Key Vault.
4. Persist quotes, approval nonces, and audit records in durable storage with one-time atomic consumption.
5. Reprice immediately before checkout and reject any total, merchant, item, or address mismatch.
6. Display taxes, fees, tip, delivery address, merchant, item substitutions, and final total before approval.
7. Enforce spending limits, merchant allowlists, rate limits, idempotency keys, and cancellation policy acknowledgement.
8. Tokenize payment through the provider or a PCI-compliant payment service. Do not collect card data in this app.
9. Process provider webhooks with signature verification and append-only evidence history.

## Maps

The backend includes a server-side Google Routes `computeRouteMatrix` call. Restaurant catalog results must come from an approved provider endpoint before distances are calculated. Keep the Maps API key server-side and restrict it to the Routes API and approved server origins.
