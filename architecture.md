# System Architecture

## Principles
- No traditional backend.
- No login/auth.
- Stateless frontend.

## Stack
- **Frontend**: HTML5, CSS3, Vanilla JS.
- **Deployment**: Vercel.
- **Containerization**: Docker (for local dev).

## Data Flow
1. User visits Landing Page.
2. User clicks CTA -> Chatbot Trigger.
3. Chatbot captures data -> Webhook.
4. Webhook -> Google Sheets / Notion (Lead Storage).
5. Webhook -> WhatsApp API (Verification/Alerts).
