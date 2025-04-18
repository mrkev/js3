import { useCallback } from "react";
import { Grid, GridCellRenderer, Index } from "react-virtualized";
import { Sheet } from "./model/Sheet";

// CELL(0,0)
// RANGE(0,0)(0,10)

const noContentRender = () => <div>No cells</div>;

const gridStyle: React.CSSProperties = {
  userSelect: "none",
  // pointerEvents: "none",
};

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
  const { overscanColumnCount, overscanRowCount, scrollToColumn, scrollToRow } = {
    overscanColumnCount: 0,
    overscanRowCount: 10,
    scrollToColumn: undefined,
    scrollToRow: undefined,
  };

  const getRowHeight = useCallback(
    function getRowHeight({ index }: Index) {
      const explicitHeight = sheet.getExplicitRowHeight(index);
      if (explicitHeight === null) {
        return 40;
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
        return 150;
      } else {
        return explicitWidth;
      }
    },
    [sheet],
  );

  return (
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
    />
  );
}
