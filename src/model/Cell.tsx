import React from "react";
import { DOMRep } from "./DOMRep";
import { cellChanged, Sheet } from "./Sheet";
import { CellEvalResult, evalCellJS } from "./evaluateCellJS";

export type Primitive = string | number | boolean;

export class Cell {
  // The raw string typed into the cell
  public strValue: string = "";
  public setStrValue(value: string) {
    this.strValue = value;
    // console.log("evaled", Cell.evaluate(this));
  }

  // set strValue, evaluate

  // The data this cell renders
  public contentValue: CellEvalResult = "";

  // The value read by other cells (ie, number for an input range)
  _primitiveValue: Primitive = "";
  getPrimitiveValue() {
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
    if (!(this.contentValue instanceof DOMRep)) {
      console.log(this.contentValue);
      console.log("This should never happen.");
      return;
    }
    this.setPrimitiveValue(this.contentValue.getPrimitiveValue());
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

  /** Returns the HTML to be dangerously set in the cell DOM */
  renderToString(): string {
    const result = this.contentValue;

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

    if (this.contentValue instanceof DOMRep) {
      const node = this.contentValue.getDOM();
      this.cellRef.current.appendChild(node);
    } else {
      const node = document.createTextNode(this.renderToString());
      this.cellRef.current.appendChild(node);
    }
  }
}

export function evaluateCell(cell: Cell) {
  // We don't know who we depend on now
  cell.dependsOn.forEach((dependency) => {
    cell.removeDependency(dependency);
  });

  // Eval the value, "undefined" renders the empty string
  const evaluated = evalCellJS(cell.strValue, cell.sheet, cell);
  cell.contentValue = typeof evaluated === "undefined" ? (cell.contentValue = "") : (cell.contentValue = evaluated);

  if (cell.contentValue instanceof DOMRep) {
    cell.contentValue.onChange = cell.cellHTMLInputValueChanged;
    cell.setPrimitiveValue(cell.contentValue.getPrimitiveValue());
  } else if (cell.contentValue instanceof Error) {
    cell.setPrimitiveValue(cell.contentValue.message);
  } else {
    cell.setPrimitiveValue(cell.contentValue);
  }

  return evaluated;
}
