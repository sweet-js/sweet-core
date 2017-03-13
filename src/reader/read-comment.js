// @flow
import type { CharStream } from 'readtable';

import { isEOS } from 'readtable';
import { skipSingleLineComment } from './utils';
import { EmptyToken } from '../tokens';

export default function readComment(stream: CharStream): typeof EmptyToken {
  let char = stream.peek();

  while (!isEOS(char)) {
    let chCode = char.charCodeAt(0);
    if (chCode === 47) {
      /* "/" */ const nxt = stream.peek(1);
      if (isEOS(nxt)) {
        break;
      }
      chCode = nxt.charCodeAt(0);
      if (chCode === 47) {
        /* "/" */ skipSingleLineComment.call(this, stream);
      } else if (chCode === 42) {
        /* "*" */ skipMultiLineComment.call(this, stream);
      } else {
        break;
      }
    } else {
      break;
    }
    char = stream.peek();
  }

  return EmptyToken;
}

function skipMultiLineComment(stream: CharStream): void {
  let idx = 2;
  let char = stream.peek(idx);
  const { position: startPosition } = stream.sourceInfo;
  let lineStart;
  while (!isEOS(char)) {
    let chCode = char.charCodeAt(0);
    if (chCode < 0x80) {
      switch (chCode) {
        case 42: // "*"
          // Block comment ends with "*/".
          if (stream.peek(idx + 1).charAt(0) === '/') {
            stream.readString(idx + 2);
            if (lineStart)
              this.locationInfo.column = stream.sourceInfo.position - lineStart;
            return;
          }
          ++idx;
          break;
        case 10: // "\n"
          this.incrementLine();
          lineStart = startPosition + idx;
          ++idx;
          break;
        case 13: {
          // "\r":
          let startIdx = idx;
          if (stream.peek(idx + 1).charAt(0) === '\n') {
            ++idx;
          }
          ++idx;
          this.incrementLine();
          lineStart = startPosition + startIdx;
          break;
        }
        default:
          ++idx;
      }
    } else if (chCode === 0x2028 || chCode === 0x2029) {
      this.incrementLine();
      lineStart = startPosition + idx;
      ++idx;
    } else {
      ++idx;
    }
    char = stream.peek(idx);
  }
  throw this.createILLEGAL(char);
}
