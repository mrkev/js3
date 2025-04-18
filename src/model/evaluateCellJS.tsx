import { Cell, Primitive } from "./Cell";
import { DOMRep } from "./DOMRep";
import { Sheet } from "./Sheet";

export type CellEvalResult = Primitive | DOMRep | Error;

export function evalCellJS(src: string, sheet: Sheet, calledFromCell: Cell): CellEvalResult | undefined {
  try {
    // Transform the expression
    const wrappedSrc = `function eCell () {
      /** @jsx DOMRep.createElement */ return ${src}; }`;
    const { code: transformedSrc } = (window as any).Babel.transform(wrappedSrc, {
      plugins: ["transform-react-jsx"],
    });

    // eslint-disable-next-line no-new-func
    const funcExpr = new Function("DOMRep", "CELL", "return " + transformedSrc);
    const result = funcExpr(DOMRep, sheet.getCELLAccessorProxy(calledFromCell))();
    if (
      !(
        result instanceof DOMRep ||
        typeof result === "string" ||
        typeof result === "number" ||
        typeof result === "boolean" ||
        typeof result === "undefined"
      )
    ) {
      console.log("result", result);
      throw new Error("Only booleans, numbres, strings and inputs are supported");
    }
    return result;
  } catch (e) {
    return new Error((e as any).message);
  }
}
