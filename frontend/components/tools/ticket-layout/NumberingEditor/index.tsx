// components/tools/ticket-layout/NumberingEditor/index.tsx

"use client";

import { useState } from "react";
import { useStore } from "@/lib/ticket-layout/zustandStore";
import Canvas from "./Canvas";
import ElementCard from "./ElementCard";
import DataSourceSelector from "./DataSourceSelector";
import { v4 as uuidv4 } from "uuid";
import { Plus, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NumberingEditor() {
  const router = useRouter();
  const [currentSide, setCurrentSide] = useState<"front" | "back">("front");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const numberingElements = useStore((s) => s.numberingElements);
  const addNumberingElement = useStore((s) => s.addNumberingElement);
  const front = useStore((s) => s.front);
  const back = useStore((s) => s.back);
  const isDoubleSided = useStore((s) => s.isDoubleSided);

  const currentElements = numberingElements[currentSide];
  const selectedElement = currentElements.find((el) => el.id === selectedElementId);

  const handleAddElement = () => {
    const newElement = {
      id: uuidv4(),
      side: currentSide,
      position: { x: 50, y: 50 },
      size: { width: 100, height: 30 },
      rotation: 0,
      zIndex: currentElements.length,
      subElements: [
        {
          id: uuidv4(),
          order: 0,
          type: "numeric" as const,
          config: {
            numericType: "123" as const,
            digits: "fixed" as const,
            fixedDigitCount: 3,
            flow: "increment" as const,
            startValue: 1,
            step: 1,
            fontFamily: "Helvetica",
            fontSize: 16,
            bold: false,
            italic: false,
            color: "#000000",
          },
        },
      ],
      separator: {
        type: "none" as const,
      },
      layout: {
        direction: "horizontal" as const,
        alignment: "center" as const,
        spacing: 0,
      },
      containerStyle: {
        backgroundColor: "transparent",
        backgroundOpacity: 1,
        borderWidth: 0,
        borderColor: "#000000",
        borderOpacity: 1,
        borderRadius: 0,
        padding: 5,
        textAlign: "center" as const,
      },
    };

    addNumberingElement(currentSide, newElement);
    setSelectedElementId(newElement.id);
  };

  const handleContinue = () => {
    router.push("/tools/ticket-layout");
  };

  const currentDesignUrl = currentSide === "front" ? front?.url : back?.url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F7F4] to-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-white/60 bg-white/90 px-6 py-4 shadow-lg backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00BFA6]">
              Step 3
            </p>
            <h1 className="text-2xl font-bold text-gray-800">Numbering Editor</h1>
            <p className="text-sm text-gray-600">
              Add numbering elements, QR codes, and barcodes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 rounded-lg bg-[#00BFA6] px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#00D1B2] hover:shadow-lg"
            >
              <Save className="h-4 w-4" />
              Continue to Workspace
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Sidebar - Controls */}
          <div className="space-y-4 lg:col-span-1">
            {/* Side Toggle */}
            <div className="rounded-lg border border-white/60 bg-white/90 p-4 shadow-lg backdrop-blur">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                Edit Side
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentSide("front")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    currentSide === "front"
                      ? "bg-[#00BFA6] text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => setCurrentSide("back")}
                  disabled={!isDoubleSided}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    currentSide === "back"
                      ? "bg-[#00BFA6] text-white shadow-md"
                      : isDoubleSided
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "cursor-not-allowed bg-gray-50 text-gray-400"
                  }`}
                >
                  Back
                </button>
              </div>
            </div>

            {/* Add Element Button */}
            <button
              onClick={handleAddElement}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00BFA6] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#00D1B2] hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Add Numbering Element
            </button>

            {/* Data Source Selector */}
            <DataSourceSelector />

            {/* Element Configuration */}
            {selectedElement && (
              <ElementCard
                element={selectedElement}
                side={currentSide}
                onDeselect={() => setSelectedElementId(null)}
              />
            )}

            {/* Elements List */}
            {currentElements.length > 0 && !selectedElement && (
              <div className="rounded-lg border border-white/60 bg-white/90 p-4 shadow-lg backdrop-blur">
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Elements ({currentElements.length})
                </h3>
                <div className="space-y-2">
                  {currentElements.map((element) => (
                    <button
                      key={element.id}
                      onClick={() => setSelectedElementId(element.id)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:border-[#00BFA6] hover:bg-white"
                    >
                      Element #{element.zIndex + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center - Canvas */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-white/60 bg-white/90 p-6 shadow-lg backdrop-blur">
              <Canvas
                side={currentSide}
                designImageUrl={currentDesignUrl}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}