// components/tools/ticket-layout/NumberingEditor/ElementCard.tsx

"use client";

import { useState } from "react";
import { useStore, NumberingElement, SubElement } from "@/lib/ticket-layout/zustandStore";
import SubElementsList from "./SubElementsList";
import ContainerSettings from "./ContainerSettings";
import AddonsPanel from "./AddonsPanel";
import { X, Settings, Layers, Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface ElementCardProps {
  element: NumberingElement;
  side: "front" | "back";
  onDeselect: () => void;
}

export default function ElementCard({ element, side, onDeselect }: ElementCardProps) {
  const [activeTab, setActiveTab] = useState<"elements" | "container" | "addons">("elements");

  const updateNumberingElement = useStore((s) => s.updateNumberingElement);
  const removeNumberingElement = useStore((s) => s.removeNumberingElement);

  const handleAddSubElement = (type: "text" | "numeric") => {
    const newSubElement: SubElement = {
      id: uuidv4(),
      order: element.subElements.length,
      type: type,
      config:
        type === "text"
          ? {
              text: "Sample",
              fontFamily: "Helvetica",
              fontSize: 14,
              bold: false,
              italic: false,
              color: "#000000",
            }
          : {
              numericType: "123",
              digits: "fixed",
              fixedDigitCount: 3,
              flow: "increment",
              startValue: 1,
              step: 1,
              fontFamily: "Helvetica",
              fontSize: 14,
              bold: false,
              italic: false,
              color: "#000000",
            },
    };

    updateNumberingElement(side, element.id, {
      subElements: [...element.subElements, newSubElement],
    });
  };

  const handleDelete = () => {
    if (confirm("Delete this numbering element?")) {
      removeNumberingElement(side, element.id);
      onDeselect();
    }
  };

  return (
    <div className="rounded-lg border border-white/60 bg-white/90 shadow-lg backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-800">
          Element #{element.zIndex + 1} Configuration
        </h3>
        <button
          onClick={onDeselect}
          className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab("elements")}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "elements"
              ? "border-b-2 border-[#00BFA6] bg-white text-[#00BFA6]"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Sub-Elements
        </button>
        <button
          onClick={() => setActiveTab("container")}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "container"
              ? "border-b-2 border-[#00BFA6] bg-white text-[#00BFA6]"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Settings className="h-3.5 w-3.5" />
          Container
        </button>
        <button
          onClick={() => setActiveTab("addons")}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "addons"
              ? "border-b-2 border-[#00BFA6] bg-white text-[#00BFA6]"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Add-ons
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-h-[500px] overflow-y-auto p-4">
        {activeTab === "elements" && (
          <div className="space-y-4">
            <SubElementsList element={element} side={side} />

            {/* Add Sub-Element Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleAddSubElement("text")}
                className="flex-1 rounded-lg border border-[#00BFA6] bg-white px-3 py-2 text-xs font-medium text-[#00BFA6] transition-colors hover:bg-[#00BFA6] hover:text-white"
              >
                + Text
              </button>
              <button
                onClick={() => handleAddSubElement("numeric")}
                className="flex-1 rounded-lg border border-[#00BFA6] bg-white px-3 py-2 text-xs font-medium text-[#00BFA6] transition-colors hover:bg-[#00BFA6] hover:text-white"
              >
                + Numeric
              </button>
            </div>
          </div>
        )}

        {activeTab === "container" && <ContainerSettings element={element} side={side} />}

        {activeTab === "addons" && <AddonsPanel element={element} side={side} />}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <button
          onClick={handleDelete}
          className="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
        >
          Delete Element
        </button>
      </div>
    </div>
  );
}