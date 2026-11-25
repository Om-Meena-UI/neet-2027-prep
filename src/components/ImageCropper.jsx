import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Check, RotateCw, RotateCcw, Crop, X } from 'lucide-react';

const MIN_CROP_PCT = 8;

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [displaySrc, setDisplaySrc] = useState(imageSrc);
  const [crop, setCrop] = useState({ x: 4, y: 4, w: 92, h: 92 });
  const [isApplying, setIsApplying] = useState(false);

  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const dragStateRef = useRef(null);

  useEffect(() => {
    setDisplaySrc(imageSrc);
    setCrop({ x: 4, y: 4, w: 92, h: 92 });
  }, [imageSrc]);

  // Rotate the current displaySrc by 90 degrees clockwise
  const handleRotate = () => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalHeight;
    canvas.height = img.naturalWidth;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    setDisplaySrc(canvas.toDataURL('image/jpeg', 0.92));
    setCrop({ x: 4, y: 4, w: 92, h: 92 });
  };

  const handleResetCrop = () => {
    setCrop({ x: 0, y: 0, w: 100, h: 100 });
  };

  const startDrag = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    dragStateRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      rectWidth: rect.width,
      rectHeight: rect.height,
      initialCrop: { ...crop },
    };
  };

  const handlePointerMove = useCallback((e) => {
    const drag = dragStateRef.current;
    if (!drag) return;

    const dxPct = ((e.clientX - drag.startX) / drag.rectWidth) * 100;
    const dyPct = ((e.clientY - drag.startY) / drag.rectHeight) * 100;
    const { x, y, w, h } = drag.initialCrop;

    let next = { x, y, w, h };

    if (drag.mode === 'move') {
      next.x = Math.max(0, Math.min(100 - w, x + dxPct));
      next.y = Math.max(0, Math.min(100 - h, y + dyPct));
    } else {
      // Horizontal adjustments
      if (drag.mode.includes('w')) {
        const maxDx = w - MIN_CROP_PCT;
        const clampedDx = Math.max(-x, Math.min(maxDx, dxPct));
        next.x = x + clampedDx;
        next.w = w - clampedDx;
      } else if (drag.mode.includes('e')) {
        next.w = Math.max(MIN_CROP_PCT, Math.min(100 - x, w + dxPct));
      }

      // Vertical adjustments
      if (drag.mode.includes('n')) {
        const maxDy = h - MIN_CROP_PCT;
        const clampedDy = Math.max(-y, Math.min(maxDy, dyPct));
        next.y = y + clampedDy;
        next.h = h - clampedDy;
      } else if (drag.mode.includes('s')) {
        next.h = Math.max(MIN_CROP_PCT, Math.min(100 - y, h + dyPct));
      }
    }

    setCrop(next);
  }, []);

  const stopDrag = useCallback(() => {
    dragStateRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
    };
  }, [handlePointerMove, stopDrag]);

  const handleApplyCrop = () => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;

    setIsApplying(true);
    try {
      const sx = Math.round((crop.x / 100) * img.naturalWidth);
      const sy = Math.round((crop.y / 100) * img.naturalHeight);
      const sw = Math.max(1, Math.round((crop.w / 100) * img.naturalWidth));
      const sh = Math.max(1, Math.round((crop.h / 100) * img.naturalHeight));

      let outW = sw;
      let outH = sh;
      const maxDim = 1200;
      if (outW > maxDim || outH > maxDim) {
        if (outW > outH) {
          outH = Math.round((outH * maxDim) / outW);
          outW = maxDim;
        } else {
          outW = Math.round((outW * maxDim) / outH);
          outH = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

      const outputFormat = 'image/jpeg';
      const dataUrl = canvas.toDataURL(outputFormat, 0.85);
      const head = 'data:' + outputFormat + ';base64,';
      const sizeBytes = Math.round(((dataUrl.length - head.length) * 3) / 4);

      onCropComplete({
        dataUrl,
        width: outW,
        height: outH,
        sizeKb: Math.round(sizeBytes / 1024),
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#55e357]/30 bg-[#0e1013] p-3 sm:p-4 space-y-3">
      {/* Cropper Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Crop className="w-4 h-4 text-[#55e357]" />
          <span className="text-xs font-bold text-white">
            Drag corners to crop question
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRotate}
            className="px-2.5 py-1.5 rounded-xl bg-[#1a1d24] hover:bg-[#262a34] text-zinc-200 text-[11px] font-semibold flex items-center gap-1 border border-white/10 transition active:scale-95"
            title="Rotate 90° clockwise"
          >
            <RotateCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Rotate</span>
          </button>
          <button
            type="button"
            onClick={handleResetCrop}
            className="px-2.5 py-1.5 rounded-xl bg-[#1a1d24] hover:bg-[#262a34] text-zinc-200 text-[11px] font-semibold flex items-center gap-1 border border-white/10 transition active:scale-95"
            title="Select full image"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Full</span>
          </button>
        </div>
      </div>

      {/* Interactive Crop Canvas Area */}
      <div className="flex justify-center bg-black/70 rounded-xl p-2 overflow-hidden">
        <div
          ref={containerRef}
          className="relative inline-block select-none touch-none overflow-hidden rounded-lg"
        >
          <img
            ref={imgRef}
            src={displaySrc}
            alt="Crop target"
            draggable={false}
            className="block max-h-[46vh] w-auto max-w-full object-contain pointer-events-none"
          />

          {/* Draggable Crop Box */}
          <div
            onPointerDown={(e) => startDrag(e, 'move')}
            style={{
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.w}%`,
              height: `${crop.h}%`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
            }}
            className="absolute border-2 border-[#55e357] cursor-move"
          >
            {/* Rule-of-thirds grid */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>

            {/* Corner Handles (large touch targets) */}
            <div
              onPointerDown={(e) => startDrag(e, 'nw')}
              className="absolute -top-3 -left-3 w-7 h-7 flex items-center justify-center cursor-nwse-resize"
            >
              <span className="w-3.5 h-3.5 rounded-sm bg-[#55e357] border-2 border-black shadow" />
            </div>
            <div
              onPointerDown={(e) => startDrag(e, 'ne')}
              className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center cursor-nesw-resize"
            >
              <span className="w-3.5 h-3.5 rounded-sm bg-[#55e357] border-2 border-black shadow" />
            </div>
            <div
              onPointerDown={(e) => startDrag(e, 'sw')}
              className="absolute -bottom-3 -left-3 w-7 h-7 flex items-center justify-center cursor-nesw-resize"
            >
              <span className="w-3.5 h-3.5 rounded-sm bg-[#55e357] border-2 border-black shadow" />
            </div>
            <div
              onPointerDown={(e) => startDrag(e, 'se')}
              className="absolute -bottom-3 -right-3 w-7 h-7 flex items-center justify-center cursor-nwse-resize"
            >
              <span className="w-3.5 h-3.5 rounded-sm bg-[#55e357] border-2 border-black shadow" />
            </div>

            {/* Edge Handles */}
            <div
              onPointerDown={(e) => startDrag(e, 'n')}
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 flex items-center justify-center cursor-ns-resize"
            >
              <span className="w-6 h-1 rounded-full bg-[#55e357]" />
            </div>
            <div
              onPointerDown={(e) => startDrag(e, 's')}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-4 flex items-center justify-center cursor-ns-resize"
            >
              <span className="w-6 h-1 rounded-full bg-[#55e357]" />
            </div>
            <div
              onPointerDown={(e) => startDrag(e, 'w')}
              className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-10 flex items-center justify-center cursor-ew-resize"
            >
              <span className="w-1 h-6 rounded-full bg-[#55e357]" />
            </div>
            <div
              onPointerDown={(e) => startDrag(e, 'e')}
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-10 flex items-center justify-center cursor-ew-resize"
            >
              <span className="w-1 h-6 rounded-full bg-[#55e357]" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#1a1d24] hover:bg-[#262a34] border border-white/10 transition flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>Use Full Image</span>
        </button>
        <button
          type="button"
          disabled={isApplying}
          onClick={handleApplyCrop}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#55e357] hover:bg-[#48ce4a] text-black transition shadow-glow-lime active:scale-95 flex items-center gap-1.5 disabled:opacity-60"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isApplying ? 'Cropping...' : 'Apply Crop'}</span>
        </button>
      </div>
    </div>
  );
}
