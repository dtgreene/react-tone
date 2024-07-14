import clsx from 'clsx';
import { useEffect } from 'react';
import * as Tone from 'tone';
import { proxy, useSnapshot } from 'valtio';
import { javascript } from '@codemirror/lang-javascript';
import { xcodeDark } from '@uiw/codemirror-theme-xcode';
import ReactCodeMirror from '@uiw/react-codemirror';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select';
import { Label } from './ui/Label';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Switch } from './ui/Switch';
import { createStorageProxy } from 'src/lib/utils';

const state = proxy({
  keys: {
    aPressed: false,
    sPressed: false,
    dPressed: false,
    fPressed: false,
    gPressed: false,
    hPressed: false,
    jPressed: false,
    wPressed: false,
    ePressed: false,
    tPressed: false,
    yPressed: false,
    uPressed: false,
  },
});

const offlineState = createStorageProxy('react-tone', {
  octave: '4',
  volume: '-8',
  useKeyboard: true,
  code: `window.createSynth = async (Tone, volume) => {
  const synth = new Tone.PolySynth(Tone.MonoSynth, {
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.1
    }
  });
  const reverb = new Tone.Reverb(2);
  
  Tone.connectSeries(synth, reverb, volume)
  
  return synth
}`,
  codeError: null,
});

const KeyMap = {
  a: {
    stateKey: 'aPressed',
    note: 'C',
  },
  s: {
    stateKey: 'sPressed',
    note: 'D',
  },
  d: {
    stateKey: 'dPressed',
    note: 'E',
  },
  f: {
    stateKey: 'fPressed',
    note: 'F',
  },
  g: {
    stateKey: 'gPressed',
    note: 'G',
  },
  h: {
    stateKey: 'hPressed',
    note: 'A',
  },
  j: {
    stateKey: 'jPressed',
    note: 'B',
  },
  w: {
    stateKey: 'wPressed',
    note: 'C#',
  },
  e: {
    stateKey: 'ePressed',
    note: 'D#',
  },
  t: {
    stateKey: 'tPressed',
    note: 'F#',
  },
  y: {
    stateKey: 'yPressed',
    note: 'G#',
  },
  u: {
    stateKey: 'uPressed',
    note: 'A#',
  },
};

const volume = new Tone.Volume(getStateVolume()).toDestination();

// Tone.AMSynth
// Tone.DuoSynth
// Tone.FMSynth
// Tone.MembraneSynth
// Tone.MetalSynth
// Tone.MonoSynth
// Tone.Synth

const WhiteKey = ({ mapKey, children }) => {
  const snap = useSnapshot(state);
  const entry = KeyMap[mapKey];
  const isPressed = snap.keys[entry.stateKey];
  const handleMouseDown = () => attackKey(entry);
  const handleMouseUp = () => releaseKey(entry);

  return (
    <div
      className={clsx(
        'flex-shrink-0 shadow-lg w-12 h-56 rounded-br-md rounded-bl-md cursor-pointer transition-colors relative',
        {
          'hover:bg-zinc-300 bg-white': !isPressed,
          'bg-zinc-400': isPressed,
        }
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="text-lg w-12 absolute bottom-2 left-0 text-center text-zinc-600">
        {children}
      </div>
    </div>
  );
};

const BlackKey = ({ mapKey, className, children }) => {
  const snap = useSnapshot(state);
  const entry = KeyMap[mapKey];
  const isPressed = snap.keys[entry.stateKey];
  const handleMouseDown = () => attackKey(entry);
  const handleMouseUp = () => releaseKey(entry);

  return (
    <div
      className={clsx(
        'flex-shrink-0 w-8 h-32 rounded-br-md rounded-bl-md cursor-pointer transition-colors absolute',
        {
          'hover:bg-zinc-700 bg-zinc-900': !isPressed,
          'bg-zinc-600': isPressed,
        },
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="text-lg w-8 absolute bottom-2 left-0 text-center text-zinc-400">
        {children}
      </div>
    </div>
  );
};

function getStateVolume() {
  const value = Number(offlineState.volume);
  return isNaN(value) ? 0 : value;
}

function attackKey(key) {
  if (!state.keys[key.stateKey]) {
    window.currentSynth?.forEach((synth) =>
      synth.triggerAttack(`${key.note}${offlineState.octave}`)
    );
    state.keys[key.stateKey] = true;
  }
}

function releaseKey(key) {
  window.currentSynth?.forEach((synth) =>
    synth.triggerRelease(`${key.note}${offlineState.octave}`)
  );
  state.keys[key.stateKey] = false;
}

function handleVolumeChange(event) {
  offlineState.volume = event.target.value;
  volume.set({ volume: getStateVolume() });
}

function handleOctaveChange(value) {
  offlineState.octave = value;
}

function handleUseKeyboardChange(value) {
  offlineState.useKeyboard = value;
}

function handleCodeChange(value) {
  offlineState.code = value;
}

async function handleEvalClick() {
  try {
    window.currentSynth?.forEach((synth) => synth.dispose());
    eval(offlineState.code);

    if (!window.createSynth) {
      throw new Error(`window.createSynth() was not found`);
    }

    const result = await window.createSynth(Tone, volume);

    if (!result) {
      throw new Error('Nothing was returned from createSynth()');
    }

    if (Array.isArray(result)) {
      window.currentSynth = result;
    } else {
      window.currentSynth = [result];
    }
    offlineState.codeError = null;
  } catch (error) {
    offlineState.codeError = error?.message ?? 'Unknown error';
  }
}

function handleKeyDown(event) {
  if (offlineState.useKeyboard) {
    const entry = KeyMap[event.key];

    if (entry) {
      attackKey(entry);
    }
  }
}

function handleKeyUp(event) {
  if (offlineState.useKeyboard) {
    const entry = KeyMap[event.key];

    if (entry) {
      releaseKey(entry);
    }
  }
}

function handleReleaseAllClick() {
  Object.values(KeyMap).forEach((value) => {
    state.keys[value.stateKey] = false;
  });

  window.currentSynth?.forEach((synth) => synth.releaseAll());
}

export const Synth = () => {
  const offlineSnap = useSnapshot(offlineState);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    handleEvalClick();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="flex md:flex-row flex-col md:items-start items-center justify-center gap-12">
      <div className="w-[392px]">
        <div className="rounded-md p-4 mb-4 select-none bg-gradient-to-b from-sky-400 to-sky-900">
          <div className="inline-flex gap-1 relative">
            <WhiteKey mapKey="a">C</WhiteKey>
            <WhiteKey mapKey="s">D</WhiteKey>
            <WhiteKey mapKey="d">E</WhiteKey>
            <WhiteKey mapKey="f">F</WhiteKey>
            <WhiteKey mapKey="g">G</WhiteKey>
            <WhiteKey mapKey="h">A</WhiteKey>
            <WhiteKey mapKey="j">B</WhiteKey>
            <BlackKey className="left-[34px]" mapKey="w">
              <div>C</div>
              <div>#</div>
            </BlackKey>
            <BlackKey className="left-[86px]" mapKey="e">
              <div>D</div>
              <div>#</div>
            </BlackKey>
            <BlackKey className="left-[190px]" mapKey="t">
              <div>F</div>
              <div>#</div>
            </BlackKey>
            <BlackKey className="left-[242px]" mapKey="y">
              <div>G</div>
              <div>#</div>
            </BlackKey>
            <BlackKey className="left-[294px]" mapKey="u">
              <div>A</div>
              <div>#</div>
            </BlackKey>
          </div>
        </div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4">
            <div>
              <Label className="block mb-2">Volume</Label>
              <Input
                className="w-16"
                value={offlineSnap.volume}
                onChange={handleVolumeChange}
              />
            </div>
            <div>
              <Label className="block mb-2">Octave</Label>
              <Select
                value={offlineSnap.octave}
                onValueChange={handleOctaveChange}
              >
                <SelectTrigger className="w-16">
                  <SelectValue placeholder="Select an octave" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="keys-switch" className="block mb-2">
              Use Keyboard
            </Label>
            <div className="flex justify-end">
              <Switch
                id="keys-switch"
                checked={offlineSnap.useKeyboard}
                onCheckedChange={handleUseKeyboardChange}
              />
            </div>
          </div>
        </div>
        <div>
          <Button variant="outline" onClick={handleReleaseAllClick}>
            Release All
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-[500px]">
        <div
          className={clsx('rounded-md overflow-hidden border w-full', {
            'border-danger': !!offlineSnap.codeError,
          })}
        >
          <ReactCodeMirror
            extensions={[javascript()]}
            theme={xcodeDark}
            minHeight="200px"
            value={offlineSnap.code}
            onChange={handleCodeChange}
          />
        </div>
        {offlineSnap.codeError && (
          <div className="text-danger text-sm">{offlineSnap.codeError}</div>
        )}
        <div className="flex justify-end">
          <Button onClick={handleEvalClick}>Eval</Button>
        </div>
      </div>
    </div>
  );
};
