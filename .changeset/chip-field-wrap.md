---
'@gsainfoteam/ids-react': patch
---

ChipField keeps its rows even when chips wrap: chips and the input wrap inside a `data-chip-field-values` column with a 4px row gap, while adornments and the chevron stay in their own column, centered. The input is as wide as the text typed into it, so it stays on the chip line and moves to the next row only when that text does not fit. Once a chip is chosen the input hides its placeholder.
