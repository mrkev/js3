import { cx } from "./util";
import { useEffect, useRef } from "react";
import { Cell, DOMRep } from "./model/Cell";

// <input type="range" />
export function CellElem({
  cell,
  onClick,
  selected,
}: {
  cell: Cell;
  onClick: (cell: Cell) => void;
  selected: boolean;
}) {
  const cellElem = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const { current } = cellElem;
    if (current == null) {
      return;
    }
    const result = cell.render();

    if (current.firstChild) {
      current.removeChild(current.firstChild);
    }

    if (cell.renderValue instanceof DOMRep) {
      const node = cell.renderValue.getDOM();
      current.appendChild(node);
    } else {
      const node = document.createTextNode(result);
      current.appendChild(node);
    }
  }, [cell, cell.strValue]);

  return (
    <div
      ref={cellElem}
      className={cx("cell", selected && "selected")}
      onClick={() => onClick(cell)}
    ></div>
  );
}
