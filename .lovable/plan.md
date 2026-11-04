# Results page layout check

## Current structure

```text
<section flex-col>                      outer container (stacks vertically)
  <Link "Scan another">                 extra: back link at top
  <div content box>
  <div>                                 extra wrapper
    <textarea text box>
  </div>
  <div grid 3 columns>                  QR row (grid, not flex)
    <Button Copy text>
    <div><img QR code></div>            QR image sits in a white padded card
    <Button Move text to URL>
  </div>
</section>
```

It already matches your outline in order and nesting. The differences:
1. A "Scan another" back link sits above the content box.
2. The text box has an extra wrapper div around it.
3. The QR row uses a 3-column grid rather than a flex row, and has no id.

## Proposed cleanup (looks the same on screen)

- Remove the extra wrapper around the text box so it's a direct child of the outer container.
- Give the QR row `id="qr_code_container"` and make it a horizontal flex row: fixed-width buttons on each side, QR card growing in the middle. Current button heights, spacing, outer-edge rounding, fills and borders stay unchanged.
- Keep the "Scan another" link above everything (tell me if you want it removed).
- Add this prompt to prompt.md.

## Check

- Screenshot on desktop and phone sizes to confirm nothing moved or overlapped.
