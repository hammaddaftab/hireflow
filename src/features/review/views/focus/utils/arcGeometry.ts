export interface Point2D {
  x: number;
  y: number;
}

/**
 * Calculates a point along a quadratic bezier curve for parameter t in [0, 1].
 * B(t) = (1-t)^2 * P0 + 2*(1-t)*t * P1 + t^2 * P2
 */
export function calculateQuadraticBezierPoint(
  t: number,
  p0: Point2D,
  p1: Point2D,
  p2: Point2D
): Point2D {
  const oneMinusT = 1 - t;
  const x =
    oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x;
  const y =
    oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y;
  return { x, y };
}

/**
 * Standard anchor points for the 3D circular ring carousel track.
 */
export const DEFAULT_RING_TRACK_POINTS = {
  p0: { x: 220, y: 435 },
  p1: { x: 700, y: 230 },
  p2: { x: 1180, y: 435 },
};

