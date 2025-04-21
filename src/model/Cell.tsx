import React from "react";
import { JSONOfAuto, ReplaceFunctions, string, Structured } from "structured-state";
import { exhaustive } from "../exhaustive";
import { DOMRep } from "./DOMRep";
import { CellEvalResult } from "./evaluateCellJS";

export type Primitive = string | number | boolean | null;

type SCell = {
  row: number;
  col: number;
};

export class Cell extends Structured<SCell, typeof Cell> {
  // The raw string typed into the cell
  public readonly strValue = string("");

  // The data this cell renders
  public contentValue: CellEvalResult = "";

  public readonly cellRef = React.createRef<HTMLDivElement | null>();

  // Cells this cell sends data to. "children", in a dependency tree
  // todo: keep dep map separate, on evaluator?
  feeds: Set<Cell> = new Set();
  dependsOn: Set<Cell> = new Set();

  constructor(
    readonly row: number,
    readonly col: number,
  ) {
    super();
  }

  // The value read by other cells (ie, number for an input range)
  _primitiveValue: Primitive = "";
  getPrimitiveValue() {
    return this._primitiveValue;
  }

  updatePrimitive() {
    const primitive = primitiveOf(this.contentValue);
    this._primitiveValue = primitive;
  }

  setPrimitiveValue(primitive: Primitive) {
    this._primitiveValue = primitive;
  }

  readonly setRef = (elem: HTMLDivElement | null) => {
    this.cellRef.current = elem;
    if (elem) {
      this.render();
    }
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

  ////////////////////
  replace(autoJson: JSONOfAuto<SCell>, replace: ReplaceFunctions): void {
    throw new Error("Method not implemented.");
  }

  autoSimplify(): SCell {
    return {
      row: this.row,
      col: this.col,
    };
  }

  static of(row: number, col: number) {
    return Structured.create(Cell, row, col);
  }

  static construct({ row, col }: SCell) {
    return Structured.create(Cell, row, col);
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
    return content.dom;
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
