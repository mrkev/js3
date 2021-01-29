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
      [...new Array(cols)].map(
        (_, c) => new Cell(sheet, r, c, String(c + r * rows))
      )
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
  }

  //////////////////////////// CELL PROXY //////////////////////////////

  CELL = new Proxy(
    // target
    this,
    // handler
    {
      get: function (self, prop: string) {
        if (isNaN(parseInt(prop))) {
          return undefined;
        }
        return self.getRowProxy(parseInt(prop));
      },
    }
  );

  getRowProxy = (row: number) => {
    return new Proxy(
      // target
      this,
      // handler,
      {
        get: function (self, prop: string) {
          if (isNaN(parseInt(prop))) {
            return undefined;
          }
          return self.getCellProxy(row, parseInt(prop));
        },
      }
    );
  };

  // CELL[1][2]() -> value
  // CELL[1][2].max/min/etc for control props, for example <input type='slider' />
  getCellProxy = (row: number, col: number) => {
    const cell = this._grid[row][col];
    console.log("for cell", cell);
    return new Proxy(function () {}, {
      get(target, prop) {
        // if (prop === '')
        return undefined;
      },
      apply(target, thisArg, argumentsList) {
        return cell.strValue;
      },
    });
  };
}
