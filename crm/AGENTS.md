# CRM frontend instructions

Before changing anything in this directory, read `RULES.md` completely. Its architecture,
testing, typing, styling, i18n and API boundaries are mandatory for every change.

Do not finish a code change until all of these commands pass:

```bash
npm run format:check
npm run lint
npm run build
npm test
```

When a rule and existing code disagree, fix the code in the touched scope. Do not add an
exception, disable a check or weaken a type merely to make a command pass.
