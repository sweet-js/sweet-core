import { spec } from '../macros/spec.js';

spec Term {}
spec Statement : Term {}
spec Expression : Term {}
spec TemplateExpression : Expression {
  'tag';
  'elements';
}

export default Term;
