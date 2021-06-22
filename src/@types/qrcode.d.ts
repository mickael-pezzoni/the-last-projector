interface Point {
  x: number;
  y: number;
}

interface Chunk {
  type: Mode;
  text: string;
}

interface ByteChunk {
  type: Mode.Byte | Mode.Kanji;
  bytes: number[];
}

interface ECIChunk {
  type: Mode.ECI;
  assignmentNumber: number;
}

type Chunks = Array<Chunk | ByteChunk | ECIChunk>;

declare enum Mode {
  Numeric = "numeric",
  Alphanumeric = "alphanumeric",
  Byte = "byte",
  Kanji = "kanji",
  ECI = "eci",
}

interface QRCodeResponse {
  binaryData: number[];
  data: string;
  chunks: any;
  version: number;
  location: {
    topRightCorner: Point;
    topLeftCorner: Point;
    bottomRightCorner: Point;
    bottomLeftCorner: Point;
    topRightFinderPattern: Point;
    topLeftFinderPattern: Point;
    bottomLeftFinderPattern: Point;
    bottomRightAlignmentPattern?: Point;
  };
}

interface Options {
  inversionAttempts?:
    | "dontInvert"
    | "onlyInvert"
    | "attemptBoth"
    | "invertFirst";
}

declare function jsQR(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  providedOptions?: Options
): QRCodeResponse | null;

declare class QRCode {
  constructor(elmt: HTMLElement, content: string);
}
