import classNames from "classnames";
import { useCallback } from "react";
import { createUseStyles } from "react-jss";
import { AutoSizer, Grid, GridCellProps, Index, ScrollSync, ScrollSyncChildProps, Size } from "react-virtualized";
import "react-virtualized/styles.css";
import { usePrimitive } from "structured-state";
import { SIZE } from "./App";
import { CellElem } from "./CellElem";
import { DEFAULT_BORDER, DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT } from "./constants";
import { Cell } from "./model/Cell";
import { Sheet } from "./model/Sheet";

// CELL(0,0)
// RANGE(0,0)(0,10)

const noContentRender = () => <div>No cells</div>;

const gridStyle: React.CSSProperties = {
  userSelect: "none",
  // pointerEvents: "none",
};

const useStyles = createUseStyles({
  // ".GridRow":
  container: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
  },
  // ".LeftSideGridContainer":
  corner: {
    flex: "0 0 75px",
    zIndex: 10,
  },
  headerCell: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    borderRight: DEFAULT_BORDER,
    borderBottom: DEFAULT_BORDER,
    boxSizing: "border-box",
    color: "#333",
  },
  HeaderGrid: {
    width: "100%",
    overflow: "hidden",
  },
  BodyGrid: {
    width: "100%",
  },
});

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function base26(num: number) {
  const output = [];
  const radix = ALPHABET.length;

  do {
    const index = num % radix;
    output.unshift(ALPHABET[index - 1]);
    num = Math.trunc(num / radix);
    console.log(num);
  } while (num != 0);

  console.log("output", output);
  return output.join("");
}

export function SpreadsheetGrid({ sheet, width, height }: { width: number; height: number; sheet: Sheet }) {
  const styles = useStyles();
  const { overscanColumnCount, overscanRowCount, scrollToColumn, scrollToRow } = {
    overscanColumnCount: 0,
    overscanRowCount: 10,
    scrollToColumn: undefined,
    scrollToRow: undefined,
  };
  const [selectedCell] = usePrimitive<Cell>(sheet.selectedCell);

  const onCellClick = useCallback(
    (clickedCell: Cell) => {
      sheet.selectedCell.set(clickedCell);
    },
    [sheet.selectedCell],
  );

  const renderCell = useCallback(
    function renderCell({ columnIndex, key, rowIndex, style }: GridCellProps) {
      const cell = sheet.get(rowIndex, columnIndex);
      if (!cell) {
        return <div>This shouldn't happen</div>;
      }

      return (
        <CellElem
          style={style}
          key={cell.row * SIZE + cell.col}
          cell={cell}
          onClick={onCellClick}
          selected={selectedCell === cell}
        />
      );
    },
    [onCellClick, selectedCell, sheet],
  );

  const renderHeaderCell = useCallback(
    ({ columnIndex, key, style }: GridCellProps) => {
      return (
        <div className={styles.headerCell} key={key} style={style}>
          {`C${columnIndex}`}
          {/* {columnIndex + 1} - {base26(columnIndex + 1)} */}
        </div>
      );
    },
    [styles.headerCell],
  );

  const _renderLeftSideCell = useCallback(
    ({ columnIndex, key, rowIndex, style }: GridCellProps) => {
      return (
        <div className={styles.headerCell} key={key} style={style}>
          {`R${rowIndex}`}
        </div>
      );
    },
    [styles.headerCell],
  );

  const getRowHeight = useCallback(
    function getRowHeight({ index }: Index) {
      const explicitHeight = sheet.getExplicitRowHeight(index);
      if (explicitHeight === null) {
        return DEFAULT_ROW_HEIGHT;
      } else {
        return explicitHeight;
      }
    },
    [sheet],
  );
  const getColWidth = useCallback(
    function getColWidth({ index }: Index) {
      const explicitWidth = sheet.getExplicitColWidth(index);
      if (explicitWidth === null) {
        return DEFAULT_COL_WIDTH;
      } else {
        return explicitWidth;
      }
    },
    [sheet],
  );

  const renderInScrollSync = useCallback(
    ({
      clientHeight,
      clientWidth,
      onScroll,
      scrollHeight,
      scrollLeft,
      scrollTop,
      scrollWidth,
    }: ScrollSyncChildProps) => {
      return (
        <div className={styles.container}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                // why + 1? needed to align but why?
                height: DEFAULT_ROW_HEIGHT,
                borderRight: DEFAULT_BORDER,
                borderBottom: DEFAULT_BORDER,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              JS3
            </div>
            {/* HEADER LEFT */}
            <Grid
              overscanColumnCount={overscanColumnCount}
              overscanRowCount={overscanRowCount}
              cellRenderer={_renderLeftSideCell}
              columnWidth={DEFAULT_COL_WIDTH}
              columnCount={1}
              className={"overflow_hidden_important"}
              height={height}
              rowHeight={getRowHeight}
              rowCount={sheet.rows}
              scrollTop={scrollTop}
              width={DEFAULT_COL_WIDTH}
            />
          </div>
          <AutoSizer
            disableHeight
            children={({ width }: Size) => (
              <>
                {/* HEADER TOP */}
                <Grid
                  className={classNames(styles.HeaderGrid, "overflow_hidden_important")}
                  columnWidth={getColWidth}
                  columnCount={sheet.cols}
                  height={DEFAULT_ROW_HEIGHT}
                  overscanColumnCount={overscanColumnCount}
                  cellRenderer={renderHeaderCell}
                  rowHeight={DEFAULT_ROW_HEIGHT}
                  rowCount={1}
                  scrollLeft={scrollLeft}
                  width={width}
                />
                {/* CONTENT */}
                <Grid
                  style={gridStyle}
                  cellRenderer={renderCell}
                  columnWidth={getColWidth}
                  columnCount={sheet.cols}
                  height={height}
                  noContentRenderer={noContentRender}
                  overscanColumnCount={overscanColumnCount}
                  overscanRowCount={overscanRowCount}
                  rowHeight={getRowHeight}
                  rowCount={sheet.rows}
                  scrollToColumn={scrollToColumn}
                  scrollToRow={scrollToRow}
                  width={width}
                  onScroll={onScroll}
                  className={styles.BodyGrid}
                />
              </>
            )}
          ></AutoSizer>
        </div>
      );
    },
    [
      _renderLeftSideCell,
      getColWidth,
      getRowHeight,
      height,
      overscanColumnCount,
      overscanRowCount,
      renderCell,
      renderHeaderCell,
      scrollToColumn,
      scrollToRow,
      sheet.cols,
      sheet.rows,
      styles.BodyGrid,
      styles.HeaderGrid,
      styles.container,
    ],
  );

  return <ScrollSync children={renderInScrollSync} />;
}
