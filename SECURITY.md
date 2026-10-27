# Security Policy — KHILATKARI

## Reporting a Vulnerability

We take the security and integrity of **KHILATKARI** seriously. If you discover a security vulnerability, we appreciate your help in disclosing it to us responsibly.

### How to Report

- **Preferred Method:** Please report security issues privately via [GitHub Private Vulnerability Reporting](https://github.com/sufyan-builds/khilatkari/security/advisories/new) on the repository.
- **Do not create public issues:** Please do **not** open a public issue or discuss potential vulnerabilities in public forums until they have been reviewed and addressed.

When reporting, please provide:
1. A clear description of the vulnerability.
2. Steps to reproduce the issue (proof-of-concept script, request payload, or screenshots).
3. The affected component (frontend, backend endpoint, or configuration).
4. Potential impact.

### Response Timeline

- **Initial Acknowledgement:** Within 48 hours.
- **Assessment & Status Update:** Within 5 business days.
- **Remediation & Release:** Security patches will be prioritized and published promptly.

---

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Implemented Security Controls

KHILATKARI implements multi-layer defense in depth:

1. **Authentication & Authorization**
   - Admin routes are protected by JSON Web Tokens (JWT) signed with HS256.
   - Passwords are encrypted using salted `bcrypt` hashes.
   - Centralized authentication dependency guards all management endpoints (`/api/admin/*`).

2. **Network & Origin Security**
   - Cross-Origin Resource Sharing (CORS) is restricted to explicit trusted origins and authorized preview domains (`DEFAULT_PRODUCTION_ORIGINS` & verified regex).
   - Wildcard CORS (`*`) with credentials is prohibited.
   - HTTP Strict-Transport-Security (HSTS) is enforced on HTTPS connections in production.

3. **HTTP Security Headers**
   - `X-Content-Type-Options: nosniff` (prevents MIME type sniffing).
   - `X-Frame-Options: DENY` (clickjacking mitigation).
   - `Referrer-Policy: strict-origin-when-cross-origin` (prevents sensitive path leakage).
   - `X-XSS-Protection: 0` (modern standard).

4. **Secret Scrubbing & Logging Sanitization**
   - Custom `SecretScrubbingFilter` and `sanitize_log_message` redact sensitive parameters (passwords, tokens, database URIs, API keys) from server logs.
   - Centralized exception handlers catch 500 errors and return generic error messages to clients to prevent internal stack trace disclosure.

5. **Input Validation & Data Sanitization**
   - Strict Pydantic models validate and sanitize all user and admin inputs before database operations.
   - Uploaded media undergoes MIME type and file signature (magic byte) verification to prevent arbitrary file upload attacks.
   - URL validators restrict media links to approved protocols (`https://`) and trusted CDN hostnames (Cloudinary).

6. **Environment Separation**
   - Secrets are managed strictly via environment variables.
   - No production secrets or live database credentials are committed to version control.
