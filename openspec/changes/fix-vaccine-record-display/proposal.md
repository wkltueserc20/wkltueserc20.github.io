# Proposal: Fix Vaccine Record Display on Home Page

## Problem

When a vaccine record is added, the home page record list displays `undefinedkg / undefinedcm` instead of meaningful vaccine information.

**Root cause:** `src/components/Records/RecordList.tsx` uses a conditional chain to render record summaries. The final `else` fallback renders `${record.weight}kg / ${record.height}cm`, which is intended for `growth` records. Since `vaccine` records have no `weight` or `height` fields, they fall through to this fallback and produce `undefinedkg / undefinedcm`.

The same issue affects the icon: both `vaccine` and `growth` records fall through to the `🌱` emoji fallback.

## Affected File

`src/components/Records/RecordList.tsx` — two locations:

1. **Icon block** (line ~92): no `vaccine` case, falls through to `🌱`
2. **Text block** (line ~107): no `vaccine` case, falls through to `${weight}kg / ${height}cm`

## Proposed Fix

Add explicit `vaccine` handling in both locations.

### Icon fix
```diff
  : record.type === 'medication' ? '💊'
+ : record.type === 'vaccine' ? '💉'
  : '🌱'
```

### Text fix
```diff
  : record.type === 'medication'
  ? `${record.label || '用藥'}${record.amount ? ` ${record.amount}${record.subType || ''}` : ''}`
+ : record.type === 'vaccine'
+ ? `${record.subType || '疫苗'}${record.label ? ` ${record.label}` : ''}`
  : `${record.weight}kg / ${record.height}cm`
```

Vaccine records use `subType` for the vaccine name and `label` for the dose, e.g.:

```
💉  B型肝炎疫苗 第1劑
    09:30 上午
```

## Scope

- 2-line change in one file
- No data model changes
- No new dependencies
- `growth` records are unaffected
