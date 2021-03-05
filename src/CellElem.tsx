import { cx } from "./util";
import { useEffect } from "react";
import { Cell } from "./model/Cell";

type Props = {
  cell: Cell;
  onClick: (cell: Cell) => void;
  selected: boolean;
  style: React.CSSProperties;
};

export function CellElem({ cell, onClick, selected, style }: Props) {
  useEffect(() => {
    cell.evaluate();
    cell.render();
  }, [cell, cell.strValue]);

  return (
    <div
      style={style}
      ref={(elem) => {
        cell.cellDOMElement = elem;
      }}
      className={cx("cell", selected && "selected")}
      onClick={() => onClick(cell)}
    ></div>
  );
}
