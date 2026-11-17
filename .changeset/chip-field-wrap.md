---
'@gsainfoteam/ids-react': patch
---

ChipField keeps its rows even when chips wrap: chips and the input wrap inside a `data-chip-field-values` column with a 4px row gap, while adornments and the chevron stay in their own column, centered. Once a chip is chosen the input hides its placeholder and shrinks to 48px, so it stays on the chip line.
