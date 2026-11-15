# @itza/ui-kit

Shared accessible React components and the A2UI answer catalog (schemas, examples, fallback layouts).

Owned by workstream F,L in [MVP_SCOPE.md §3](../02-Product/MVP_SCOPE.md#3-workstreams-for-parallel-agents). Design: [Architecture docs](../03-Architecture/06-AI/05-generative-ui.md#generative-ui-design).

Internal package: consumers import TypeScript source directly (`exports` points at `src/index.ts`); the app bundler compiles it.

## Answer catalog

`catalog/` holds the A2UI answer catalog `app-catalog/v1`: JSON Schemas, one example surface per component, fallback layouts per intent class, the action allow-list and the validators (schema, layout, plain text, grounding). It is plain TypeScript, imported as `@itza/ui-kit/catalog` by the web app and the SI gateway. Contract: [Architecture docs](../03-Architecture/06-AI/07-gateway-and-catalog-contracts.md#answer-catalog-contract-packagesui-kitcatalog). Tests: `pnpm --filter @itza/ui-kit test`.
