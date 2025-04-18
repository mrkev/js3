import Editor, { OnChange, OnMount } from "@monaco-editor/react";
import "./App.css";
import { Cell } from "./model/Cell";

export function Sidebar({
  selectedCell,
  onEditorMount,
  onEditorChange,
  editorValue,
}: {
  selectedCell: Cell;
  onEditorMount: OnMount;
  onEditorChange: OnChange;
  editorValue: string | undefined;
}) {
  return (
    <div
      className="sidebar"
      style={{
        display: "flex",
        flexDirection: "column",
        width: 400,
        position: "absolute",
        right: 10,
        top: 10,
        height: 400,
        background: "white",
        border: "1px solid gray",
      }}
    >
      <pre>
        const CELL[{selectedCell.row}][{selectedCell.col}] ={" "}
      </pre>
      <div style={{ flexGrow: 1, flexShrink: 1, overflow: "hidden" }}>
        <Editor
          onMount={onEditorMount}
          height="100%"
          language="javascript"
          onChange={onEditorChange}
          value={editorValue}
        />
      </div>
    </div>
  );
}
