import { cx } from "./util";
import { useEffect } from "react";
import { Cell } from "./model/Cell";

export function CellElem({
  cell,
  onClick,
  selected,
}: {
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
      ref={(elem) => {
        cell.cellDOMElement = elem;
      }}
      className={cx("cell", selected && "selected")}
      onClick={() => onClick(cell)}
    ></div>
  );
}
