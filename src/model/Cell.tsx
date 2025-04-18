import React from "react";
import { cellChanged, Sheet } from "./Sheet";
import { DOMRep } from "./DOMRep";

export type Primitive = string | number | boolean;
type EvaledValue = DOMRep | Primitive | Error;

function evaluate(src: string, sheet: Sheet, calledFromCell: Cell): EvaledValue | undefined {
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

export class Cell {
  // The raw string typed into the cell
  strValue: string = "";
  // set strValue, evaluate

  // The data this cell renders
  renderValue: EvaledValue = "";

  // The value read by other cells (ie, number for an input range)
  _primitiveValue: Primitive = "";
  get primitiveValue() {
    return this._primitiveValue;
  }

  setPrimitiveValue(primitive: Primitive) {
    this._primitiveValue = primitive;
    cellChanged(this);
  }

  // Cells this cell sends data to. "children", in a dependency tree
  feeds: Set<Cell> = new Set();
  dependsOn: Set<Cell> = new Set();

  readonly cellRef = React.createRef<HTMLDivElement | null>();

  constructor(
    readonly sheet: Sheet,
    readonly row: number,
    readonly col: number,
  ) {}

  cellHTMLInputValueChanged = (e: Event) => {
    if (!(this.renderValue instanceof DOMRep)) {
      console.log(this.renderValue);
      console.log("This should never happen.");
      return;
    }
    this.setPrimitiveValue(this.renderValue.getPrimitiveValue());
  };

  // If I write CELL[0][0](), I depend on CELL[0][0]()
  addDependency(dependency: Cell) {
    this.dependsOn.add(dependency); // set
    dependency.feeds.add(this);
  }

  removeDependency(dependency: Cell) {
    this.dependsOn.delete(dependency);
    dependency.feeds.delete(this);
  }

  evaluate() {
    // We don't know who we depend on now
    this.dependsOn.forEach((dependency) => {
      this.removeDependency(dependency);
    });

    // Eval the value, "undefined" renders the empty string
    const evaluated = evaluate(this.strValue, this.sheet, this);
    this.renderValue = typeof evaluated === "undefined" ? (this.renderValue = "") : (this.renderValue = evaluated);

    if (this.renderValue instanceof DOMRep) {
      this.renderValue.onChange = this.cellHTMLInputValueChanged;
      this.setPrimitiveValue(this.renderValue.getPrimitiveValue());
    } else if (this.renderValue instanceof Error) {
      this.setPrimitiveValue(this.renderValue.message);
    } else {
      this.setPrimitiveValue(this.renderValue);
    }
  }

  /** Returns the HTML to be dangerously set in the cell DOM */
  renderToString(): string {
    const result = this.renderValue;

    if (typeof result === "string") {
      return result;
    }

    if (typeof result === "number") {
      return String(result);
    }

    if (typeof result === "boolean") {
      return String(result);
    }

    if (result instanceof Error) {
      return result.message;
    }

    if (result instanceof DOMRep) {
      return this.strValue;
    }

    return "X";
  }

  render() {
    if (this.cellRef.current == null) {
      console.log("No element to render to");
      return;
    }

    if (this.cellRef.current.firstChild) {
      this.cellRef.current.removeChild(this.cellRef.current.firstChild);
    }

    if (this.renderValue instanceof DOMRep) {
      const node = this.renderValue.getDOM();
      this.cellRef.current.appendChild(node);
    } else {
      const node = document.createTextNode(this.renderToString());
      this.cellRef.current.appendChild(node);
    }
  }
}
