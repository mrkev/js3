import { InitFunctions, JSONOfAuto, map, ReplaceFunctions, SMap, SPrimitive, Structured } from "structured-state";
import { nullthrows } from "../nullthrows";
import { Cell } from "./Cell";
import { DOMRep } from "./DOMRep";
import { Evaluator } from "./Evaluator";
import { cellID, CellID, posOfId } from "./cellID";

type SerializedSheet = {
  rows: number;
  cols: number;
  // cellMap: SMap<CellID, Cell>;
};

/**
 * The Spreadsheet. Note:
 * - .clone() exists to trigger react updates. Cells mutate though, they aren't
 *   re-created.
 */
export class Sheet extends Structured<SerializedSheet, typeof Sheet> {
  readonly evaluator: Evaluator;

  constructor(
    readonly rows: number,
    readonly cols: number,
    readonly cellsWithValue: SMap<CellID, Cell>,
    readonly _grid: Array<Array<Cell>>,
    readonly selectedCell: SPrimitive<Cell>,
    readonly selectionStatus = SPrimitive.of<"editing" | "superficial" | "widget">("superficial"),
    readonly _rowSizes: { [row: number]: number } = {},
    readonly _colSizes: { [col: number]: number } = {},
  ) {
    super();
    this.evaluator = new Evaluator(this);
    (window as any).sheet = this;
  }

  replace(_autoJson: JSONOfAuto<SerializedSheet>, _replace: ReplaceFunctions): void {
    throw new Error("Method not implemented.");
  }

  autoSimplify(): SerializedSheet {
    const { rows, cols } = this;
    return { rows, cols };
  }

  static construct(auto: JSONOfAuto<SerializedSheet>, init: InitFunctions): Sheet {
    throw new Error("unimplemented");
    // const grid = [];
    // return Structured.create(Sheet, auto.rows, auto.cols, map(), grid, SPrimitive.of<Cell>(grid[0][0]));
  }

  static ofDimensions(rows: number, cols: number) {
    const grid = [...new Array(rows)].map((_, r) => [...new Array(cols)].map((_, c) => Cell.of(r, c)));

    const sheet = Structured.create(Sheet, rows, cols, map(), grid, SPrimitive.of<Cell>(grid[0][0]));
    return sheet;
  }

  registerWidgetAtCell(cell: Cell) {
    if (!(cell.contentValue instanceof DOMRep)) {
      console.warn("no widget to register");
      return;
    }

    cell.contentValue.dom.dataset["cellid"] = cellID(cell.row, cell.col);
    cell.contentValue.dom.oninput = this.widgetChanged;
    cell.contentValue.dom.onchange = this.widgetChanged;
  }

  widgetChanged = (e: Event) => {
    if (!(e.target instanceof HTMLInputElement) || typeof e.target.dataset["cellid"] !== "string") {
      console.warn("This should never happen.");
      return;
    }

    const cid = e.target.dataset["cellid"];
    const { row, col } = posOfId(cid as CellID);
    const cell = nullthrows(this.get(row, col));

    cell.updatePrimitive();
    this.evaluator.queueEvaluation(cell, "depsonly");
    this.evaluator.evalAll();
  };

  map<T>(fn: (cell: Cell, row: number, column: number) => T): Array<T> {
    const result = [];
    for (let r = 0; r < this._grid.length; r++) {
      for (let c = 0; c < this._grid[r].length; c++) {
        result.push(fn(this._grid[r][c], r, c));
      }
    }
    return result;
  }

  set(r: number, c: number, value: string, queue: boolean): Sheet {
    if (r >= this.rows || c >= this.cols) {
      console.log("set on", this.rows, this.cols);
      throw new Error(`Can't set value for non-existing cell at ${r}:${c}`);
    }
    const cell = this._grid[r][c];
    cell.strValue.set(value);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    queue && this.evaluator.queueEvaluation(cell, "cellanddeps");
    return this;
  }

  flushEvalQueue() {
    this.evaluator.evalAll();
    return this;
  }

  get(r: number, c: number): Cell | null {
    if (r >= this.rows || c >= this.cols) {
      return null;
    }
    const cell = this._grid[r][c];
    return cell ? cell : null;
  }

  //////////////////////////// CELL PROXY //////////////////////////////

  /**
   * So here's teh deal, we want to build a dependency graph to keep track
   * of which cells feed data to which other cells.
   * The way this is done here is by simply recording which cell requested
   * a "CELL" proxy, and then recording which cells we accessed through that
   * proxy.
   * This function is used to get our cell proxy with the calling cell "bound"
   * like this, from the function that evaluates cells.
   */
  getCELLAccessorProxy(calledFromCell: Cell) {
    return new Proxy(
      // target
      this,
      // handler
      {
        get: function (self, prop: string) {
          if (isNaN(parseInt(prop))) {
            return undefined;
          }
          return self.getRowProxy(parseInt(prop), calledFromCell);
        },
      },
    );
  }

  getRowProxy = (row: number, calledFromCell: Cell) => {
    return new Proxy(
      // target
      this,
      // handler,
      {
        get: function (self, prop: string) {
          if (isNaN(parseInt(prop))) {
            return undefined;
          }
          return self.getCellProxy(row, parseInt(prop), calledFromCell);
        },
      },
    );
  };

  // CELL[1][2]() -> value
  // CELL[1][2].max/min/etc for control props, for example <input type='slider' />
  getCellProxy = (row: number, col: number, calledFromCell: Cell) => {
    const cell = this._grid[row][col];
    // console.log("cell", calledFromCell, "depends on cell", cell);
    calledFromCell.addDependency(cell);
    return new Proxy(function () {}, {
      get(target, prop) {
        // if (prop === '')
        return undefined;
      },
      apply(target, thisArg, argumentsList) {
        return cell.getPrimitiveValue();
      },
    });
  };
}

export const sheetFn = {
  ///////////////////////// DISPLAY + SIZES //////////////////////////////

  getExplicitRowHeight(sheet: Sheet, row: number): number | null {
    if (sheet._rowSizes[row] === undefined) {
      return null;
    } else {
      return sheet._rowSizes[row];
    }
  },

  setExplicitRowHeight(sheet: Sheet, row: number, val: number | null) {
    if (val === null) {
      delete sheet._rowSizes[row];
    } else {
      sheet._rowSizes[row] = val;
    }
  },

  getExplicitColWidth(sheet: Sheet, col: number): number | null {
    if (sheet._colSizes[col] === undefined) {
      return null;
    } else {
      return sheet._colSizes[col];
    }
  },

  setExplicitColWidth(sheet: Sheet, col: number, val: number | null) {
    if (val === null) {
      delete sheet._colSizes[col];
    } else {
      sheet._colSizes[col] = val;
    }
  },
};
