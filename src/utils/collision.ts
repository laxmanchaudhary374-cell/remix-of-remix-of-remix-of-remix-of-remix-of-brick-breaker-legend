/**
 * Shared collision-detection helpers.
 *
 * Every check in the game is a variant of axis-aligned bounding-box (AABB)
 * overlap. This module centralises the logic so callers don't re-derive it.
 */

/** A minimal rectangle (anything with x, y, width, height). */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A circle defined by a centre point and a radius. */
export interface Circle {
  position: { x: number; y: number };
  radius: number;
}

/** Return the centre of a rectangle. */
export const rectCenter = (r: Rect): { x: number; y: number } => ({
  x: r.x + r.width / 2,
  y: r.y + r.height / 2,
});

/** Check whether a circle overlaps a rectangle (AABB). */
export const circleRectOverlap = (circle: Circle, rect: Rect): boolean => (
  circle.position.x + circle.radius > rect.x &&
  circle.position.x - circle.radius < rect.x + rect.width &&
  circle.position.y + circle.radius > rect.y &&
  circle.position.y - circle.radius < rect.y + rect.height
);

/** Check whether a point is inside a rectangle. */
export const pointInRect = (px: number, py: number, rect: Rect): boolean => (
  px > rect.x &&
  px < rect.x + rect.width &&
  py > rect.y &&
  py < rect.y + rect.height
);

/** Euclidean distance between two points. */
export const distance = (
  x1: number, y1: number,
  x2: number, y2: number,
): number => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
