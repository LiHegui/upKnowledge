# User History Archive

This folder stores per-user history archives as JSON files.

## Stability baseline

- Single source of truth: this folder only
- Schema-first: all user archives must conform to `schema.json`
- Append-only events: never delete history events unless user explicitly asks

## Naming

- One file per user
- File name format: `<username>.json`
- Example: `hegui.json`

## Purpose

Use these files as long-term archives for different history categories, for example:

- interview practice history
- TypeScript level progression history
- learning plan execution history
- custom notes and milestones

## JSON Rules

- Use UTF-8 encoding
- Keep top-level keys stable for tooling compatibility
- Do not remove existing history records; append new events
- Use ISO date format for timestamps (for example: `2026-06-01T10:30:00+08:00`)

## Recommended Update Strategy

1. Append a new event into `events`
2. Update `summary` counters
3. Update `updatedAt`

## Example file

See `hegui.json` in this folder.

## Required files in this folder

- `schema.json`: canonical JSON schema for validation
- `_template.json`: starter template for new users
- `{username}.json`: per-user archive instance (for example `hegui.json`)

## Canonical event types

Recommended event types for cross-skill consistency:

- `interview.practice`
- `learning.plan.created`
- `learning.daily.generated`
- `learning.stage.completed`
- `kb.inject`
- `system.init`

Other custom types are allowed, but should follow lowercase dot notation.

## Migration from legacy archives

Legacy archive formats are deprecated.

- Deprecated: `docs/interview/.progress/{username}.md`
- Target: `docs/interview/.history/{username}.json`

Migration rules:

1. Parse old records and append them into `events`
2. Recalculate summary counters
3. Keep old files for reference only; do not continue writing to them

## Skill and agent binding (strong association)

The following workflows must write into this folder:

- interviewer agent: interview progress and scores
- learn-plan skill: plan creation and daily tasks
- kb-inject skill: knowledge injection operation logs

Do not create new archive mechanisms outside this folder unless explicitly requested by the user.

## Write checklist (safe mode)

1. Load `{username}.json` (or initialize from `_template.json`)
2. Append one event into `events`
3. Update `summary.totalEvents`
4. Update domain counters if relevant (for example `interviewPracticeCount`, `tsLevel`)
5. Update `summary.lastPracticeAt` when this write is a practice/progress event
6. Update `user.updatedAt`
7. Keep untouched fields as-is

## PowerShell one-command tool

Use `history.ps1` for stable init and append.

File:

- `docs/interview/.history/history.ps1`

Quick examples:

1. Initialize user archive only:

	powershell
	.\docs\interview\.history\history.ps1 -Username hegui -DisplayName hegui -InitOnly

2. Append interview practice event:

	powershell
	.\docs\interview\.history\history.ps1 -Username hegui -EventType interview.practice -Topic TypeScript -Title "TS generic constraints" -Score 8 -Level 1 -Source interviewer -DetailsJson "{\"question\":\"Q: 泛型约束\"}"

3. Append learning daily task event:

	powershell
	.\docs\interview\.history\history.ps1 -Username hegui -EventType learning.daily.generated -Topic TypeScript -Title "Day 2 tasks" -Source learn-plan -DetailsJson "{\"plan\":\"TypeScript Basics\",\"day\":2}"

4. Append knowledge inject event:

	powershell
	.\docs\interview\.history\history.ps1 -Username hegui -EventType kb.inject -Topic TypeScript -Title "Inject conditional types Q&A" -Source kb-inject -DetailsJson "{\"target\":\"docs/interview/Ts/index.md\",\"operation\":\"enhance\"}"
