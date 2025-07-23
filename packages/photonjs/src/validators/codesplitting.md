# Vercel example

/functions/a
/functions/b

## `codeSplitting: true`

Frameworks and libs declare handlers through `addPhotonEntry`

- /functions/a
  - photon server entry
    - photon handler a
    - `photon.handlers.a.vercel`
- /functions/b
  - photon server entry
    - photon handler b
    - `photon.handlers.b.vercel`

## `codeSplitting: false`

Frameworks and libs declare handlers through `addPhotonEntry`?

- /functions/a
  - photon server entry
    - all photon handlers
    - `photon.handlers.a.vercel`
- /functions/b
  - photon server entry
    - all photon handlers
    - `photon.handlers.b.vercel`
