import { useEffect } from "react";
import { Cell } from "./model/Cell";
import { cx } from "./util";

export function CellElem({
  cell,
  onClick,
  selected,
  style,
}: Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> & {
  cell: Cell;
  onClick: (cell: Cell) => void;
  selected: boolean;
}) {
  useEffect(() => {
    cell.evaluate();
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
}
