import React from "react";
import { Cell } from "./model/Cell";
import { cx } from "./util";

export const CellElem = React.memo(function CellElem({
  cell,
  onClick,
  selected,
  style,
}: Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> & {
  cell: Cell;
  onClick: (cell: Cell) => void;
  selected: boolean;
}) {
  return (
    <div
      data-cellid={cell.cellid}
      tabIndex={0}
      role="gridcell"
      style={style}
      ref={cell.setRef}
      className={cx("cell", selected && "selected")}
      onClick={() => onClick(cell)}
    />
  );
});
