import { linesIntersect } from './mathUtils.js';
import { Vec2 } from './vec2.js';

const tempStart: Vec2 = new Vec2();
const tempEnd: Vec2 = new Vec2();

/**
 * Rectangle class.
 */
export class Rectangle {
  /**
   * The x axis position of the rectangle.
   */
  x: number;

  /**
   * The y axis position of the rectangle.
   */
  y: number;

  /**
   * The width of the rectangle.
   */
  width: number;

  /**
   * The height of the rectangle.
   */
  height: number;

  /**
   * Create a new Rectangle.
   * @param x - The top left x position.
   * @param y - The top left y position.
   * @param width - The rectangle width.
   * @param height - The rectangle height.
   */
  constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Check if a point is inside a rectangle.
   * @param x - The x position to check.
   * @param y - The y position to check.
   * @returns True if the point is inside the rectangle.
   */
  hasPoint(x: number, y: number): boolean {
    return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
  }

  /**
   * Check if two rectangles intersect.
   * @param rect - The rectangle to check with.
   * @returns True if the rectangles intersect.
   */
  intersects(rect: Rectangle): boolean {
    return (
      this.x < rect.x + rect.width &&
      this.x + this.width > rect.x &&
      this.y < rect.y + rect.height &&
      this.y + this.height > rect.y
    );
  }

  /**
   * Check if a line intersects with this rectangle.
   * @param origin - The start point of the line.
   * @param target - The end point of the line.
   * @param out - The intersect point.
   * @returns True if the line intersects.
   */
  intersectsLine(origin: Vec2, target: Vec2, out?: Vec2): boolean {
    let intersects = false;

    // Check top.
    tempStart.set(this.x, this.y);
    tempEnd.set(this.x + this.width, this.y);
    if (linesIntersect(origin, target, tempStart, tempEnd, out)) {
      intersects = true;
    }

    // Check right
    tempStart.set(this.x + this.width, this.y + this.height);
    tempEnd.set(this.x + this.width, this.y);
    if (linesIntersect(origin, target, tempStart, tempEnd, out)) {
      intersects = true;
    }

    // Check bottom.
    tempStart.set(this.x, this.y + this.height);
    tempEnd.set(this.x, this.y + this.height);
    if (linesIntersect(origin, target, tempStart, tempEnd, out)) {
      intersects = true;
    }

    // Check left.
    tempStart.set(this.x, this.y);
    tempEnd.set(this.x, this.y + this.height);
    if (linesIntersect(origin, target, tempStart, tempEnd, out)) {
      intersects = true;
    }

    return intersects;
  }

  /**
   * Update the rectangle values.
   * @param x - The new x position.
   * @param y - The new y position.
   * @param width - The new width.
   * @param height - The new height.
   */
  set(x: number, y: number, width: number, height: number): void {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Get the string representation of the rectangle. Used for debugging.
   * @returns The rectangle as a string.
   */
  toString(): string {
    return `Rectangle(x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height})`;
  }
}
