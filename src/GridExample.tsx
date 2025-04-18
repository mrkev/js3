import { useRef, useState, useCallback, useMemo } from "react";
import { Grid, GridCellRenderer } from "react-virtualized";
import { useResizeObserver } from "./useResizeObserver";
import ReactDOM from "react-dom";

type Props = {
  renderCell: GridCellRenderer;
  getRowHeight: (index: number) => number;
  getColWidth: (index: number) => number;
  colCount: number;
  rowCount: number;
  width: number;
  height: number;
};

// CELL(0,0)
// RANGE(0,0)(0,10)

const noContentRender = () => (
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
);

const gridStyle: React.CSSProperties = {
  userSelect: "none",
  // pointerEvents: "none",
};

export default function GridSample(props: Props) {
  const { overscanColumnCount, overscanRowCount, scrollToColumn, scrollToRow } = {
    overscanColumnCount: 0,
    overscanRowCount: 10,
    scrollToColumn: undefined,
    scrollToRow: undefined,
  };

  const { getColWidth, getRowHeight, width, height } = props;

  // const gridRef = useRef<null | HTMLDivElement>(null);
  const [rootElem, setRootElem] = useState<HTMLDivElement | null>(null);
  const rootContentRect = useResizeObserver(rootElem);

  const columnWidth = useCallback(({ index }: any) => getColWidth(index), [getColWidth]);

  const rowHeight = useCallback(({ index }: any) => getRowHeight(index), [getRowHeight]);

  return (
    <div
      style={{
        width: width,
        height: height,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", left: 10, top: 10, background: "red" }}>HELLO</div>
      <Grid
        role="none"
        style={gridStyle}
        // ref={(instance) => {
        //   instance.
        //   console.log(instance);
        //   const elem = ReactDOM.findDOMNode(instance);
        //   if (!(elem instanceof HTMLDivElement)) {
        //     return;
        //   }
        //   gridRef.current = elem;
        // }}
        // onScroll={function () {
        //   if (gridRef.current) {
        //     console.log(gridRef.current.scrollLeft);
        //   }
        // }}
        // tabIndex={-1}
        cellRenderer={props.renderCell}
        columnWidth={columnWidth}
        columnCount={props.colCount}
        height={height}
        noContentRenderer={noContentRender}
        overscanColumnCount={overscanColumnCount}
        overscanRowCount={overscanRowCount}
        rowHeight={rowHeight}
        rowCount={props.rowCount}
        scrollToColumn={scrollToColumn}
        scrollToRow={scrollToRow}
        width={width}
      />
    </div>
  );
  // return (
  //   <div
  //     style={{ flexGrow: 1, flexShrink: 1, height: "100%" }}
  //     ref={(elem) => {
  //       setRootElem(elem);
  //       contentRef.current = elem;
  //     }}
  //   >
  //     {rootContentRect && (
  //       <Grid
  //         role="none"
  //         style={gridStyle}
  //         // tabIndex={-1}
  //         cellRenderer={props.renderCell}
  //         columnWidth={columnWidth}
  //         columnCount={props.colCount}
  //         height={rootContentRect.height}
  //         noContentRenderer={noContentRender}
  //         overscanColumnCount={overscanColumnCount}
  //         overscanRowCount={overscanRowCount}
  //         rowHeight={rowHeight}
  //         rowCount={props.rowCount}
  //         scrollToColumn={scrollToColumn}
  //         scrollToRow={scrollToRow}
  //         width={rootContentRect.width}
  //       />
  //     )}
  //   </div>
  // );
}
