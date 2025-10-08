# Formata — the schema-driven form builder

> Beautiful, universal, JSON Schema–driven forms built with web components, powered by Lit / FAST, styled with Tailwind.

Formata is a lightweight yet powerful form builder that renders dynamic forms directly from JSON Schema definitions.  
It works everywhere — React, Svelte, Vue, or plain HTML — because it’s built on native Custom Elements.

---

## Features

- JSON Schema–based  
  Generate full CRUD forms from standard JSON Schema (draft 2020-12)  
  Supports oneOf, allOf, conditional logic, defaults, and dependencies

- Framework-agnostic  
  Runs in any environment that supports Web Components (React, Svelte, Vue, Astro…)

- Beautiful by default  
  Styled with TailwindCSS and CSS Custom Properties  
  Inspired by Shadcn/UI and Shoelace

- Extensible  
  Plug-and-play field renderers: register your own web components for custom input types  
  Built-in support for async/autocomplete fields (remote data fetching)

- Validated  
  Uses AJV for schema validation (sync + async)

- Storage-agnostic  
  Works seamlessly with schemaless databases (MongoDB, PocketBase, etc.)  
  Optional schema inference tools

---

## Architecture overview
```
 ┌────────────────────────────┐
 │       Your App (any)       │
 │  React / Svelte / Vanilla  │
 └────────────┬───────────────┘
              │
      (Web Components)
              │
 ┌────────────┴────────────┐
 │   Form Renderer Core    │ ← parses JSON Schema + UI hints
 │    - Layout engine      │
 │    - Field registry     │
 │    - Validation (AJV)   │
 └────────────┬────────────┘
              │
        (Schema + Data)
              │
   ┌──────────┴──────────┐
   │ Mongo / PocketBase  │
   │  or REST / GraphQL  │
   └─────────────────────┘

```
