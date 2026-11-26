---
'@gsainfoteam/ids-react': major
---

Table, Item, Chip, Badge, AvatarGroup, Image, ImageGroup, Message and QRCode follow the props rule: looks go through `variant`, screen elements are parts, and a feature with props of its own lives on its part.

- **Table.** `striped`, `stickyHeader` and `highlightOnHover` are gone. Stripes are `variant="striped"`, the header is always sticky, and a body row with `onClick` takes the hover layer. `Table.Row` drops `selected`: it paints a selected or current row from `aria-selected` and `aria-current`.
- **Item, Card.** `interactive` is gone from Item. An `asChild` Item or Card whose child renders a link or a button (an `<a href>`, a router `Link`, `Accordion.Trigger`) is pressable on its own. A child known only from its rendered element (a `to`-only router link, `Accordion.Trigger`) turns pressable after hydration, not in the server HTML.
- **ItemGroup.** `ordered` is gone. Write `<ItemGroup asChild><ol>…</ol></ItemGroup>`; the rows still go into `<li>`.
- **ChipGroup.** New. It lays chips in a wrapping row, gives them its `size`, and is the only place where removing a chip moves focus to the next one. A chip outside a ChipGroup leaves focus alone.
- **Badge.** `content`, `max`, `showZero` and `invisible` are gone. The count is `<Badge.Indicator count={n} max={99} />`, a dot is `<Badge.Indicator />`, and a badge that should not show is left out: `{unread > 0 && <Badge.Indicator count={unread} />}`.
- **AvatarGroup.** `max`, `total` and `overflowLabel` move to the part: `<AvatarGroup.Overflow max={3} total={128} aria-label="and 125 more" />`. Without the part every avatar is drawn.
- **Image.** `ratio` is gone; wrap the image in `<AspectRatio ratio={4 / 3}>`. `caption` is `<Image.Caption>`. `previewSrc` folds into `preview={{ src }}`.
- **ImageGroup.** `columns` is gone; a grid reads `--image-columns` (3 by default) from the element around it. `defaultZoom` completes the zoom trio, on `Image.Viewer` too.
- **Message.** `status` and `onRetry` are parts: `<Message.Status value="pending" />`, `<Message.Status value="error" />` and `<Message.Retry onClick={resend} />`. The `Message.Status` type is now the part; its value type is `Message.Status.Props['value']`.
- **QRCode.** `finderShape` folds into `shape`: `shape="dots"` keeps the matching finders, `shape={{ modules: 'dots', finders: 'square' }}` picks them apart.

```tsx
<Table variant="striped">…<Table.Row aria-selected={selected}>…</Table.Row>…</Table>

<Badge>
  <IconButton aria-label="알림" icon={<BellIcon />} />
  {unread > 0 && <Badge.Indicator count={unread} />}
</Badge>

<AvatarGroup aria-label="참석자">
  {avatars}
  <AvatarGroup.Overflow max={3} />
</AvatarGroup>

<AspectRatio ratio={1}>
  <Image src={thumb} alt={alt} preview={{ src: full }}>
    <Image.Caption>{caption}</Image.Caption>
  </Image>
</AspectRatio>

<Message align="end">
  <Bubble>보내기 실패한 글</Bubble>
  <Message.Status value="error" />
  <Message.Retry onClick={resend} />
</Message>
```
