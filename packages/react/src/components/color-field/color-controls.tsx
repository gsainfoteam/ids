import { useState } from 'react';

import {
  clamp,
  hsvToRgb,
  parseColor,
  rgbToHsv,
  serializeColor,
  type ColorFormat,
  type RGBA,
} from './color';
export type ColorControlsProps = {
  value: string;
  onChange: (value: string) => void;
  format: ColorFormat;
  alpha: boolean;
  swatches?: string[];
  variant: 'default' | 'compact' | 'swatchOnly';
  size: 'standard' | 'tiny';
};
export function ColorControls({
  value,
  onChange,
  format,
  alpha,
  swatches,
  variant,
  size,
}: ColorControlsProps) {
  const color = parseColor(value) ?? { r: 255, g: 0, b: 0, a: 1 };
  const hsv = rgbToHsv(color);
  const [lastHsv, setLastHsv] = useState({ h: hsv.h, s: hsv.s });
  const hue = hsv.s === 0 ? lastHsv.h : hsv.h;
  const saturation = hsv.v === 0 ? lastHsv.s : hsv.s;
  const [draft, setDraft] = useState<{ value: string; text: string } | null>(null);
  const text = draft?.value === value ? draft.text : value;
  const emit = (next: RGBA) => onChange(serializeColor(next, format, alpha));
  const setHsv = (h: number, s: number, v: number) => {
    setLastHsv({ h, s });
    emit(hsvToRgb(h, s, v, color.a));
  };
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width && rect.height)
      setHsv(
        hue,
        clamp((event.clientX - rect.left) / rect.width),
        1 - clamp((event.clientY - rect.top) / rect.height),
      );
  };
  const gradient = 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)';
  return (
    <div className="grid gap-3 p-1" data-color-controls="">
      {variant === 'default' && (
        <div
          role="slider"
          tabIndex={0}
          aria-label="채도와 명도"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(saturation * 100)}
          aria-valuetext={`채도 ${Math.round(saturation * 100)}%, 명도 ${Math.round(hsv.v * 100)}%`}
          className="relative w-full touch-none overflow-hidden rounded-lg outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--ids-color-primary)"
          style={{
            height: size === 'tiny' ? 140 : 200,
            background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${hue}, 100%, 50%)`,
          }}
          onPointerDown={(event) => {
            if (event.button !== 0 || event.isPrimary === false) return;
            event.currentTarget.focus({ preventScroll: true });
            event.currentTarget.setPointerCapture(event.pointerId);
            move(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event);
          }}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 0.1 : 0.01;
            if (
              ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)
            ) {
              event.preventDefault();
              setHsv(
                hue,
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? 1
                    : clamp(
                        saturation +
                          (event.key === 'ArrowRight'
                            ? step
                            : event.key === 'ArrowLeft'
                              ? -step
                              : 0),
                      ),
                clamp(
                  hsv.v + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0),
                ),
              );
            }
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            style={{
              left: `${saturation * 100}%`,
              top: `${(1 - hsv.v) * 100}%`,
              background: serializeColor(color, 'rgb', false),
            }}
          />
        </div>
      )}
      {variant !== 'swatchOnly' && (
        <>
          <label className="grid gap-1 text-xs">
            색조
            <input
              type="range"
              min={0}
              max={359}
              step={1}
              value={Math.round(hue)}
              onChange={(e) => setHsv(Number(e.target.value), saturation, hsv.v)}
              style={{ background: gradient }}
              className="h-4 w-full cursor-pointer appearance-none rounded-full"
            />
          </label>
          {alpha && (
            <label className="grid gap-1 text-xs">
              투명도
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(color.a * 100)}
                onChange={(e) => emit({ ...color, a: Number(e.target.value) / 100 })}
              />
            </label>
          )}
          <label className="grid gap-1 text-xs">
            색상 값
            <input
              type="text"
              value={text}
              spellCheck={false}
              aria-invalid={!!text && !parseColor(text)}
              placeholder={
                format === 'hex' ? '#RRGGBB' : format === 'rgb' ? 'rgb(0, 0, 0)' : 'hsl(0, 0%, 0%)'
              }
              className="h-9 min-w-0 rounded-lg border border-(--ids-color-outline) bg-transparent px-2 text-sm"
              onChange={(e) => {
                const raw = e.target.value;
                const parsed = parseColor(raw);
                const next = parsed ? serializeColor(parsed, format, alpha) : value;
                setDraft({ value: next, text: raw });
                if (parsed) onChange(next);
              }}
              onBlur={() => setDraft(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setDraft(null);
                }
              }}
            />
          </label>
        </>
      )}
      {!!swatches?.length && (
        <div role="group" aria-label="색상 팔레트" className="flex flex-wrap gap-2">
          {swatches.map((swatch, index) => {
            const parsed = parseColor(swatch);
            if (!parsed) return null;
            const normalized = serializeColor(parsed, format, alpha);
            return (
              <button
                key={`${swatch}-${index}`}
                type="button"
                aria-label={swatch}
                aria-pressed={normalized === value}
                title={swatch}
                onClick={() => emit(parsed)}
                className="size-7 rounded-md border border-(--ids-color-outline) outline-offset-2 focus-visible:outline-2 aria-pressed:outline-2 aria-pressed:outline-(--ids-color-primary)"
                style={{ backgroundColor: serializeColor(parsed, 'rgb', true) }}
              />
            );
          })}
        </div>
      )}
      {variant === 'swatchOnly' && !swatches?.length && (
        <p className="text-sm">선택 가능한 색상이 없습니다.</p>
      )}
    </div>
  );
}
