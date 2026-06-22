#!/bin/bash
sed -i '/@theme {/,$d' /home/wagih/Data/Programming/resume-analyzer/client/app/app.css
cat << 'INNER_EOF' >> /home/wagih/Data/Programming/resume-analyzer/client/app/app.css
@theme {
  --color-error: var(--deep-red);
  --color-background: var(--ink);
  --color-on-background: var(--stone);
  --color-surface: var(--surface);
  --color-on-surface: var(--stone);
  --color-on-surface-variant: var(--muted);
  --color-primary: var(--rust);
  --color-primary-container: var(--rust);
  --color-on-primary-container: #ffffff;
  --color-outline: var(--muted);
  --color-outline-variant: var(--border);
  --color-secondary: var(--amber);
  --color-tertiary: var(--sage);
  --color-surface-container-low: var(--ink);
  --color-surface-container-lowest: var(--ink);
  --color-surface-container: var(--raised);
  --color-surface-container-high: var(--raised);
  --color-surface-container-highest: var(--border);

  --spacing-margin-desktop: 64px;
  --spacing-gutter: 24px;

  --font-display-md: "Fraunces";
  --font-headline-sm: "Fraunces";
  --font-body-lg: "Inter";
  --font-caption: "Inter";
  --font-subheading-italic: "Fraunces";
  --font-body-md: "Inter";
  --font-ui-label: "Inter";
  --font-display-lg: "Fraunces";

  --text-display-md: 36px;
  --text-display-md--line-height: 1.2;
  --text-display-md--font-weight: 700;

  --text-headline-sm: 24px;
  --text-headline-sm--line-height: 1.3;
  --text-headline-sm--font-weight: 700;

  --text-body-lg: 18px;
  --text-body-lg--line-height: 1.6;
  --text-body-lg--font-weight: 400;

  --text-caption: 12px;
  --text-caption--line-height: 1.4;
  --text-caption--font-weight: 500;

  --text-subheading-italic: 20px;
  --text-subheading-italic--line-height: 1.4;
  --text-subheading-italic--font-weight: 300;

  --text-body-md: 16px;
  --text-body-md--line-height: 1.5;
  --text-body-md--font-weight: 400;

  --text-ui-label: 14px;
  --text-ui-label--line-height: 1;
  --text-ui-label--letter-spacing: 0.05em;
  --text-ui-label--font-weight: 600;

  --text-display-lg: 48px;
  --text-display-lg--line-height: 1.1;
  --text-display-lg--letter-spacing: -0.02em;
  --text-display-lg--font-weight: 900;
}

.border-sep {
  border-color: var(--border);
}
.bg-card {
  background-color: var(--surface);
}
.bg-hover:hover {
  background-color: var(--raised);
}
.score-sage {
  background-color: rgba(126, 170, 138, 0.15); /* sage */
  border: 1px solid var(--sage);
  color: var(--sage);
}
.score-amber {
  background-color: rgba(196, 154, 90, 0.15); /* amber */
  border: 1px solid var(--amber);
  color: var(--amber);
}
.score-red {
  background-color: rgba(184, 85, 85, 0.15); /* deep-red */
  border: 1px solid var(--deep-red);
  color: var(--deep-red);
}
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 20px;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
  vertical-align: middle;
}
INNER_EOF
chmod +x /home/wagih/Data/Programming/resume-analyzer/client/scripts_fix_css.sh
/home/wagih/Data/Programming/resume-analyzer/client/scripts_fix_css.sh
