# Capability Routing

Choose a capability only if it passes all three gates: **relevant**, **available**, and **safe** under the current authority boundary. Otherwise use native Codex tools or report the limitation.

## Router

| Task signal | Candidate | Select when | Do not select when |
|---|---|---|---|
| Current facts, sources, comparisons | research skill or approved browser/search | current sources materially affect the answer | existing local evidence answers the question |
| PR, issue, repository metadata | GitHub/repository capability | the task requires remote repository evidence | a local checkout/diff is sufficient |
| UI interaction, responsive behavior | browser/computer-use or UI skill | a runnable app or visual evidence is needed | only static code inspection is needed |
| Structured data or metrics | data-analysis skill | the task requires analysis beyond a focused script/query | a small native check answers it |
| High-risk or independent validation | verify/reviewer skill | an independent check can catch a costly mistake | the work is small and the lead's focused check is enough |

For a capability named by the user, still apply the three gates. Preserve the user's named choice when it passes; otherwise explain the safe fallback briefly.

## Boundaries

- Inspect only the capability catalog provided to the active task. Do not scan local plugin caches or claim an unconfirmed connection.
- A skill guides an agent. A connected plugin may access an external system, so keep its inputs, output, and external-action authority explicit.
- Do not select a capability to make a task look more sophisticated. Every selected capability must change the evidence, validation, or execution path.
- Keep Prompt Master plus one specialized capability per worker by default. Add a second specialized capability only when its input/output boundary is independent and essential.

## Final evidence

For Run mode, report one line only when it materially changed the work:

```text
Capabilities: $agent-skills:kiem-chung — verified the focused behavior
```

Otherwise report:

```text
Capabilities: native Codex only
```
