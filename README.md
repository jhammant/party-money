# 💰 Party Money — UK Political Donations Visualiser

Interactive visualisation of UK political party donations from the Electoral Commission (2022–2025).

🔗 **Live:** [jhammant.github.io/party-money](https://jhammant.github.io/party-money/)

## What's Here

A single-page app showing **14,062 donations totalling £309.6M** across all UK parties.

### Views

1. **🫧 Bubble Chart** — Interactive force-directed bubbles sized by donation amount, colored by primary party. Drag, hover, click to explore.
2. **🌳 Tree View** — Expandable hierarchy: Party → Donors, with amounts and donor types.

### Features

- Search by donor name
- Filter by party, year, donor type
- Click any donor to see full breakdown (parties, years, individual donations)
- Dark theme, mobile-friendly
- All data embedded — no API calls

### Key Stats

| Party | Total | Donations | Top Donor |
|-------|-------|-----------|-----------|
| Conservative | £119.7M | 4,431 | THE PHOENIX PARTNERSHIP (£15.3M) |
| Labour | £104.1M | 2,920 | Lord David Sainsbury (£7.7M) |
| Liberal Democrats | £35.2M | 4,848 | House Of Commons Fees Office (£6.2M) |
| Reform UK | £22.2M | 273 | Christopher Harborne (£9.0M) |

## Data Source

[Electoral Commission — Donations Search](https://search.electoralcommission.org.uk/Search/Donations)

## Tech

- D3.js v7 for visualisations
- Vanilla JS, no frameworks
- Single HTML file (~1.8MB with embedded data)

## Build

```bash
node process-data.js  # Process CSV → JSON
node build.js         # Inject JSON into HTML
```
