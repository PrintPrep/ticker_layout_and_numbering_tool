// lib/ticket-layout/numberingGenerator.ts

import { NumberingElement, SubElement } from "./zustandStore";

/**
 * Client-side numbering generator for real-time preview
 * Matches Python backend logic
 */
export class NumberingGenerator {
  private elements: NumberingElement[];

  constructor(elements: NumberingElement[]) {
    this.elements = elements;
  }

  /**
   * Generate numbering text for a specific ticket
   */
  generateForTicket(ticketNumber: number, rowData?: Record<string, any>): string {
    const parts: string[] = [];

    // Sort elements by order
    const sortedElements = [...this.elements].sort((a, b) => a.zIndex - b.zIndex);

    for (const element of sortedElements) {
      const elementParts: string[] = [];

      // Sort sub-elements by order
      const sortedSubElements = [...element.subElements].sort((a, b) => a.order - b.order);

      for (const subElement of sortedSubElements) {
        let value = "";

        if (subElement.type === "text") {
          // Static text
          value = subElement.config.text || "";
        } else if (subElement.type === "numeric") {
          // Dynamic numeric
          value = this.generateNumeric(subElement, ticketNumber);
        }

        // Override with CSV/XLSX data if mapped
        if (subElement.columnMapping && rowData) {
          value = String(rowData[subElement.columnMapping] ?? value);
        }

        elementParts.push(value);
      }

      // Join with separator
      const separator = this.getSeparator(element.separator);
      const elementText = elementParts.join(separator);

      parts.push(elementText);
    }

    return parts.join("");
  }

  /**
   * Generate numeric value
   */
  private generateNumeric(subElement: SubElement, ticketNumber: number): string {
    const config = subElement.config;
    const numericType = config.numericType || "123";
    const startValue = config.startValue ?? 1;
    const step = config.step ?? 1;
    const flow = config.flow || "increment";

    // Calculate value
    let value: number;
    if (flow === "increment") {
      value = startValue + (ticketNumber - 1) * step;
    } else {
      value = startValue - (ticketNumber - 1) * step;
    }

    // Format value
    switch (numericType) {
      case "123":
        const digits = config.digits === "fixed" ? (config.fixedDigitCount ?? 3) : String(value).length;
        return String(value).padStart(digits, "0");

      case "roman_lower":
        return this.toRoman(value).toLowerCase();

      case "roman_upper":
        return this.toRoman(value);

      case "abc_lower":
        return value <= 26 ? String.fromCharCode(96 + value) : `z${value - 26}`;

      case "abc_upper":
        return value <= 26 ? String.fromCharCode(64 + value) : `Z${value - 26}`;

      case "hex":
        return value.toString(16).toUpperCase();

      default:
        return String(value);
    }
  }

  /**
   * Convert number to Roman numeral
   */
  private toRoman(num: number): string {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];

    let result = "";
    let remaining = num;

    for (let i = 0; i < values.length; i++) {
      while (remaining >= values[i]) {
        result += symbols[i];
        remaining -= values[i];
      }
    }

    return result;
  }

  /**
   * Get separator character
   */
  private getSeparator(separatorConfig: { type: string; customValue?: string }): string {
    const separators: Record<string, string> = {
      hyphen: "-",
      underscore: "_",
      dot: ".",
      comma: ",",
      space: " ",
      none: "",
      custom: separatorConfig.customValue || "",
    };

    return separators[separatorConfig.type] || "";
  }
}