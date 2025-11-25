// components/tools/ticket-layout/NumberingEditor/DraggableElement.tsx

"use client";

import { useRef, useState } from "react";
import { useStore, NumberingElement } from "@/lib/ticket-layout/zustandStore";
import { NumberingGenerator } from "@/lib/ticket-layout/numberingGenerator";

interface DraggableElementProps {
  element: NumberingElement;
  side: "front" | "back";
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
}

export default function DraggableElement({
  element,
  side,
  scale,
  isSelected,
  onSelect,
}: DraggableElementProps) {
  const updateNumberingElement = useStore((s) => s.updateNumberingElement);

  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Generate preview text
  const generator = new NumberingGenerator([element]);
  const previewText = generator.generateForTicket(1);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("resize-handle")) {
      return; // Let resize handle deal with it
    }

    e.stopPropagation();
    onSelect();

    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.position.x * scale,
      y: e.clientY - element.position.y * scale,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = (e.clientX - dragStart.x) / scale;
      const newY = (e.clientY - dragStart.y) / scale;

      updateNumberingElement(side, element.id, {
        position: { x: Math.max(0, newX), y: Math.max(0, newY) },
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle resize
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.size.width;
    const startHeight = element.size.height;

    const handleResizeMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - startX) / scale;
      const deltaY = (e.clientY - startY) / scale;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes("e")) newWidth = Math.max(30, startWidth + deltaX);
      if (direction.includes("w")) newWidth = Math.max(30, startWidth - deltaX);
      if (direction.includes("s")) newHeight = Math.max(20, startHeight + deltaY);
      if (direction.includes("n")) newHeight = Math.max(20, startHeight - deltaY);

      updateNumberingElement(side, element.id, {
        size: { width: newWidth, height: newHeight },
      });
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  // Attach global listeners for drag
  if (isDragging) {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }

  const containerStyle = element.containerStyle;
  const hasBackground = containerStyle.backgroundColor !== "transparent";

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move select-none ${
        isSelected ? "ring-2 ring-[#00BFA6] ring-offset-2" : ""
      }`}
      style={{
        left: `${element.position.x * scale}px`,
        top: `${element.position.y * scale}px`,
        width: `${element.size.width * scale}px`,
        height: `${element.size.height * scale}px`,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex + 10,
        backgroundColor: hasBackground
          ? `${containerStyle.backgroundColor}${Math.round(containerStyle.backgroundOpacity * 255)
              .toString(16)
              .padStart(2, "0")}`
          : "transparent",
        border: containerStyle.borderWidth
          ? `${containerStyle.borderWidth}px solid ${containerStyle.borderColor}`
          : "none",
        borderRadius: `${containerStyle.borderRadius}px`,
        padding: `${containerStyle.padding}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Preview text */}
      <div
        className="flex h-full items-center justify-center overflow-hidden text-sm font-medium"
        style={{
          color: element.subElements[0]?.config.color || "#000000",
          fontSize: `${(element.subElements[0]?.config.fontSize || 12) * scale}px`,
          fontWeight: element.subElements[0]?.config.bold ? "bold" : "normal",
          fontStyle: element.subElements[0]?.config.italic ? "italic" : "normal",
          textAlign: containerStyle.textAlign,
        }}
      >
        {previewText || "000"}
      </div>

      {/* Resize handles (only when selected) */}
      {isSelected && (
        <>
          {/* Corner handles */}
          <div
            className="resize-handle absolute -right-1 -top-1 h-3 w-3 cursor-nw-resize rounded-full bg-[#00BFA6] shadow-md"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className="resize-handle absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize rounded-full bg-[#00BFA6] shadow-md"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          <div
            className="resize-handle absolute -bottom-1 -left-1 h-3 w-3 cursor-sw-resize rounded-full bg-[#00BFA6] shadow-md"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className="resize-handle absolute -left-1 -top-1 h-3 w-3 cursor-ne-resize rounded-full bg-[#00BFA6] shadow-md"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
        </>
      )}
    </div>
  );
}