const HANGUL = /[ㄱ-ㆎ가-힣]/;
const LETTER = /[\p{L}\p{N}]/u;

const segmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

// A code unit can be half of an emoji or a letter without its accent, so a word is cut into
// user-perceived characters, and leading punctuation such as "(" or "@" is skipped.
function firstLetter(word: string) {
  const graphemes = segmenter
    ? Array.from(segmenter.segment(word), (part) => part.segment)
    : Array.from(word);
  return graphemes.find((grapheme) => LETTER.test(grapheme)) ?? '';
}

// A Korean name is one word whose first syllable is the family name ("류현승" -> "류"). Other
// names take the first letter of their first two words ("Ada Lovelace King" -> "AL").
export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const [first] = words;
  if (first === undefined) return '';
  if (HANGUL.test(first)) return firstLetter(first);
  return words.slice(0, 2).map(firstLetter).join('').toLocaleUpperCase();
}
