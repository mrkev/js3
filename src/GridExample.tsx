/// <reference types="resize-observer-browser" />
import { useRef, useState } from "react";
import { Grid, GridCellRenderer } from "react-virtualized";
import { useResizeObserver } from "./useResizeObserver";

type Props = {
  renderCell: GridCellRenderer;
  getRowHeight: (index: number) => number;
  getColWidth: (index: number) => number;
  colCount: number;
  rowCount: number;
};

export default function GridSample(props: Props) {
  const {
    overscanColumnCount,
    overscanRowCount,
    scrollToColumn,
    scrollToRow,
  } = {
    overscanColumnCount: 0,
    overscanRowCount: 10,
    scrollToColumn: undefined,
    scrollToRow: undefined,
  };

  const contentRef = useRef<null | HTMLDivElement>(null);
  const [rootElem, setRootElem] = useState<HTMLDivElement | null>(null);
  const rootContentRect = useResizeObserver(rootElem);

  return (
    <div
      style={{ flexGrow: 1, height: "100%" }}
      ref={(elem) => {
        setRootElem(elem);
        contentRef.current = elem;
      }}
    >
      {rootContentRect && (
        <Grid
          cellRenderer={props.renderCell}
          columnWidth={({ index }) => props.getColWidth(index)}
          columnCount={props.colCount}
          height={rootContentRect.height}
          noContentRenderer={() => (
            <div
            // className={styles.noCells}
            // .noCells {
            //   position: absolute;
            //   top: 0;
            //   bottom: 0;
            //   left: 0;
            //   right: 0;
            //   display: flex;
            //   align-items: center;
            //   justify-content: center;
            //   font-size: 1em;
            //   color: #bdbdbd;
            // }
            >
              No cells
            </div>
          )}
          overscanColumnCount={overscanColumnCount}
          overscanRowCount={overscanRowCount}
          rowHeight={({ index }) => props.getRowHeight(index)}
          rowCount={props.rowCount}
          scrollToColumn={scrollToColumn}
          scrollToRow={scrollToRow}
          width={rootContentRect.width}
        />
      )}
    </div>
  );
}
