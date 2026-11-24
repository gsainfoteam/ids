import c from 'refractor/c';
import { refractor, type Syntax } from 'refractor/core';
import cpp from 'refractor/cpp';
import csharp from 'refractor/csharp';
import dart from 'refractor/dart';
import docker from 'refractor/docker';
import go from 'refractor/go';
import graphql from 'refractor/graphql';
import ini from 'refractor/ini';
import java from 'refractor/java';
import kotlin from 'refractor/kotlin';
import lua from 'refractor/lua';
import makefile from 'refractor/makefile';
import objectivec from 'refractor/objectivec';
import php from 'refractor/php';
import ruby from 'refractor/ruby';
import rust from 'refractor/rust';
import scss from 'refractor/scss';
import swift from 'refractor/swift';
import toml from 'refractor/toml';

export const LAZY_LANGUAGES: Syntax[] = [
  c,
  cpp,
  csharp,
  dart,
  docker,
  go,
  graphql,
  ini,
  java,
  kotlin,
  lua,
  makefile,
  objectivec,
  php,
  ruby,
  rust,
  scss,
  swift,
  toml,
];

export function registerLazyLanguages() {
  LAZY_LANGUAGES.forEach((syntax) => refractor.register(syntax));
}
