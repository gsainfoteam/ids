const HANGUL = /[ㄱ-ㆎ가-힣]/;
const LETTER = /[\p{L}\p{N}]/u;

const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

function firstLetter(word: string) {
  const graphemes = segmenter
    ? Array.from(segmenter.segment(word), (part) => part.segment)
    : Array.from(word);
  return graphemes.find((grapheme) => LETTER.test(grapheme)) ?? '';
}

export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const [first] = words;
  if (first === undefined) return '';
  if (HANGUL.test(first)) return firstLetter(first);
  return words.slice(0, 2).map(firstLetter).join('').toLocaleUpperCase();
}
