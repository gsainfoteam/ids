import 'package:flutter/painting.dart';

import '../../tokens/ids_color_roles.dart';
import '../color/palette_scales.dart';

extension ControlStateColors on IdsColors {
  Color get bgNeutralSoftHover =>
      withStateLayer(bgNeutralSoft, bgNeutralSolid, IdsStateOpacity.tintHover);
  Color get bgNeutralSoftActive =>
      withStateLayer(bgNeutralSoft, bgNeutralSolid, IdsStateOpacity.tintPress);
  Color get bgPrimaryHover => withStateLayer(
    bgPrimarySolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillHover,
  );
  Color get bgPrimarySoftHover =>
      withStateLayer(bgPrimarySoft, bgPrimarySolid, IdsStateOpacity.tintHover);
  Color get bgPrimaryActive => withStateLayer(
    bgPrimarySolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillPress,
  );
  Color get bgPrimarySoftActive =>
      withStateLayer(bgPrimarySoft, bgPrimarySolid, IdsStateOpacity.tintPress);
  Color get bgSecondaryHover => withStateLayer(
    bgSecondarySolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillHover,
  );
  Color get bgSecondarySoftHover => withStateLayer(
    bgSecondarySoft,
    bgSecondarySolid,
    IdsStateOpacity.tintHover,
  );
  Color get bgSecondaryActive => withStateLayer(
    bgSecondarySolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillPress,
  );
  Color get bgSecondarySoftActive => withStateLayer(
    bgSecondarySoft,
    bgSecondarySolid,
    IdsStateOpacity.tintPress,
  );
  Color get bgTertiaryHover => withStateLayer(
    bgTertiarySolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillHover,
  );
  Color get bgTertiarySoftHover => withStateLayer(
    bgTertiarySoft,
    bgTertiarySolid,
    IdsStateOpacity.tintHover,
  );
  Color get bgTertiaryActive => withStateLayer(
    bgTertiarySolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillPress,
  );
  Color get bgTertiarySoftActive => withStateLayer(
    bgTertiarySoft,
    bgTertiarySolid,
    IdsStateOpacity.tintPress,
  );
  Color get bgDangerHover => withStateLayer(
    bgDangerSolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillHover,
  );
  Color get bgDangerSoftHover =>
      withStateLayer(bgDangerSoft, bgDangerSolid, IdsStateOpacity.tintHover);
  Color get bgDangerActive => withStateLayer(
    bgDangerSolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillPress,
  );
  Color get bgDangerSoftActive =>
      withStateLayer(bgDangerSoft, bgDangerSolid, IdsStateOpacity.tintPress);
  Color get bgSuccessHover => withStateLayer(
    bgSuccessSolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillHover,
  );
  Color get bgSuccessSoftHover =>
      withStateLayer(bgSuccessSoft, bgSuccessSolid, IdsStateOpacity.tintHover);
  Color get bgSuccessActive => withStateLayer(
    bgSuccessSolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillPress,
  );
  Color get bgSuccessSoftActive =>
      withStateLayer(bgSuccessSoft, bgSuccessSolid, IdsStateOpacity.tintPress);
  Color get bgWarningHover => withStateLayer(
    bgWarningSolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillHover,
  );
  Color get bgWarningSoftHover =>
      withStateLayer(bgWarningSoft, bgWarningSolid, IdsStateOpacity.tintHover);
  Color get bgWarningActive => withStateLayer(
    bgWarningSolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillPress,
  );
  Color get bgWarningSoftActive =>
      withStateLayer(bgWarningSoft, bgWarningSolid, IdsStateOpacity.tintPress);
  Color get bgInfoHover => withStateLayer(
    bgInfoSolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillHover,
  );
  Color get bgInfoSoftHover =>
      withStateLayer(bgInfoSoft, bgInfoSolid, IdsStateOpacity.tintHover);
  Color get bgInfoActive => withStateLayer(
    bgInfoSolid,
    IdsStateLayer.fillColor,
    IdsStateOpacity.fillPress,
  );
  Color get bgInfoSoftActive =>
      withStateLayer(bgInfoSoft, bgInfoSolid, IdsStateOpacity.tintPress);
}
