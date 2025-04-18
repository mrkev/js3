import React from "react";
import { exhaustive } from "../exhaustive";
import { DOMRep } from "./DOMRep";
import { Sheet } from "./Sheet";
import { CellEvalResult } from "./evaluateCellJS";

export type Primitive = string | number | boolean | null;

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
  }

  // Cells this cell sends data to. "children", in a dependency tree
  feeds: Set<Cell> = new Set();
  dependsOn: Set<Cell> = new Set();

  readonly cellRef = React.createRef<HTMLDivElement | null>();
  setRef = (elem: HTMLDivElement | null) => {
    this.cellRef.current = elem;
    if (elem) {
      this.render();
    }
  };

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
    this.sheet.evaluator.queueEvaluation(this, "depsonly");
    this.sheet.evaluator.evalAll();
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
    // console.log("RENDER");
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

export function primitiveOf(content: CellEvalResult): Primitive {
  if (content instanceof DOMRep) {
    return content.getPrimitiveValue();
  } else if (content instanceof Error) {
    return content.message;
  } else {
    return content;
  }
}

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

  if (content === null) {
    return document.createTextNode("");
  }

  if (content instanceof Error) {
    return document.createTextNode(content.message);
  }

  exhaustive(content);
}
