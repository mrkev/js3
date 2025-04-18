import { InitFunctions, JSONOfAuto, number, ReplaceFunctions, Structured } from "structured-state";
import { Cell } from "./Cell";

type SerializedSheet = {};

/**
 * The Spreadsheet. Note:
 * - .clone() exists to trigger react updates. Cells mutate though, they aren't
 *   re-created.
 */
export class Sheet extends Structured<SerializedSheet, typeof Sheet> {
  readonly hashvalue = number(0);

  replace(autoJson: JSONOfAuto<SerializedSheet>, replace: ReplaceFunctions): void {
    throw new Error("Method not implemented.");
  }
  autoSimplify(): SerializedSheet {
    return {};
  }

  static construct(auto: JSONOfAuto<SerializedSheet>, init: InitFunctions): Sheet {
    return Structured.create(Sheet);
  }

  _grid: Array<Array<Cell>> = [];
  _rowSizes: { [row: number]: number } = {};
  _colSizes: { [col: number]: number } = {};
  _dims: { rows: number; cols: number } = { rows: 0, cols: 0 };

  constructor() {
    super();
    (window as any).sheet = this;
  }

  static ofDimensions(rows: number, cols: number) {
    const sheet = Structured.create(Sheet);
    sheet._grid = [...new Array(rows)].map((_, r) => [...new Array(cols)].map((_, c) => new Cell(sheet, r, c)));
    sheet._dims = { rows, cols };
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

  set(r: number, c: number, value: string): Sheet {
    if (r >= this._dims.rows || c >= this._dims.cols) {
      console.log(this._dims);
      throw new Error(`Can't set value for non-existing cell at ${r}:${c}`);
    }
    this._grid[r][c].strValue = value;
    this.hashvalue.set(this.hashvalue.get() + 1);
    return this;
  }

  get(r: number, c: number): Cell | null {
    if (r >= this._dims.rows || c >= this._dims.cols) {
      return null;
    }
    const cell = this._grid[r][c];
    return cell ? cell : null;
  }

  ///////////////////////// DISPLAY + SIZES //////////////////////////////

  numRows() {
    return this._dims.rows;
  }

  numCols() {
    return this._dims.cols;
  }

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

  ///////////////////////////// UPDATES ////////////////////////////////

  cellChanged(cell: Cell) {
    // todo: investigate, does this get called on every re-render?
    // console.log("changed", cell.row, cell.col, cell.primitiveValue);
    const toEval = new Set<Cell>();
    cell.feeds.forEach(function (fed) {
      toEval.add(fed);
    });
    // Separate set because "evaluate" modifies cell.feeds
    toEval.forEach((cell) => {
      cell.evaluate();
      cell.render();
    });
    // TODO: call evaluate on cells that depend on this one
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
        return cell.primitiveValue;
      },
    });
  };
}
