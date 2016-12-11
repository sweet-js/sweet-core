import reduce from "shift-reducer";
import ParseReducer from "./parse-reducer";
import shiftCodegen, { FormattedCodeGen } from "shift-codegen";
import Term from "./terms";
import { List } from 'immutable';

export default function codegen(modTerm) {
  // let ast = reduce(new ParseReducer({phase: 0}), modTerm);
  return {
    code: shiftCodegen(modTerm, new FormattedCodeGen())
  };
}
