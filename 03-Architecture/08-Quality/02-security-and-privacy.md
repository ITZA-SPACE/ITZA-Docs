# Security and privacy

What is protected, how, and what is deliberately not collected.

**Where the code lives**

- `services/si-gateway/src`
- `infra/`

---

## Security and privacy

- No accounts required; no personal data collected. Field geometry is sent only to data providers needed to answer the query.
- Secrets (Earthdata credentials, LLM keys) live only in the Python service and the SI gateway; never in the client bundle.
- Gateway: origin allow-list, per-IP and per-session rate limits, request size limits, prompt-injection-resistant system prompt (tool outputs treated as data), no arbitrary URL fetching.
- Input validation: GeoJSON size/vertex limits, bbox limits, date-range limits (Pydantic models).
- Dependency hygiene: lockfiles, automated audit in CI; licenses recorded (third-party register: EOxCloudless 2016 under CC BY 4.0, model licenses).
- Share links encode inputs only; no server-side storage of user data in the hackathon build.
