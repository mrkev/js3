import React, { useEffect } from "react";
import { Cell, evaluateCell } from "./model/Cell";
import { Sheet } from "./model/Sheet";
import { cx } from "./util";

export const CellElem = React.memo(function CellElem({
  cell,
  sheet,
  onClick,
  selected,
  style,
}: Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> & {
  cell: Cell;
  sheet: Sheet;
  onClick: (cell: Cell) => void;
  selected: boolean;
}) {
  useEffect(() => {
    evaluateCell(cell, sheet);
    cell.render();
  }, [cell, cell.strValue]);

  return (
    <div
      role="gridcell"
      style={style}
      ref={cell.cellRef}
      className={cx("cell", selected && "selected")}
      onClick={() => onClick(cell)}
      // onMouseDown={(e) => {
      //   onClick(cell);
      //   e.stopPropagation();
      // }}
    ></div>
  );
});
