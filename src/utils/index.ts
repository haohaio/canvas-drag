/**
 * 射线法
 * @param p 点坐标 { x, y }
 * @param poly 多边形点数组
 */
export function rayCasting(p: any, poly: Array<any>) {
  const px = p.x;
  const py = p.y;
  let flag = false;

  for (let i = 0, l = poly.length, j = l - 1; i < l; j = i++) {
    const sx = poly[i].x;
    const sy = poly[i].y;
    const tx = poly[j].x;
    const ty = poly[j].y;
    // 点与多边形顶点重合
    if ((sx === px && sy === py) || (tx === px && ty === py)) {
      return true
    }
    // 判断线段两端点是否在射线两侧
    if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
      // 线段上与射线 Y 坐标相同的点的 X 坐标
      const x = sx + ((py - sy) * (tx - sx)) / (ty - sy)
      // 点在多边形的边上
      if (x === px) {
        return true
      }
      // 射线穿过多边形的边界
      if (x > px) {
        flag = !flag
      }
    }
  }
  // 射线穿过多边形边界的次数为奇数时点在多边形内
  return flag
}