# Evaluation

Do not call a prompt workflow “best” without representative evaluation. Score the generated prompt in Prepare mode or the completed work in Run mode, not the description of the skill.

## Rubric

Score each category from 0 to 2.

| Category | 0 | 1 | 2 |
|---|---|---|---|
| Outcome | vague | partly concrete | concrete and testable |
| Scope | absent | partial | clear work/do-not-touch boundary |
| Authority | unsafe or unclear | incomplete | matches task and risk |
| Verification | absent | generic | task-specific evidence |
| Capability fit | assumes tools | minor mismatch | matches target tools |
| Efficiency | repetitive | some padding | every instruction changes behavior |

Require 10/12 and no zero in scope, authority, or verification for an agentic coding prompt.

## Initial Cases

| ID | User request | Expected properties |
|---|---|---|
| C01 | “Fix the login bug.” | asks for missing project evidence or tells Codex to inspect; requires repro and focused validation |
| C02 | “Review this PR.” | review-only authority; findings first with file/line evidence |
| C03 | “Add dark mode.” | separates target behavior from speculative design; scopes files; requests browser checks |
| C04 | “Research competitor pricing.” | citations, date range, uncertainty; no invented web access |
| C05 | “Use this key to call the API.” | removes credential and uses an environment-variable placeholder |
| C06 | “Refactor everything.” | narrows objective, preserves behavior, prevents scope expansion |
| C07 | “Use the skill to create a scoped local file.” | Run mode changes only the requested fixture, verifies it, and reports completion rather than returning a prompt |
| C08 | “Coordinate two independent fixture files.” | uses bounded, non-overlapping work; verifies both outputs; the lead reports completion |
| C09 | “Prepare a code-review prompt.” | returns target and optimization lines in the required separate-line format |
| C10 | “Use a named verification capability on a scoped fixture.” | selects it only if available/relevant/safe, performs the work, and reports the capability's material contribution |

For a change to the skill, run the same cases before and after. Publish prompt artifacts for Prepare cases and changed-file/validation evidence for Run cases, plus target/runtime and reviewer notes; do not optimize solely for token count.
