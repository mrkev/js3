import { Structured } from "structured-state";
import { OrderedSet } from "./OrderedSet";
import { Cell, evaluateCell } from "./Cell";

export class Evaluator {
  private readonly queue = Structured.create(OrderedSet<Cell>);

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
