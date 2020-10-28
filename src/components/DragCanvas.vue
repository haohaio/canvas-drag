<template>
  <canvas id="drag-canvas" :width="width" :height="height"></canvas>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { AreaTypeColor } from '@/utils/const'
import { rayCasting } from '@/utils'

@Component
export default class DragCanvas extends Vue {
  @Prop({ required: true }) private width!: number
  @Prop({ required: true }) private height!: number
  @Prop({ default: 0 }) private activeIndex!: number
  @Prop() private value!: Array<any>

  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  selectPoints: Array<any> = [] // 当前选中的多边形的点
  moveOne = false
  moveAll = false
  startPos: any = {}
  moveIndex = 0

  get allPoints() {
    return this.value
  }
  @Watch('allPoints', { deep: true })
  onAllPointsChanged(newValue: Array<any>) {
    this.$emit('input', newValue)
    this.paint()
  }

  @Watch('activeIndex')
  onActiveIndexChanged() {
    this.paint()
  }

  mounted() {
    this.init()
    this.paint()
    this.bindEvent()
  }

  init() {
    this.canvas = document.getElementById('drag-canvas') as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
  }

  bindEvent() {
    this.canvas.onmousedown = this.mousedownEvent.bind(this)
    document.onmouseup = this.mouseupEvent.bind(this)
    this.canvas.onmousemove = this.mousemoveEvent.bind(this)
  }
  unbindEvent() {
    this.canvas.onmousedown = null
    document.onmouseup = null
    this.canvas.onmousemove = null
  }

  mousedownEvent(e: any) {
    const x = e.offsetX
    const y = e.offsetY
    // 处理鼠标 offset 边界
    const pos = this.checkBoundary(x, y)
    // 判断是否是可拖拽的 6个点
    const flag = this.pointInSmallRects(pos)
    // 判断是否在多边形内
    const dragFlag = rayCasting(pos, this.selectPoints)

    if (flag) {
      this.moveOne = true
    } else {
      if (dragFlag) {
        this.moveAll = true
        this.startPos = pos
      }
    }
  }

  mouseupEvent() {
    this.moveOne = false
    this.moveAll = false
    this.startPos = {}
  }

  mousemoveEvent(e: any) {
    const x = e.offsetX
    const y = e.offsetY
    // 处理鼠标 offset 边界
    const pos = this.checkBoundary(x, y)

    // 判断是否是可拖拽的 6个点
    const flag = this.pointInSmallRects(pos)
    // 判断是否在多边形内
    const dragFlag = rayCasting(pos, this.selectPoints)
    // 修改光标样式
    if (flag) {
      this.canvas.style.cursor = 'crosshair'
    } else {
      if (dragFlag) {
        this.canvas.style.cursor = 'move'
      } else {
        this.canvas.style.cursor = 'auto'
      }
    }

    if (this.moveOne) {
      this.updatePoint(pos)
    }

    if (this.moveAll) {
      this.updatePoints(pos)
    }
  }

  pointInSmallRects(pos: any) {
    for (let i = 0, len = this.selectPoints.length; i < len; i++) {
      const point = this.selectPoints[i]
      if (
        pos.x >= point.x - 2 &&
        pos.x <= point.x + 12 &&
        pos.y >= point.y - 2 &&
        pos.y <= point.y + 12
      ) {
        this.moveIndex = i
        return true
      }
    }

    return false
  }

  checkBoundary(x: number, y: number) {
    if (x <= 2) {
      x = 2
    }
    if (x >= this.width - 12) {
      x = this.width - 12
    }
    if (y <= 2) {
      y = 2
    }
    if (y >= this.height - 12) {
      y = this.height - 12
    }
    return { x, y }
  }

  updatePoint(pos: any) {
    this.selectPoints[this.moveIndex].x = pos.x
    this.selectPoints[this.moveIndex].y = pos.y
  }

  updatePoints(pos: any) {
    const disX = pos.x - this.startPos.x
    const disY = pos.y - this.startPos.y
    const xArr = this.selectPoints.reduce((p: any, t: any) => [...p, t.x], [])
    const yArr = this.selectPoints.reduce((p: any, t: any) => [...p, t.y], [])
    const minX = Math.min(...xArr) + disX
    const minY = Math.min(...yArr) + disY
    const maxX = Math.max(...xArr) + disX
    const maxY = Math.max(...yArr) + disY
    // 获取坐标最小值，判断是否可以更新坐标
    if (
      minX < 2 ||
      maxX > this.canvas.width - 12 ||
      minY < 2 ||
      maxY > this.canvas.height - 12
    ) {
      // 更新startPos
      this.startPos = pos
      return
    }
    // 更新坐标
    for (let i = 0; i < this.selectPoints.length; i++) {
      let finalDix = this.selectPoints[i].x
      let finalDisY = this.selectPoints[i].y
      finalDix += disX
      finalDisY += disY
      this.selectPoints[i].x = finalDix
      this.selectPoints[i].y = finalDisY
    }
    this.startPos = pos
  }

  paint() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.width, this.height)
    // 填充整个 canvas 的背景色
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    this.ctx.fillRect(0, 0, this.width, this.height)

    // 绘制多边形
    this.allPoints.forEach((points: Array<any>, index: number) => {
      if (index === this.activeIndex) {
        this.selectPoints = points
      } else {
        this.drawPolygon(points, index)
      }
    })

    // 最后绘制选中的多边形
    this.drawPolygon(this.selectPoints, this.activeIndex)
    this.drawSmallRects()
  }

  drawPolygon(points: Array<any>, index: number) {
    if (!points.length) {
      return
    }

    this.ctx.beginPath()
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      if (!i) {
        this.ctx.moveTo(point.x + 5, point.y + 5)
      } else {
        this.ctx.lineTo(point.x + 5, point.y + 5)
      }
    }
    this.ctx.closePath()
    this.ctx.strokeStyle = AreaTypeColor[index].strokeColor
    this.ctx.lineWidth = 2
    this.ctx.stroke()
    this.ctx.fillStyle = AreaTypeColor[index].fillColor
    this.ctx.fill()
  }

  drawSmallRects() {
    this.selectPoints.forEach((point: any) => {
      this.ctx.strokeStyle = 'white'
      this.ctx.lineWidth = 2
      this.ctx.strokeRect(point.x, point.y, 10, 10)
    })
  }
}
</script>

<style scoped lang="scss">
</style>
