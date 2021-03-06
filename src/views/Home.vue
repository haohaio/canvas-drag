<template>
  <div>
    <el-card>
      <section slot="header" class="header">
        <span class="header-title">区域设置</span>
        <el-button type="primary" size="small" @click="saveAllArea">
          保存
        </el-button>
      </section>

      <section class="main">
        <header>
          <el-button class="add-btn" type="primary" size="small" @click="handleAdd">
            新增区域
          </el-button>
        </header>
        <div class="content-wrapper">
          <div ref="canvasArea" class="drag-canvas">
            <drag-canvas v-model="allPoints" :width="canvasWidth" :height="canvasHeight" :active-index="activeIndex" />
          </div>

          <div class="area-list">
            <el-table ref="areaTable" :data="areaList" :row-class-name="setRowIndex" highlight-current-row @row-click="chooseRow">
              <el-table-column label="区域名称">
                <template slot-scope="scope">
                  <span :style="{color: areaTypeColor[scope.$index].strokeColor}">{{ scope.row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="启用">
                <template slot-scope="scope">
                  <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" />
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="text" @click="handleEdit(scope.row, scope.$index)">
                    编辑
                  </el-button>
                  <el-button type="text" style="color: #F56C6C" @click="handleDelete(scope.$index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </section>
    </el-card>

    <el-dialog :title="dialogTitleMap[dialogType]" :visible.sync="dialogVisible" width="440px" center>
      <el-form ref="areaForm" size="small" label-width="100px" :model="areaForm" :rules="areaFormRules">
        <el-form-item prop="name" label="区域名称：">
          <el-input v-model="areaForm.name" maxlength="12" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="saveArea">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { AreaTypeColor } from '@/utils/const'
import { ElForm } from 'element-ui/types/form'
import { ElTable } from 'element-ui/types/table'
import { getAreas, saveAreas } from '@/api/area'

@Component({
  name: 'Home',
  components: {
    // 由于需要在子组件内获取 width 和 height 这里必须使用异步组件，避免获取到的 width 和 height 为 0
    DragCanvas: () => import('@/components/DragCanvas.vue')
  }
})
export default class extends Vue {
  canvasWidth = 0
  canvasHeight = 0
  defaultPoints: Array<object> = []
  userId = 'admin'
  areaList: Array<any> = []
  areaTypeColor = AreaTypeColor
  areaForm: any = {
    name: ''
  }

  areaFormRules = {
    name: [{ required: true, message: '请输入区域名称' }]
  }

  dialogVisible = false
  dialogTitleMap = {
    add: '新增区域',
    edit: '编辑区域'
  }

  dialogType = 'add' // add/edit
  activeIndex = 0
  allPoints: Array<any> = []

  @Watch('areaList')
  onAreaListChanged(newValue: Array<any>) {
    const allPoints: Array<any> = []
    newValue.forEach((area: any) => {
      allPoints.push(this.ratioToPoints(area.points))
    })

    this.allPoints = allPoints
  }

  mounted() {
    this.init()
  }

  init() {
    const canvasArea = this.$refs.canvasArea as Element
    this.canvasWidth = canvasArea.clientWidth
    this.canvasHeight = this.canvasWidth / 1.8

    this.setDefaultPoints()
    this.getAreas()
  }

  async getAreas() {
    const { data } = await getAreas()

    this.areaList = data

    // 默认选中第一行
    if (this.areaList.length) {
      const table = this.$refs.areaTable as ElTable
      table.setCurrentRow(this.areaList[0])
    }
  }

  setDefaultPoints() {
    const radius = 200
    this.defaultPoints = [
      {
        x: this.canvasWidth / 2 - radius,
        y: this.canvasHeight / 2
      },
      {
        x: this.canvasWidth / 2 - radius * Math.sin(Math.PI / 6),
        y: this.canvasHeight / 2 - radius * Math.sin(Math.PI / 3)
      },
      {
        x: this.canvasWidth / 2 + radius * Math.sin(Math.PI / 6),
        y: this.canvasHeight / 2 - radius * Math.sin(Math.PI / 3)
      },
      {
        x: this.canvasWidth / 2 + radius,
        y: this.canvasHeight / 2
      },
      {
        x: this.canvasWidth / 2 + 200 * Math.sin(Math.PI / 6),
        y: this.canvasHeight / 2 + 200 * Math.sin(Math.PI / 3)
      },
      {
        x: this.canvasWidth / 2 - 200 * Math.sin(Math.PI / 6),
        y: this.canvasHeight / 2 + 200 * Math.sin(Math.PI / 3)
      }
    ]
  }

  // 由于 row-click 方法中未返回 rowIndex 字段，需要通过绑定 row-class-name 时设置 index
  chooseRow(row: any, column: any, event: any) {
    this.activeIndex = Number(event.currentTarget.className.split(':')[1])
  }

  setRowIndex({ rowIndex }: any) {
    return `index:${rowIndex}`
  }

  resetForm() {
    this.areaForm = {
      name: ''
    }
  }

  handleAdd() {
    if (this.areaList.length === 4) {
      return this.$message.error('区域设置已达上限，无法再添加')
    }

    this.resetForm()
    this.dialogType = 'add'
    this.dialogVisible = true
    this.$nextTick(() => {
      const form = this.$refs.areaForm as ElForm
      form.clearValidate()
    })
  }

  saveArea() {
    const form = this.$refs.areaForm as ElForm

    form.validate(valid => {
      if (!valid) {
        return
      }

      if (this.dialogType === 'add') {
        const area = {
          ...this.areaForm,
          userId: this.userId,
          status: 1,
          points: this.pointsToRadio(this.defaultPoints)
        }
        this.areaList.push(area)
        this.activeIndex = this.areaList.length - 1
      } else {
        this.areaList[this.activeIndex].name = this.areaForm.name
      }
      this.$message('点击保存后，服务器将更新数据')
      this.dialogVisible = false
    })
  }

  handleEdit(item: object) {
    this.dialogType = 'edit'
    this.areaForm = { ...item }
    this.dialogVisible = true
    this.$nextTick(() => {
      const form = this.$refs.areaForm as ElForm
      form.clearValidate()
    })
  }

  handleDelete() {
    this.$confirm('确认要删除吗该区域吗？', '提示', {
      type: 'warning',
      center: true
    })
      .then(() => {
        const lastIndex = this.areaList.length - 1
        this.areaList.splice(this.activeIndex, 1)
        this.activeIndex =
          this.activeIndex === lastIndex ? lastIndex - 1 : this.activeIndex
        this.$message.success('点击保存后，服务器将更新数据')
      })
      .catch(err => console.log(err))
  }

  ratioToPoints(ratios: Array<any>) {
    const points: Array<any> = []
    ratios.forEach(radio => {
      points.push({
        x: this.canvasWidth * radio.xRatio,
        y: this.canvasHeight * radio.yRatio
      })
    })

    return points
  }

  pointsToRadio(points: Array<any>) {
    const radios: Array<any> = []
    points.forEach(point => {
      radios.push({
        xRatio: +(point.x / this.canvasWidth).toFixed(2),
        yRatio: +(point.y / this.canvasHeight).toFixed(2)
      })
    })

    return radios
  }

  async saveAllArea() {
    // 保存前更新区域的坐标点集合
    this.allPoints.forEach((points: Array<any>, index: number) => {
      this.areaList[index].points = this.pointsToRadio(points)
    })

    const params: any = {
      userId: this.userId,
      areas: this.areaList
    }

    await saveAreas(params)

    this.$message.success('保存成功')
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;

  .header-title {
    flex: 1;
    font-weight: bold;
  }
}

.main {
  header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }

  .content-wrapper {
    display: flex;

    .drag-canvas {
      flex: 1;
      margin-right: 20px;
    }

    .area-list {
      width: 30%;

      /deep/.el-table thead tr th {
        background: #eff8ff;
        color: #666;
      }
    }
  }
}
</style>
