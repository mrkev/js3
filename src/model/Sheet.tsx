import { Cell } from "./Cell";

/**
 * The Spreadsheet. Note:
 * - .clone() exists to trigger react updates. Cells mutate though, they aren't
 *   re-created.
 */
export class Sheet {
  _grid: Array<Array<Cell>> = [];
  constructor() {
    (window as any).sheet = this;
  }

  static ofDimensions(rows: number, cols: number) {
    const sheet = new Sheet();
    sheet._grid = [...new Array(rows)].map((_, r) =>
      [...new Array(cols)].map((_, c) => new Cell(sheet, r, c))
    );
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
    this._grid[r][c].strValue = value;
    return this.clone();
  }

  clone() {
    const sheet = new Sheet();
    sheet._grid = this._grid;
    return sheet;
  }

  ///////////////////////////// UPDATES ////////////////////////////////

  cellChanged(cell: Cell) {
    console.log("changed", cell.row, cell.col, cell.primitiveValue);
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
      }
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
      }
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
