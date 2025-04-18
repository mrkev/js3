import { Structured } from "structured-state";
import { OrderedSet } from "./OrderedSet";
import { Cell, primitiveOf } from "./Cell";
import { Sheet } from "./Sheet";
import { evalCellJS } from "./evaluateCellJS";
import { DOMRep } from "./DOMRep";

export class Evaluator {
  private readonly queue = Structured.create(OrderedSet<Cell>);

  constructor(readonly sheet: Sheet) {}

  queueEvaluation(cell: Cell, of: "cellanddeps" | "depsonly") {
    of === "cellanddeps" && this.queue.push(cell);
    // todo: recursive downstream
    for (const downstream of cell.feeds) {
      this.queue.push(downstream);
    }
  }

  evalAll() {
    let next: Cell | undefined;
    while ((next = this.queue.pop())) {
      evaluateCell(next, next.sheet);
      // todo: separate rendering?
      next.render();
    }
  }
}

// export function cellStrChanged(cell: Cell, sheet: Sheet) {
//   // We don't know who we depend on anymore, since we changed our cell's content
//   cell.dependsOn.forEach((dependency) => {
//     cell.removeDependency(dependency);
//   });
// }

export function evaluateCell(cell: Cell, sheet: Sheet) {
  // We don't know who we depend on anymore, since we changed our cell's content
  cell.dependsOn.forEach((dependency) => {
    cell.removeDependency(dependency);
  });

  const evaluated = evalCellJS(cell.strValue, sheet, cell);
  cell.contentValue = evaluated;
  console.log(`${cell.row}:${cell.col} evaled`, cell.contentValue);

  if (cell.contentValue instanceof DOMRep) {
    cell.contentValue.onChange = cell.cellHTMLInputValueChanged;
  }

  const primitive = primitiveOf(cell.contentValue);
  cell.setPrimitiveValue(primitive);

  sheet.evaluator.queueEvaluation(cell, "depsonly");
  sheet.evaluator.evalAll();

  return evaluated;
}

///////////////////////////// UPDATES ////////////////////////////////

export function cellChanged(cell: Cell) {
  // todo: investigate, does this get called on every re-render?
  // console.log("changed", cell.row, cell.col, cell.primitiveValue);
  const toEval = new Set<Cell>();
  cell.feeds.forEach(function (fed) {
    toEval.add(fed);
  });

  // Separate set because "evaluate" modifies cell.feeds
  toEval.forEach((cell) => {
    evaluateCell(cell, cell.sheet);
    cell.render();
  });
  // TODO: call evaluate on cells that depend on this one
}
