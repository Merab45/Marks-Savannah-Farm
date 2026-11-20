# Task Shapes

Use one form; do not combine unrelated workflows. In Run mode, use the selected form as an internal execution brief, then do the work. Show it only in Prepare mode.

## Narrow change

```text
In [path or workspace], [specific action]. Preserve [constraint]. Verify with [command or smallest relevant check]. Report [evidence].
```

## Change, build, or fix

```text
Objective:
[outcome]

Context:
[current state and inputs]

Scope:
- Work in: [paths]
- Do not touch: [areas]

Requirements:
- [behavior]
- Done when: [verifiable condition]

Verification:
- [tests, build, browser, or manual check]

Authority:
Make in-scope local edits and non-destructive checks. Ask before [only relevant risky actions].

Final response:
Report changed files, verification results, and residual risk.
```

## Review or diagnosis

```text
Inspect [paths, diff, or evidence] for [question or failure]. Do not edit files.

Findings first:
- For each finding, include severity, file/line reference, evidence, impact, and recommended next action.
- Then state uncertainty and remaining validation gaps.
```

## ChatGPT analysis or research

```text
Objective:
[answer or deliverable]

Context:
[facts, sources, audience]

Requirements:
- Use only [provided material / named tools].
- Cite [what needs support] with source links and access dates; say when evidence is missing or uncertain.
- Return [format, length, and tone].

Final response:
Lead with the conclusion, then essential evidence, caveats, and next action.
```

## Secret or external API request

```text
Use the credential from [ENV_VAR_NAME]. Never print, log, store, or hard-code credentials.

Before an external request, ask for the minimum missing endpoint, method, payload, and approval boundary. Do not make the request until those are supplied.
```
