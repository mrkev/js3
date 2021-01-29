import { Sheet } from "./Sheet";

type Primitive = string | number | boolean;
type EvaledValue = DOMRep | Primitive | Error;

export class DOMRep {
  type: "input";
  attrs: { [key: string]: string };
  domRep: HTMLInputElement;

  set onChange(cb: (e: Event) => void) {
    // todo, remove event listener
    this.domRep.addEventListener("change", cb);
  }

  constructor(type: "input", attrs: { [key: string]: string }) {
    this.type = type;
    this.attrs = attrs;

    // Create the element
    this.domRep = document.createElement(this.type);
    for (let key in this.attrs) {
      this.domRep.setAttribute(key, this.attrs[key]);
    }
  }

  getDOM() {
    return this.domRep;
  }

  getPrimitiveValue(): Primitive {
    switch (this.attrs.type) {
      case "range":
        return parseInt(this.domRep.value);
      default:
        return this.domRep.value;
    }
  }

  static createElement(
    type: any,
    attrs: null | Object,
    ...children: Array<any>
  ) {
    if (children.length > 0) {
      throw new Error("Child elements are not supported");
    }

    if (typeof type !== "string") {
      throw new Error("Non-html elements are not supported");
    }

    if (type !== "input") {
      throw new Error("Only input elements are supported");
    }
    const attributes = attrs || {};
    return new DOMRep(type, attributes as any);
  }
}

function evaluate(
  src: string,
  sheet: Sheet,
  calledFromCell: Cell
): EvaledValue | undefined {
  try {
    // Transform the expression
    const wrappedSrc = `function eCell () {
      /** @jsx DOMRep.createElement */ return ${src}; }`;
    const { code: transformedSrc } = (window as any).Babel.transform(
      wrappedSrc,
      {
        plugins: ["transform-react-jsx"],
      }
    );

    // eslint-disable-next-line no-new-func
    const funcExpr = new Function("DOMRep", "CELL", "return " + transformedSrc);
    const result = funcExpr(
      DOMRep,
      sheet.getCELLAccessorProxy(calledFromCell)
    )();
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
      throw new Error(
        "Only booleans, numbres, strings and inputs are supported"
      );
    }
    return result;
  } catch (e) {
    return new Error(e.message);
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
  set primitiveValue(primitive: Primitive) {
    this._primitiveValue = primitive;
    this.sheet.cellChanged(this);
  }

  sheet: Sheet;
  row: number;
  col: number;
  // Cells this cell sends data to. "children", in a dependency tree
  feeds: Set<Cell> = new Set();
  dependsOn: Set<Cell> = new Set();

  cellDOMElement: HTMLDivElement | null = null;

  constructor(sheet: Sheet, row: number, col: number) {
    this.sheet = sheet;
    this.row = row;
    this.col = col;
  }

  cellHTMLInputValueChanged = (e: Event) => {
    if (!(this.renderValue instanceof DOMRep)) {
      console.log(this.renderValue);
      console.log("This should never happen.");
      return;
    }
    this.primitiveValue = this.renderValue.getPrimitiveValue();
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
    this.renderValue =
      typeof evaluated === "undefined"
        ? (this.renderValue = "")
        : (this.renderValue = evaluated);

    if (this.renderValue instanceof DOMRep) {
      this.renderValue.onChange = this.cellHTMLInputValueChanged;
      this.primitiveValue = this.renderValue.getPrimitiveValue();
    } else if (this.renderValue instanceof Error) {
      this.primitiveValue = this.renderValue.message;
    } else {
      this.primitiveValue = this.renderValue;
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
    if (this.cellDOMElement == null) {
      console.log("No element to render to");
      return;
    }

    if (this.cellDOMElement.firstChild) {
      this.cellDOMElement.removeChild(this.cellDOMElement.firstChild);
    }

    if (this.renderValue instanceof DOMRep) {
      const node = this.renderValue.getDOM();
      this.cellDOMElement.appendChild(node);
    } else {
      const node = document.createTextNode(this.renderToString());
      this.cellDOMElement.appendChild(node);
    }
  }
}
