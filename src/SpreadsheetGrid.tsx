import classNames from "classnames";
import { useCallback } from "react";
import { createUseStyles } from "react-jss";
import {
  AutoSizer,
  Grid,
  GridCellProps,
  GridCellRenderer,
  Index,
  ScrollSync,
  ScrollSyncChildProps,
  Size,
} from "react-virtualized";
import "react-virtualized/styles.css";
import { Sheet } from "./model/Sheet";
import { DEFAULT_BORDER, DEFAULT_ROW_HEIGHT, DEFAULT_COL_WIDTH } from "./constants";

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

export function SpreadsheetGrid({
  sheet,
  width,
  height,
  renderCell,
}: {
  renderCell: GridCellRenderer;
  width: number;
  height: number;
  sheet: Sheet;
}) {
  const styles = useStyles();
  const { overscanColumnCount, overscanRowCount, scrollToColumn, scrollToRow } = {
    overscanColumnCount: 0,
    overscanRowCount: 10,
    scrollToColumn: undefined,
    scrollToRow: undefined,
  };

  function renderHeaderCell({ columnIndex, key, style }: GridCellProps) {
    return (
      <div className={styles.headerCell} key={key} style={style}>
        {`C${columnIndex}`}
      </div>
    );
  }

  function _renderLeftSideCell({ columnIndex, key, rowIndex, style }: GridCellProps) {
    return (
      <div className={styles.headerCell} key={key} style={style}>
        {`R${rowIndex}`}
      </div>
    );
  }

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
    [renderCell],
  );

  return <ScrollSync children={renderInScrollSync} />;
}
