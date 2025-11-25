// ============================================================================
// FILE: components/tools/ticket-layout/NumberingEditor/ContainerSettings.tsx
// ============================================================================

export default function ContainerSettings({ element, side }: SubElementsListProps) {
  const updateNumberingElement = useStore((s) => s.updateNumberingElement);

  const handleUpdate = (updates: Partial<typeof element.containerStyle>) => {
    updateNumberingElement(side, element.id, {
      containerStyle: { ...element.containerStyle, ...updates },
    });
  };

  return (
    <div className="space-y-4">
      {/* Background */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-700">Background</label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="color"
              value={element.containerStyle.backgroundColor}
              onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
              className="h-10 w-full rounded border border-gray-300"
            />
            <button
              onClick={() => handleUpdate({ backgroundColor: "transparent" })}
              className="rounded border border-gray-300 px-3 text-xs font-medium hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">Opacity</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={element.containerStyle.backgroundOpacity}
              onChange={(e) => handleUpdate({ backgroundOpacity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Border */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-700">Border</label>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-gray-600">Width</label>
              <input
                type="number"
                min={0}
                max={10}
                value={element.containerStyle.borderWidth}
                onChange={(e) => handleUpdate({ borderWidth: parseInt(e.target.value) })}
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600">Color</label>
              <input
                type="color"
                value={element.containerStyle.borderColor}
                onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                className="h-8 w-full rounded border border-gray-300"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">Radius</label>
            <input
              type="number"
              min={0}
              max={20}
              value={element.containerStyle.borderRadius}
              onChange={(e) => handleUpdate({ borderRadius: parseInt(e.target.value) })}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Padding & Alignment */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-600">Padding</label>
          <input
            type="number"
            min={0}
            max={20}
            value={element.containerStyle.padding}
            onChange={(e) => handleUpdate({ padding: parseInt(e.target.value) })}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-600">Text Align</label>
          <select
            value={element.containerStyle.textAlign}
            onChange={(e) => handleUpdate({ textAlign: e.target.value as any })}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </div>
  );
}