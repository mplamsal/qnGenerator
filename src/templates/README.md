# Templates

This folder powers everything about how a question paper is laid out, previewed,
and exported to PDF. A **template** is a name + orientation + a `config` object
(`TemplateConfig`). The exact same `config` drives both outputs, so what you see
in the page-editor preview is what you get in the printed PDF:

- **Page-editor preview** (HTML) — `TemplatePreviewRenderer`
- **PDF / print** (react-pdf) — `TemplatePdfRenderer`

Both live in [`TemplateRenderer.tsx`](./TemplateRenderer.tsx). All built-in
templates are plain JSON in [`data/templates.json`](./data/templates.json), and
user-made templates (the "Page Template Builder" UI) use the **same** renderer
via [`SavedTemplateRenderer.tsx`](./SavedTemplateRenderer.tsx).

## Units

Every numeric size is in **PDF points (pt)**, the unit react-pdf uses. The
preview multiplies pt by a constant (`PT_TO_PX`) so the HTML preview and the PDF
stay proportionally identical. A4 ≈ `595 × 842 pt` (portrait).

## Config reference (`TemplateConfig`)

```jsonc
{
  "margins":   { "top": 24, "right": 56, "bottom": 54, "left": 56 }, // page padding (pt)

  "header": {                     // which header lines appear
    "enabled": true,
    "showSchoolName": true,
    "showExamTitle": true,
    "showSubjectLine": true,
    "showMetaRow": true           // Class / Time / F.M. row
  },

  "headerStyle": {
    "showLogo": true,
    "borderStyle": "box",         // "box" | "bottom-line" | "none"
    "paddingVertical": 8,         // header box inner padding (pt) — affects height
    "paddingHorizontal": 12
  },

  "fontSizes": {                  // pt, per element
    "schoolName": 12, "examTitle": 13, "subjectLine": 12, "metaRow": 10,
    "instructions": 11, "questionText": 12, "mcqOption": 11, "footer": 9
  },

  "instructions": "Answer all questions.",
  "footerText": "Good luck!",

  "questionStyle": {
    "showMarks": true,
    "numberingStyle": "number",   // "number" (1,2,3) | "letter" (a,b,c)
    "spacing": 10                 // vertical gap between questions (pt)
  },

  "questionLayout": {
    "columns": 1,                 // 1 = single flow, 2 = split questions across the page
    "mcqColumns": 2,              // 1 | 2 | 4 — MCQ options per row
    "showAnswerLines": false,
    "answerLineCount": 0,
    "showDateNameFields": false   // Name / Date / Roll No. blanks
  },

  "layout": {                     // compactness + page-layout controls
    "twinColumns": false,         // two identical tear-off copies side by side
    "lineHeight": 1.5,            // text line-height multiplier (lower = denser)
    "headerSpacing": 5,           // gap between header lines (pt) — drives header height
    "sectionSpacing": 10,         // gap below header / instructions (pt)
    "columnGap": 14,              // gap between columns / twin halves (pt)
    "cutLine": "dashed"           // twin divider: "dashed" | "solid" | "none"
  }
}
```

## How to control the layout

### Compactness (fit more on a page)
- Use the **Density preset** buttons (Compact / Cozy / Spacious) for a one-click
  change, then fine-tune the individual values.
- `layout.lineHeight` — biggest lever for text density.
- `layout.headerSpacing` + `headerStyle.paddingVertical` — shrink the header box.
- `layout.sectionSpacing` — tighten the gaps around the header and instructions.
- `questionStyle.spacing` — gap between questions.
- `margins.*` — reclaim page edges.

### `columns` vs `twinColumns` — important distinction
These two look similar but do **opposite** things:

| Setting | What it does | Use when |
| --- | --- | --- |
| `questionLayout.columns: 2` | Splits **one** paper's questions across two columns (Q1 left, Q2 right, Q3 left …). | You want a newspaper-style single paper. |
| `layout.twinColumns: true` | Prints **two identical full copies** side by side, separated by a cut line. Each half is a complete paper. | You want to print two papers per sheet and tear the sheet in half. |

With `twinColumns` both halves are an exact clone — no question is ever split
between the two sides.

### Twin tear-off (maximize an A4)
1. Set `orientation: "landscape"`.
2. Set `layout.twinColumns: true`.
3. Keep `questionLayout.columns: 1` so each copy is a clean single flow.
4. Pick a `layout.cutLine` (`dashed` is easiest to cut along).
5. Print, then cut down the middle → two identical A5 papers.

See the built-in **"Twin Tear-off (Landscape)"** template for a ready example.

### Landscape, single question flow
Set `orientation: "landscape"` and `questionLayout.columns: 1` (and leave
`twinColumns: false`). This gives one wide column of questions — good for tables,
diagrams, or long questions. See **"Landscape (Single Column)"**.

## Adding a built-in template

Append an object to [`data/templates.json`](./data/templates.json):

```jsonc
{
  "id": "my-template",            // unique
  "name": "My Template",
  "description": "Shown in the picker.",
  "category": "Unit Test",        // groups it in the selector
  "orientation": "portrait",      // "portrait" | "landscape"
  "config": { /* see reference above */ }
}
```

`resolveLayout()` fills defaults for any missing `layout` field, so older
templates keep working, but include the full block for clarity. After editing,
the template appears automatically in the picker (`templateReader.ts` loads the
JSON).

## Backward compatibility

`resolveLayout(config)` in `TemplateRenderer.tsx` merges a saved/built-in config
over `DEFAULT_LAYOUT`. If you add a new `layout` field, add it to `DEFAULT_LAYOUT`
(and `DEFAULT_TEMPLATE_CONFIG` in `SavedTemplateRenderer.tsx`) so existing
templates render without modification.
