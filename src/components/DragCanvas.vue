<template>
  <canvas id="drag-canvas" :width="width" :height="height"></canvas>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { AreaTypeColor } from '@/utils/const'

@Component
export default class DragCanvas extends Vue {
  @Prop({ required: true }) private width!: number
  @Prop({ required: true }) private height!: number
  @Prop({ default: 0 }) private activeIndex!: number
  @Prop() private value!: Array<any>

  ctx!: CanvasRenderingContext2D
  selectPoints: Array<any> = [] // 当前选中的多边形的点

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
  }

  init() {
    const canvas = document.getElementById('drag-canvas') as HTMLCanvasElement
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
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
