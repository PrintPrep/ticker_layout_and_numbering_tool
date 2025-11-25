// ============================================================================
// FILE: components/tools/ticket-layout/NumberingEditor/SubElementsList.tsx
// ============================================================================

"use client";

import { useStore, NumberingElement, SubElement } from "@/lib/ticket-layout/zustandStore";
import { GripVertical, Trash2 } from "lucide-react";

interface SubElementsListProps {
  element: NumberingElement;
  side: "front" | "back";
}

export default function SubElementsList({ element, side }: SubElementsListProps) {
  const updateNumberingElement = useStore((s) => s.updateNumberingElement);

  const handleUpdateSubElement = (subElementId: string, updates: Partial<SubElement>) => {
    const updatedSubElements = element.subElements.map((se) =>
      se.id === subElementId ? { ...se, ...updates } : se
    );
    updateNumberingElement(side, element.id, { subElements: updatedSubElements });
  };

  const handleDeleteSubElement = (subElementId: string) => {
    const updatedSubElements = element.subElements.filter((se) => se.id !== subElementId);
    updateNumberingElement(side, element.id, { subElements: updatedSubElements });
  };

  return (
    <div className="space-y-3">
      {element.subElements.map((subElement, idx) => (
        <div
          key={subElement.id}
          className="rounded-lg border border-gray-200 bg-gray-50 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-semibold uppercase text-gray-500">
                {subElement.type === "text" ? "Text" : "Numeric"} #{idx + 1}
              </span>
            </div>
            <button
              onClick={() => handleDeleteSubElement(subElement.id)}
              className="rounded p-1 text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Text Configuration */}
          {subElement.type === "text" && (
            <div className="space-y-2">
              <input
                type="text"
                value={subElement.config.text || ""}
                onChange={(e) =>
                  handleUpdateSubElement(subElement.id, {
                    config: { ...subElement.config, text: e.target.value },
                  })
                }
                placeholder="Enter text..."
                maxLength={50}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
          )}

          {/* Numeric Configuration */}
          {subElement.type === "numeric" && (
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">Type</label>
                <select
                  value={subElement.config.numericType || "123"}
                  onChange={(e) =>
                    handleUpdateSubElement(subElement.id, {
                      config: { ...subElement.config, numericType: e.target.value as any },
                    })
                  }
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                >
                  <option value="123">1, 2, 3...</option>
                  <option value="roman_lower">i, ii, iii...</option>
                  <option value="roman_upper">I, II, III...</option>
                  <option value="abc_lower">a, b, c...</option>
                  <option value="abc_upper">A, B, C...</option>
                  <option value="hex">Hexadecimal</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-600">Start</label>
                  <input
                    type="number"
                    value={subElement.config.startValue || 1}
                    onChange={(e) =>
                      handleUpdateSubElement(subElement.id, {
                        config: { ...subElement.config, startValue: parseInt(e.target.value) },
                      })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-600">Step</label>
                  <input
                    type="number"
                    value={subElement.config.step || 1}
                    onChange={(e) =>
                      handleUpdateSubElement(subElement.id, {
                        config: { ...subElement.config, step: parseInt(e.target.value) },
                      })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>

              {subElement.config.numericType === "123" && (
                <div>
                  <label className="mb-1 block text-xs text-gray-600">Digits</label>
                  <div className="flex gap-2">
                    <select
                      value={subElement.config.digits || "fixed"}
                      onChange={(e) =>
                        handleUpdateSubElement(subElement.id, {
                          config: { ...subElement.config, digits: e.target.value as any },
                        })
                      }
                      className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="dynamic">Dynamic</option>
                    </select>
                    {subElement.config.digits === "fixed" && (
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={subElement.config.fixedDigitCount || 3}
                        onChange={(e) =>
                          handleUpdateSubElement(subElement.id, {
                            config: {
                              ...subElement.config,
                              fixedDigitCount: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-16 rounded border border-gray-300 px-2 py-1.5 text-sm"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Common Styling */}
          <div className="mt-3 space-y-2 border-t border-gray-200 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-gray-600">Font Size</label>
                <input
                  type="number"
                  min={8}
                  max={72}
                  value={subElement.config.fontSize || 12}
                  onChange={(e) =>
                    handleUpdateSubElement(subElement.id, {
                      config: { ...subElement.config, fontSize: parseInt(e.target.value) },
                    })
                  }
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">Color</label>
                <input
                  type="color"
                  value={subElement.config.color || "#000000"}
                  onChange={(e) =>
                    handleUpdateSubElement(subElement.id, {
                      config: { ...subElement.config, color: e.target.value },
                    })
                  }
                  className="h-8 w-full rounded border border-gray-300"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={subElement.config.bold || false}
                  onChange={(e) =>
                    handleUpdateSubElement(subElement.id, {
                      config: { ...subElement.config, bold: e.target.checked },
                    })
                  }
                  className="rounded"
                />
                Bold
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={subElement.config.italic || false}
                  onChange={(e) =>
                    handleUpdateSubElement(subElement.id, {
                      config: { ...subElement.config, italic: e.target.checked },
                    })
                  }
                  className="rounded"
                />
                Italic
              </label>
            </div>
          </div>
        </div>
      ))}

      {element.subElements.length === 0 && (
        <p className="text-center text-sm text-gray-400">
          No sub-elements yet. Add text or numeric elements above.
        </p>
      )}

      {/* Separator Configuration */}
      {element.subElements.length > 1 && (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <label className="mb-2 block text-xs font-semibold text-gray-700">Separator</label>
          <select
            value={element.separator.type}
            onChange={(e) =>
              updateNumberingElement(side, element.id, {
                separator: { ...element.separator, type: e.target.value as any },
              })
            }
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="none">None</option>
            <option value="hyphen">Hyphen (-)</option>
            <option value="underscore">Underscore (_)</option>
            <option value="dot">Dot (.)</option>
            <option value="comma">Comma (,)</option>
            <option value="space">Space</option>
            <option value="custom">Custom</option>
          </select>

          {element.separator.type === "custom" && (
            <input
              type="text"
              maxLength={5}
              value={element.separator.customValue || ""}
              onChange={(e) =>
                updateNumberingElement(side, element.id, {
                  separator: { ...element.separator, customValue: e.target.value },
                })
              }
              placeholder="Custom separator..."
              className="mt-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          )}
        </div>
      )}
    </div>
  );
}