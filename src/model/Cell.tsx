import React from "react";
import { JSONOfAuto, ReplaceFunctions, string, Structured } from "structured-state";
import { exhaustive } from "../exhaustive";
import { cellID } from "./cellID";
import { DOMRep } from "./DOMRep";
import { CellEvalResult } from "./evaluateCellJS";

export type Primitive = string | number | boolean | null;

type SCell = {
  row: number;
  col: number;
};

export class Cell extends Structured<SCell, typeof Cell> {
  // Content

  // The raw string typed into the cell
  public readonly strValue = string("");
  // The data this cell renders
  public contentValue: CellEvalResult = "";
  // The value read by other cells (ie, number for an input range)
  private _primitiveValue: Primitive = "";

  public readonly cellRef = React.createRef<HTMLDivElement | null>();

  // Cells this cell sends data to. "children", in a dependency tree
  // todo: keep dep map separate, on evaluator?
  readonly feeds: Set<Cell> = new Set();
  readonly dependsOn: Set<Cell> = new Set();

  constructor(
    readonly cellid: string,
    readonly row: number,
    readonly col: number,
  ) {
    super();
  }

  getPrimitiveValue() {
    return this._primitiveValue;
  }

  updatePrimitive() {
    const content = this.contentValue;
    if (content instanceof DOMRep) {
      this._primitiveValue = content.getPrimitiveValue();
    } else if (content instanceof Error) {
      this._primitiveValue = content.message;
    } else {
      this._primitiveValue = content;
    }
  }

  setPrimitiveValue(primitive: Primitive) {
    this._primitiveValue = primitive;
  }

  readonly setRef = (elem: HTMLDivElement | null) => {
    this.cellRef.current = elem;
    if (elem) {
      cellFn.render(this);
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
    const id = cellID(row, col);
    return Structured.create(Cell, id, row, col);
  }

  static construct({ row, col }: SCell) {
    const id = cellID(row, col);
    return Structured.create(Cell, id, row, col);
  }
}

export const cellFn = {
  render(cell: Cell) {
    if (cell.cellRef.current == null) {
      console.log("No element to render to");
      return;
    }
    if (cell.cellRef.current.firstChild) {
      cell.cellRef.current.removeChild(cell.cellRef.current.firstChild);
    }
    const node = nodeOfContent(cell.contentValue);
    cell.cellRef.current.appendChild(node);
  },
};

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
