import type { messageArguments } from './message-arguments';
import type { IdsMessageCatalog } from './messages';

type ArgumentTypes = typeof messageArguments;

type ArgumentValue<Type> = Type extends 'number' ? number : string;

export type IdsMessageArguments<Key extends string> = Key extends keyof ArgumentTypes
  ? { [Name in keyof ArgumentTypes[Key]]: ArgumentValue<ArgumentTypes[Key][Name]> }
  : never;

type Message<Key extends string> = Key extends keyof ArgumentTypes
  ? string | ((values: IdsMessageArguments<Key>) => string)
  : string;

type MessagesOf<Tree, Prefix extends string> = {
  [Name in keyof Tree & string]: Tree[Name] extends string
    ? Message<`${Prefix}${Name}`>
    : MessagesOf<Tree[Name], `${Prefix}${Name}.`>;
};

export type IdsMessages = MessagesOf<IdsMessageCatalog, ''>;

type PartialMessages<Tree> = {
  [Name in keyof Tree]?: Tree[Name] extends string | ((values: never) => string)
    ? Tree[Name]
    : PartialMessages<Tree[Name]>;
};

export type IdsPartialMessages = PartialMessages<IdsMessages>;

type LocaleTag<Language extends string> = Language | `${Language}-${string}`;

export type FullLocale<Language extends string> = {
  language: Language;
  tag: LocaleTag<NoInfer<Language>>;
  messages: IdsMessages;
  base?: undefined;
};

export type PartialLocale<Language extends string> = {
  language: Language;
  tag: LocaleTag<NoInfer<Language>>;
  messages: IdsPartialMessages;
  base: IdsLocale;
};

export type IdsLocale<Language extends string = string> =
  FullLocale<Language> | PartialLocale<Language>;

export function defineIdsLocale<const Language extends string>(
  locale: FullLocale<Language>,
): FullLocale<Language>;
export function defineIdsLocale<const Language extends string>(
  locale: PartialLocale<Language>,
): PartialLocale<Language>;
export function defineIdsLocale(locale: IdsLocale): IdsLocale {
  return locale;
}
