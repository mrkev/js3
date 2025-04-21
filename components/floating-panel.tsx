"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  PaintBucket,
  Type,
  Palette,
  Undo,
  Redo,
  Save,
  FolderOpen,
  GripVertical,
} from "lucide-react";

export function FloatingPanel() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

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
      className="absolute bg-white border rounded-md shadow-lg overflow-hidden w-60"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        fontSize: "0.85rem",
      }}
    >
      {/* Drag handle */}
      <div className="bg-gray-100 p-1 border-b flex items-center cursor-move" onMouseDown={handleMouseDown}>
        <GripVertical className="h-3 w-3 text-gray-500 mr-1" />
        <div className="flex space-x-1 flex-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Undo">
            <Undo className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Redo">
            <Redo className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Save">
            <Save className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Open">
            <FolderOpen className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Accordion type="multiple" className="w-full text-xs">
        <AccordionItem value="format">
          <AccordionTrigger className="px-2 py-1 text-xs">Format</AccordionTrigger>
          <AccordionContent className="pt-1">
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="formula">
          <AccordionTrigger className="px-2 py-1 text-xs">Formula</AccordionTrigger>
          <AccordionContent className="pt-1">
            <div className="px-2 pb-2 space-y-1">
              <Input placeholder="Enter formula..." className="h-6 text-xs" />
              <div className="grid grid-cols-2 gap-1">
                <Button variant="outline" size="sm" className="h-6 text-xs py-0">
                  Sum
                </Button>
                <Button variant="outline" size="sm" className="h-6 text-xs py-0">
                  Average
                </Button>
                <Button variant="outline" size="sm" className="h-6 text-xs py-0">
                  Count
                </Button>
                <Button variant="outline" size="sm" className="h-6 text-xs py-0">
                  Max
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="style">
          <AccordionTrigger className="px-2 py-1 text-xs">Style</AccordionTrigger>
          <AccordionContent className="pt-1">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
