import 'package:flutter/painting.dart';

import 'contrast.dart';
import 'oklch.dart';

const distinctFamilies = 0.039;

const distinctUnderRedGreenCvd = 0.07;

const comparedStep = 600;

const redGreenPairs = [('success', 'danger'), ('warning', 'danger')];

double distanceBetween(Color first, Color second) =>
    oklabDistance(first, second);

bool tooClose(Color first, Color second) =>
    distanceBetween(first, second) < distinctFamilies;

bool alikeUnderRedGreenCvd(Color first, Color second) =>
    distanceUnderRedGreenCvd(first, second) < distinctUnderRedGreenCvd;
