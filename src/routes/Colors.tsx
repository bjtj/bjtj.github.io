import { useEffect, useState } from 'react';

type Rgb = {
  r: number,
  g: number,
  b: number,
}

function save(k: string, v: string) {
  window.localStorage.setItem(k, v);
}

function load(k: string, def: string): string {
  return window.localStorage.getItem(k) ?? def;
}

function clip(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(v, min));
}

export default function Colors() {

  const [rgb, setRgb] = useState<Rgb>({
    r: parseInt(load('red', '0')),
    g: parseInt(load('green', '0')),
    b: parseInt(load('blue', '0'))
  });

  useEffect(() => {
    save('red', rgb.r.toString());
    save('green', rgb.g.toString());
    save('blue', rgb.b.toString());
  }, [rgb]);

  return (
    <div className="max-w-lg">
      <h1>Colors</h1>
      <div className="rounded bg-base-200 p-3 mb-2">
        <div className="flex gap-1">
          <div className="w-16 h-16" style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}></div>
          <div>
            <div>rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
            <div>
              <code>{`#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`}</code>
            </div>
          </div>
        </div>
        <div className="h-1" />
        <div className="flex items-center gap-1">
          <span>R</span>
          <input
            type="number"
            className="input input-sm w-fit"
            value={rgb.r}
            min={0}
            max={255}
            onChange={e => setRgb(prev => ({
              ...prev,
              r: clip(parseInt(e.target.value), 0, 255) }))} />
          <span>G</span>
          <input
            type="number"
            className="input input-sm w-fit"
            value={rgb.g}
            min={0}
            max={255}
            onChange={e => setRgb(prev => ({
              ...prev,
              g: clip(parseInt(e.target.value), 0, 255) }))} />
          <span>B</span>
          <input
            type="number"
            className="input input-sm w-fit"
            value={rgb.b}
            min={0}
            max={255}
            onChange={e => setRgb(prev => ({
              ...prev,
              b: clip(parseInt(e.target.value), 0, 255) }))} />
        </div>
      </div>

      <div className="rounded bg-base-200 p-3 mb-2">
        <ColorPickerBox />
      </div>
    </div>)
}


function ColorPickerBox() {
  const [color, setColor] = useState<string>(load('color', "#000000"));
  useEffect(() => {
    save('color', color);
  }, [color]);

  return (
    <div className="flex items-center gap-1">
      <input
        type="color"
        value={color}
        onInput={e => setColor(e.currentTarget.value)} />
      <input
        type="text"
        className="input input-sm w-50"
        value={color}
        onInput={e => setColor(e.currentTarget.value)} />
    </div>);
}
