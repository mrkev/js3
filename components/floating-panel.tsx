"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/src/model/Sheet";
import Editor from "@monaco-editor/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  FolderOpen,
  GripVertical,
  Italic,
  PaintBucket,
  Palette,
  Redo,
  Save,
  Type,
  Underline,
  Undo,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { usePrimitive } from "structured-state";

export function FloatingPanel({
  sheet,
  onEditorChange,
}: {
  sheet: Sheet;
  // selectedCell: Cell;
  onEditorChange: (value: string | undefined) => void;
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState(240); // Default width of 240px
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && panelRef.current) {
      const parentRect = panelRef.current.parentElement?.getBoundingClientRect();
      if (parentRect) {
        const newX = e.clientX - parentRect.left - dragOffset.x;
        const newY = e.clientY - parentRect.top - dragOffset.y;

        // Ensure panel stays within parent boundaries
        const maxX = parentRect.width - (panelRef.current.offsetWidth || 0);
        const maxY = parentRect.height - (panelRef.current.offsetHeight || 0);

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartX(e.clientX);
    setResizeStartWidth(width);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (isResizing) {
      const deltaX = resizeStartX - e.clientX;
      const newWidth = Math.max(180, Math.min(400, resizeStartWidth - deltaX));
      setWidth(newWidth);
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
    } else {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [isResizing, resizeStartX, resizeStartWidth]);

  // Initialize position to top-right
  useEffect(() => {
    if (panelRef.current && panelRef.current.parentElement) {
      const parentRect = panelRef.current.parentElement.getBoundingClientRect();
      const panelRect = panelRef.current.getBoundingClientRect();
      setPosition({
        x: parentRect.width - panelRect.width - 4,
        y: 4,
      });
    }
  }, []);

  return (
    <div
      ref={panelRef}
      className="absolute bg-white border rounded-md shadow-lg overflow-hidden"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        fontSize: "0.85rem",
        width: `${width}px`,
      }}
    >
      <div className="absolute right-0 top-0 w-1 h-full cursor-ew-resize group" onMouseDown={handleResizeStart}>
        <div className="absolute right-0 top-0 w-1 h-full bg-transparent group-hover:bg-blue-400 opacity-50"></div>
      </div>
      <div className="absolute left-0 bottom-0 w-3 h-3 cursor-nesw-resize group" onMouseDown={handleResizeStart}>
        <div className="absolute left-0 bottom-0 w-2 h-2 bg-transparent group-hover:bg-blue-400 opacity-50 rounded-bl"></div>
      </div>

      {/* Drag handle */}
      <div className="bg-gray-100 p-1 border-b flex items-center cursor-move" onMouseDown={handleMouseDown}>
        <GripVertical className="h-3 w-3 text-gray-500 mr-1" />
        <div className="flex space-x-1 flex-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Undo" disabled>
            <Undo className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Redo" disabled>
            <Redo className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Save" disabled>
            <Save className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Open" disabled>
            <FolderOpen className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Accordion type="multiple" className="w-full text-xs" defaultValue={["formula"]}>
        <AccordionItem value="format">
          <AccordionTrigger className="px-2 py-1 text-xs cursor-pointer">Format</AccordionTrigger>
          <AccordionContent className="pt-1">
            <FormatSection />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="formula">
          <AccordionTrigger className="px-2 py-1 text-xs cursor-pointer">Formula</AccordionTrigger>
          <AccordionContent className="pt-1">
            <FormulaSection sheet={sheet} onEditorChange={onEditorChange} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="style">
          <AccordionTrigger className="px-2 py-1 text-xs cursor-pointer">Style</AccordionTrigger>
          <AccordionContent className="pt-1">
            <StyleSection />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function FormatSection() {
  return (
    <div className="px-2 pb-2 grid grid-cols-3 gap-1">
      <Button variant="outline" size="icon" className="h-6 w-6" title="Bold">
        <Bold className="h-3 w-3" />
      </Button>
      <Button variant="outline" size="icon" className="h-6 w-6" title="Italic">
        <Italic className="h-3 w-3" />
      </Button>
      <Button variant="outline" size="icon" className="h-6 w-6" title="Underline">
        <Underline className="h-3 w-3" />
      </Button>
      <Button variant="outline" size="icon" className="h-6 w-6" title="Align Left">
        <AlignLeft className="h-3 w-3" />
      </Button>
      <Button variant="outline" size="icon" className="h-6 w-6" title="Align Center">
        <AlignCenter className="h-3 w-3" />
      </Button>
      <Button variant="outline" size="icon" className="h-6 w-6" title="Align Right">
        <AlignRight className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function FormulaSection({
  sheet,
  onEditorChange,
}: {
  sheet: Sheet;
  // selectedCell: Cell;
  onEditorChange: (value: string | undefined) => void;
}) {
  const [formula, setFormula] = useState("// Enter your formula here\n=SUM(A1:A10)");
  const [editorValue, setEditorValue] = useState("");
  const [selectedCell] = usePrimitive(sheet.selectedCell);

  const editorRef = useRef<null | any>(null);
  useEffect(() => {
    setEditorValue(selectedCell?.strValue.get() ?? "");
  }, [selectedCell]);

  if (selectedCell == null) {
    return null;
  }

  return (
    <div className="px-2 pb-2 space-y-2">
      <div
        className="border rounded-sm overflow-hidden"
        style={{ height: "200px", display: "flex", flexDirection: "column" }}
      >
        {/* <Editor
          height="100px"
          defaultLanguage="javascript"
          value={formula}
          onChange={(value) => setFormula(value || "")}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "off",
            folding: false,
            fontSize: 11,
            lineHeight: 16,
            tabSize: 2,
            wordWrap: "on",
            automaticLayout: true,
            padding: { top: 4, bottom: 4 },
          }}
          theme="vs-light"
        /> */}
        <pre style={{ fontSize: 11 }}>
          const CELL[{selectedCell.row}][{selectedCell.col}] ={" "}
        </pre>
        <div style={{ flexGrow: 1, flexShrink: 1, overflow: "hidden" }}>
          <Editor
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "off",
              folding: false,
              fontSize: 11,
              lineHeight: 16,
              tabSize: 2,
              wordWrap: "on",
              automaticLayout: true,
              padding: { top: 0, bottom: 4 },
              renderLineHighlight: "none",
            }}
            onMount={function handleEditorDidMount(editor, monaco) {
              editorRef.current = editor;
              // editor.focus();
              const model = editor.getModel();
              if (!model) {
                return;
              }
              const lastLineIndex = model.getLineCount();
              editor.setPosition({
                column: model.getLineMaxColumn(lastLineIndex),
                lineNumber: lastLineIndex,
              });
            }}
            height="100%"
            language="javascript"
            onChange={onEditorChange}
            value={editorValue}
          />
        </div>
      </div>
    </div>
  );
}

export function StyleSection() {
  return (
    <div className="px-2 pb-2 space-y-1">
      <div className="flex items-center gap-1">
        <PaintBucket className="h-3 w-3" />
        <span className="text-xs">Background Color</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {[
          "bg-white",
          "bg-red-200",
          "bg-blue-200",
          "bg-green-200",
          "bg-yellow-200",
          "bg-purple-200",
          "bg-gray-200",
          "bg-pink-200",
        ].map((color, i) => (
          <Button key={i} variant="outline" size="icon" className={`${color} h-5 w-5 p-0 border`} />
        ))}
      </div>

      <div className="flex items-center gap-1 mt-2">
        <Type className="h-3 w-3" />
        <span className="text-xs">Font Size</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {["10px", "12px", "14px", "16px"].map((size, i) => (
          <Button key={i} variant="outline" size="sm" className="h-5 text-xs py-0">
            {size}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-1 mt-2">
        <Palette className="h-3 w-3" />
        <span className="text-xs">Text Color</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {[
          "bg-black",
          "bg-red-500",
          "bg-blue-500",
          "bg-green-500",
          "bg-yellow-500",
          "bg-purple-500",
          "bg-gray-500",
          "bg-pink-500",
        ].map((color, i) => (
          <Button key={i} variant="outline" size="icon" className={`${color} h-5 w-5 p-0 border`} />
        ))}
      </div>
    </div>
  );
}
