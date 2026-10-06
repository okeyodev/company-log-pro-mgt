# AVENIR — Asset Investment Platform — Signup Experience

Premium fintech signup built with **pure HTML, CSS, vanilla JavaScript** — no frameworks.

## Product Direction
- Deep navy / charcoal + warm white + brass accent
- Institutional wealth management, not crypto
- Left visual ecosystem: PROPERTY → ASSET → INVESTMENT → PORTFOLIO
- Right: multi-stage onboarding

## Structure
- `index.html` — main signup page
- `styles.css` — advanced CSS3, grid, isometric, animations
- `signup.js` — modular vanilla JS (validateStep, validateEmail, validatePassword, updatePasswordStrength, updateProgress, selectInterest, showError, clearError, goToNextStep, goToPreviousStep, handleSignup)
- `login.html` — minimal sign-in placeholder

## Flow
1. Account (name, email, password with strength, confirm)
2. Intent (Invest / Buy / Both / Explore) — selectable cards
3. Interests (multi-select chips) + Country / City
4. Review + Terms + CTA with loading / success state

## Interactions
- Progress rail synced to flow nodes
- Password live strength + rule ticks
- Card selection with elevation + check
- Interest chips with dot indicator
- Cursor parallax on isometric field (rAF, reduced-motion safe)
- Inline validation, success states, simulated provisioning

## Run
Open `index.html` in browser. No build step.

## Quality Bar
Fast, trustworthy, premium, controlled. Semantic HTML, keyboard nav, focus states, 44px touch targets, prefers-reduced-motion support.

© AVENIR Asset Management — Demo prototype
