import React from "react";
import { DOMRep } from "./DOMRep";
import { Sheet } from "./Sheet";
import { CellEvalResult, evalCellJS } from "./evaluateCellJS";
import { exhaustive } from "../exhaustive";

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
    this.sheet.evaluator.queueEvaluation(this, "depsonly");
    this.sheet.evaluator.evalAll();
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

  render() {
    if (this.cellRef.current == null) {
      console.log("No element to render to");
      return;
    }

    if (this.cellRef.current.firstChild) {
      this.cellRef.current.removeChild(this.cellRef.current.firstChild);
    }

    const node = nodeOfContent(this.contentValue);
    this.cellRef.current.appendChild(node);
  }
}

export function evaluateCell(cell: Cell, sheet: Sheet) {
  // We don't know who we depend on anymore, since we changed our cell's content
  cell.dependsOn.forEach((dependency) => {
    cell.removeDependency(dependency);
  });

  // Eval the value, "undefined" renders the empty string
  const evaluated = evalCellJS(cell.strValue, sheet, cell);

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

///////////////////////////// UPDATES ////////////////////////////////

/** Returns the HTML to be directly set in the cell DOM */
function nodeOfContent(content: CellEvalResult): HTMLElement | Text {
  if (content instanceof DOMRep) {
    return content.getDOM();
  }

  if (typeof content === "string") {
    return document.createTextNode(content);
  }

  if (typeof content === "number") {
    return document.createTextNode(String(content));
  }

  if (typeof content === "boolean") {
    return document.createTextNode(String(content));
  }

  if (content instanceof Error) {
    return document.createTextNode(content.message);
  }

  exhaustive(content);
}
