/**
 * A list of keyboard key codes.
 */
export const KeyCode = {
  Unknown: 'Unknown',
  Backspace: 'Backspace',
  Tab: 'Tab',
  NumClear: 'NumClear',
  Enter: 'Enter',
  ShiftLeft: 'ShiftLeft',
  ShiftRight: 'ShiftRight',
  ControlLeft: 'ControlLeft',
  ControlRight: 'ControlRight',
  AltLeft: 'AltLeft',
  AltRight: 'AltRight',
  Pause: 'Pause',
  CapsLock: 'CapsLock',
  Escape: 'Escape',
  Space: 'Space',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  End: 'End',
  Home: 'Home',
  ArrowLeft: 'ArrowLeft',
  ArrowUp: 'ArrowUp',
  ArrowRight: 'ArrowRight',
  ArrowDown: 'ArrowDown',
  PrintScreen: 'PrintScreen',
  Insert: 'Insert',
  Delete: 'Delete',
  Zero: 'Zero',
  One: 'One',
  Two: 'Two',
  Three: 'Three',
  Four: 'Four',
  Five: 'Five',
  Six: 'Six',
  Seven: 'Seven',
  Eight: 'Eight',
  Nine: 'Nine',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F',
  G: 'G',
  H: 'H',
  I: 'I',
  J: 'J',
  K: 'K',
  L: 'L',
  M: 'M',
  N: 'N',
  O: 'O',
  P: 'P',
  Q: 'Q',
  R: 'R',
  S: 'S',
  T: 'T',
  U: 'U',
  V: 'V',
  W: 'W',
  X: 'X',
  Y: 'Y',
  Z: 'Z',
  OSLeft: 'OSLeft',
  OSRight: 'OSRight',
  Num0: 'Num0',
  Num1: 'Num1',
  Num2: 'Num2',
  Num3: 'Num3',
  Num4: 'Num4',
  Num5: 'Num5',
  Num6: 'Num6',
  Num7: 'Num7',
  Num8: 'Num8',
  Num9: 'Num9',
  NumMultiply: 'NumMultiply',
  NumAdd: 'NumAdd',
  NumSubtract: 'NumSubtract',
  NumDecimal: 'NumDecimal',
  NumDivide: 'NumDivide',
  NumEnter: 'NumEnter',
  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12',
  F13: 'F13',
  F14: 'F14',
  F15: 'F15',
  F16: 'F16',
  F17: 'F17',
  F18: 'F18',
  F19: 'F19',
  F20: 'F20',
  F21: 'F21',
  F22: 'F22',
  F23: 'F23',
  F24: 'F24',
  NumLock: 'NumLock',
  ScrollLock: 'ScrollLock',
  Equal: 'Equal',
  Comma: 'Comma',
  Minus: 'Minus',
  Period: 'Period',
  Slash: 'Slash',
  Semicolon: 'Semicolon',
  Backquote: 'Backquote',
  BracketLeft: 'BracketLeft',
  Backslash: 'Backslash',
  BracketRight: 'BracketRight',
  Quote: 'Quote',
  IntlBackslash: 'IntlBackslash',
} as const;

export function getKeyCodeFromString(code: string): (typeof KeyCode)[keyof typeof KeyCode] {
  switch (code) {
    case 'Backspace':
      return KeyCode.Backspace;

    case 'Tab':
      return KeyCode.Tab;

    case 'Enter':
      return KeyCode.Enter;

    case 'NumpadEnter':
      return KeyCode.NumEnter;

    case 'ShiftLeft':
      return KeyCode.ShiftLeft;

    case 'ShiftRight':
      return KeyCode.ShiftRight;

    case 'ControlLeft':
      return KeyCode.ControlLeft;

    case 'ControlRight':
      return KeyCode.ControlRight;

    case 'AltLeft':
      return KeyCode.AltLeft;

    case 'AltRight':
      return KeyCode.AltRight;

    case 'Pause':
      return KeyCode.Pause;

    case 'CapsLock':
      return KeyCode.CapsLock;

    case 'Escape':
      return KeyCode.Escape;

    case 'Space':
      return KeyCode.Space;

    case 'PageUp':
      return KeyCode.PageUp;

    case 'PageDown':
      return KeyCode.PageDown;

    case 'End':
      return KeyCode.End;

    case 'Home':
      return KeyCode.Home;

    case 'ArrowLeft':
      return KeyCode.ArrowLeft;

    case 'ArrowUp':
      return KeyCode.ArrowUp;

    case 'ArrowRight':
      return KeyCode.ArrowRight;

    case 'ArrowDown':
      return KeyCode.ArrowDown;

    case 'PrintScreen':
      return KeyCode.PrintScreen;

    case 'Insert':
      return KeyCode.Insert;

    case 'Delete':
      return KeyCode.Delete;

    case 'Digit0':
      return KeyCode.Zero;

    case 'Digit1':
      return KeyCode.One;

    case 'Digit2':
      return KeyCode.Two;

    case 'Digit3':
      return KeyCode.Three;

    case 'Digit4':
      return KeyCode.Four;

    case 'Digit5':
      return KeyCode.Five;

    case 'Digit6':
      return KeyCode.Six;

    case 'Digit7':
      return KeyCode.Seven;

    case 'Digit8':
      return KeyCode.Eight;

    case 'Digit9':
      return KeyCode.Nine;

    case 'KeyA':
      return KeyCode.A;

    case 'KeyB':
      return KeyCode.B;

    case 'KeyC':
      return KeyCode.C;

    case 'KeyD':
      return KeyCode.D;

    case 'KeyE':
      return KeyCode.E;

    case 'KeyF':
      return KeyCode.F;

    case 'KeyG':
      return KeyCode.G;

    case 'KeyH':
      return KeyCode.H;

    case 'KeyI':
      return KeyCode.I;

    case 'KeyJ':
      return KeyCode.J;

    case 'KeyK':
      return KeyCode.K;

    case 'KeyL':
      return KeyCode.L;

    case 'KeyM':
      return KeyCode.M;

    case 'KeyN':
      return KeyCode.N;

    case 'KeyO':
      return KeyCode.O;

    case 'KeyP':
      return KeyCode.P;

    case 'KeyQ':
      return KeyCode.Q;

    case 'KeyR':
      return KeyCode.R;

    case 'KeyS':
      return KeyCode.S;

    case 'KeyT':
      return KeyCode.T;

    case 'KeyU':
      return KeyCode.U;

    case 'KeyV':
      return KeyCode.V;

    case 'KeyW':
      return KeyCode.W;

    case 'KeyX':
      return KeyCode.X;

    case 'KeyY':
      return KeyCode.Y;

    case 'KeyZ':
      return KeyCode.Z;

    case 'MetaLeft':
    case 'OSLeft':
      return KeyCode.OSLeft;

    case 'MetaRight':
    case 'OSRight':
      return KeyCode.OSRight;

    case 'Numpad0':
      return KeyCode.Num0;

    case 'Numpad1':
      return KeyCode.Num1;

    case 'Numpad2':
      return KeyCode.Num2;

    case 'Numpad3':
      return KeyCode.Num3;

    case 'Numpad4':
      return KeyCode.Num4;

    case 'Numpad5':
      return KeyCode.Num5;

    case 'Numpad6':
      return KeyCode.Num6;

    case 'Numpad7':
      return KeyCode.Num7;

    case 'Numpad8':
      return KeyCode.Num8;

    case 'Numpad9':
      return KeyCode.Num9;

    case 'NumpadMultiply':
      return KeyCode.NumMultiply;

    case 'NumpadAdd':
      return KeyCode.NumAdd;

    case 'NumpadSubtract':
      return KeyCode.NumSubtract;

    case 'NumpadDecimal':
      return KeyCode.NumDecimal;

    case 'NumpadDivide':
      return KeyCode.NumDivide;

    case 'F1':
      return KeyCode.F1;

    case 'F2':
      return KeyCode.F2;

    case 'F3':
      return KeyCode.F3;

    case 'F4':
      return KeyCode.F4;

    case 'F5':
      return KeyCode.F5;

    case 'F6':
      return KeyCode.F6;

    case 'F7':
      return KeyCode.F7;

    case 'F8':
      return KeyCode.F8;

    case 'F9':
      return KeyCode.F9;

    case 'F10':
      return KeyCode.F10;

    case 'F11':
      return KeyCode.F11;

    case 'F12':
      return KeyCode.F12;

    case 'F13':
      return KeyCode.F13;

    case 'F14':
      return KeyCode.F14;

    case 'F15':
      return KeyCode.F15;

    case 'F16':
      return KeyCode.F16;

    case 'F17':
      return KeyCode.F17;

    case 'F18':
      return KeyCode.F18;

    case 'F19':
      return KeyCode.F19;

    case 'F20':
      return KeyCode.F20;

    case 'F21':
      return KeyCode.F21;

    case 'F22':
      return KeyCode.F22;

    case 'F23':
      return KeyCode.F23;

    case 'F24':
      return KeyCode.F24;

    case 'NumLock':
      return KeyCode.NumLock;

    case 'ScrollLock':
      return KeyCode.ScrollLock;

    case 'Equal':
      return KeyCode.Equal;

    case 'Comma':
      return KeyCode.Comma;

    case 'Minus':
      return KeyCode.Minus;

    case 'Period':
      return KeyCode.Period;

    case 'Slash':
      return KeyCode.Slash;

    case 'Semicolon':
      return KeyCode.Semicolon;

    case 'Backquote':
      return KeyCode.Backquote;

    case 'BracketLeft':
      return KeyCode.BracketLeft;

    case 'Backslash':
      return KeyCode.Backslash;

    case 'BracketRight':
      return KeyCode.BracketRight;

    case 'Quote':
      return KeyCode.Quote;

    case 'IntlBackslash':
      return KeyCode.IntlBackslash;

    default:
      console.log(`Unknown key code: ${code}`);
      return KeyCode.Unknown;
  }
}
