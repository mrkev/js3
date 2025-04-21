import { InitFunctions, JSONOfAuto, map, number, ReplaceFunctions, Structured } from "structured-state";
import { LinkedMap } from "structured-state/dist/state/LinkedMap";
import { Cell } from "./Cell";
import { DOMRep } from "./DOMRep";
import { Evaluator } from "./Evaluator";
import { cellID, CellID, posOfId } from "./cellID";
import { nullthrows } from "../nullthrows";

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
  readonly hashvalue = number(0);
  readonly evaluator: Evaluator;

  replace(autoJson: JSONOfAuto<SerializedSheet>, replace: ReplaceFunctions): void {
    throw new Error("Method not implemented.");
  }

  autoSimplify(): SerializedSheet {
    const { rows, cols } = this;
    return { rows, cols };
  }

  static construct(auto: JSONOfAuto<SerializedSheet>, init: InitFunctions): Sheet {
    return Structured.create(Sheet, auto.rows, auto.cols, map());
  }

  _grid: Array<Array<Cell>> = [];
  _rowSizes: { [row: number]: number } = {};
  _colSizes: { [col: number]: number } = {};

  constructor(
    readonly rows: number,
    readonly cols: number,
    readonly cellsWithValue: LinkedMap<CellID, Cell>,
  ) {
    super();
    this.evaluator = new Evaluator(this);
    (window as any).sheet = this;
  }

  registerWidgetAtCell(cell: Cell) {
    if (!(cell.contentValue instanceof DOMRep)) {
      console.warn("no widget to register");
      return;
    }

    cell.contentValue.dom.dataset["cellid"] = cellID(cell.row, cell.col);
    // cell.contentValue.onChange = cell.cellHTMLInputValueChanged;
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

  static ofDimensions(rows: number, cols: number) {
    const sheet = Structured.create(Sheet, rows, cols, map());
    sheet._grid = [...new Array(rows)].map((_, r) => [...new Array(cols)].map((_, c) => new Cell(sheet, r, c)));
    return sheet;
  }

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
    cell.strValue = value;
    queue && this.evaluator.queueEvaluation(cell, "cellanddeps");
    this.hashvalue.set(this.hashvalue.get() + 1);
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

  ///////////////////////// DISPLAY + SIZES //////////////////////////////

  getExplicitRowHeight(row: number): number | null {
    if (this._rowSizes[row] === undefined) {
      return null;
    } else {
      return this._rowSizes[row];
    }
  }

  setExplicitRowHeight(row: number, val: number | null) {
    if (val === null) {
      delete this._rowSizes[row];
    } else {
      this._rowSizes[row] = val;
    }
  }

  getExplicitColWidth(col: number) {
    if (this._colSizes[col] === undefined) {
      return null;
    } else {
      return this._colSizes[col];
    }
  }

  setExplicitColWidth(col: number, val: number | null) {
    if (val === null) {
      delete this._colSizes[col];
    } else {
      this._colSizes[col] = val;
    }
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
