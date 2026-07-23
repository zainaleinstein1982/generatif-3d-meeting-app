import { RotateCw, Palette, Sliders, Box, X } from 'lucide-react';
import type { PresenterModel } from '@/lib/supabase';

type Props = {
  model: PresenterModel;
  onChange: (model: PresenterModel) => void;
  onClose: () => void;
};

const SHAPES: { id: PresenterModel['type']; label: string }[] = [
  { id: 'crystal', label: 'Crystal' },
  { id: 'torus', label: 'Torus Knot' },
  { id: 'sphere', label: 'Sphere' },
  { id: 'wave', label: 'Wave Field' },
  { id: 'dna', label: 'DNA Helix' },
];

const COLORS = ['#4f8cff', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#f97316'];

export default function ModelEditor({ model, onChange, onClose }: Props) {
  return (
    <div className="absolute right-4 top-20 z-30 w-80 rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Box className="h-4 w-4 text-cyan-400" />
          3D Model Editor
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Box className="h-3 w-3" /> Geometry
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {SHAPES.map((s) => (
              <button
                key={s.id}
                onClick={() => onChange({ ...model, type: s.id })}
                className={`rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                  model.type === s.id
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Palette className="h-3 w-3" /> Primary Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onChange({ ...model, color: c })}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  model.color === c ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Palette className="h-3 w-3" /> Accent Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onChange({ ...model, accentColor: c })}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  model.accentColor === c ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <Sliders className="h-3 w-3" /> Complexity: {Math.round(model.complexity * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={model.complexity}
            onChange={(e) => onChange({ ...model, complexity: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-300">
            <RotateCw className="h-3 w-3" /> Animation Speed: {Math.round(model.speed * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={model.speed}
            onChange={(e) => onChange({ ...model, speed: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}
