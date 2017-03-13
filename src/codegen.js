import shiftCodegen, { FormattedCodeGen } from 'shift-codegen';

export default function codegen(modTerm) {
  return {
    code: shiftCodegen(modTerm, new FormattedCodeGen()),
  };
}
