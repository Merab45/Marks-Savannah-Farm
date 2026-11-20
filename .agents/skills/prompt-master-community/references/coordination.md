# Coordination

Use coordination to reduce independent uncertainty, not because a request is long.

## Entry test

Use Level 1 or 2 only when all are true:

- The task has independently checkable slices.
- Each slice has a separate output or write scope.
- The lead can integrate and verify the combined result.
- The expected benefit exceeds the token/time cost.

Stay at Level 0 when the work shares one root cause, one small file set, a linear dependency, or a single decision owner.

Read [capability-routing.md](capability-routing.md) before selecting a specialized skill or plugin. The lead retains the external-action boundary and final verification. A capability is a tool choice, not a new requirement.

## Worker brief

```text
Objective: [one independently checkable outcome]
Ownership: [exact files OR research question]
Constraints: [preserve, no external writes, no scope expansion]
Capability: [$skill or connected plugin only if needed]
Validation: [one focused check]
Handoff: [changed files/evidence, check result, residual risk]
```

## Integration

1. Read each handoff and inspect the changed files or evidence.
2. Resolve overlap in the lead task; do not merge blindly.
3. Run the smallest integration check that exercises the combined behavior.
4. Stop when the success criteria pass; do not keep looping for speculative polish.
5. Retry one safe, localized worker failure at most once; otherwise stop with the handoff evidence.
