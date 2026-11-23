import 'dart:convert';
import 'dart:io';

const printFlag = '--print';

void deliver(Map<String, String> outputs, List<String> arguments) {
  if (arguments.contains(printFlag)) {
    stdout.write(jsonEncode(outputs));
    return;
  }
  for (final MapEntry(key: path, value: source) in outputs.entries) {
    File(path).writeAsStringSync(source);
  }
}

List<String> positional(List<String> arguments, int count, String usage) {
  final values = arguments
      .where((argument) => !argument.startsWith('--'))
      .toList();
  if (values.length != count) throw ArgumentError(usage);
  return values;
}
