<template>
  <div>
    <el-card>
      <section slot="header" class="header">
        <span class="header-title">区域设置</span>
        <el-button type="primary" size="small">保存</el-button>
      </section>

      <section class="main">
        <div class="drag-canvas" ref="canvas"></div>
        <div class="area-list">
          <el-button class="add-btn" type="primary" size="small" @click="handleAdd">新增区域</el-button>
          <el-table ref="areaTable" :data="areaList" @row-click="chooseRow" :row-class-name="setRowIndex" highlight-current-row>
            <el-table-column label="区域名称">
              <template slot-scope="scope">
                <span :style="{color: areaTypeColor[scope.$index].strokeColor}">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="启用">
              <template slot-scope="scope">
                <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" @click="handleEdit(scope.row, scope.$index)">编辑</el-button>
                <el-button type="text" style="color: #F56C6C" @click="handleDelete(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </section>
    </el-card>

    <el-dialog :title="dialogTitleMap[dialogType]" :visible.sync="dialogVisible" width="440px" center>
      <el-form ref="areaForm" size="small" label-width="100px" :model="areaForm" :rules="areaFormRules">
        <el-form-item prop="name" label="区域名称：">
          <el-input v-model="areaForm.name" maxlength="12"></el-input>
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
import HelloWorld from '@/components/HelloWorld.vue'
import { Component, Vue } from 'vue-property-decorator'
import { AreaTypeColor } from '@/utils/const'
import { ElForm } from 'element-ui/types/form'
import { ElTable } from 'element-ui/types/table'

@Component({
  name: 'Home',
  components: {
    HelloWorld
  }
})
export default class extends Vue {
  canvasWidth = 0
  canvasHeight = 0
  defaultPoints: Array<object> = []
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
  selectIndex = 0

  mounted() {
    this.setMockData()
  }

  setMockData() {
    this.areaList = [
      {
        name: '区域1',
        status: 1,
        points: [
          { xRatio: 0.0, yRatio: 0.5 },
          { xRatio: 0.1, yRatio: 0.18 },
          { xRatio: 0.29, yRatio: 0.18 },
          { xRatio: 0.45, yRatio: 0.52 },
          { xRatio: 0.29, yRatio: 0.81 },
          { xRatio: 0.1, yRatio: 0.81 }
        ]
      },
      {
        name: '区域2',
        status: 1,
        points: [
          { xRatio: 0.57, yRatio: 0.65 },
          { xRatio: 0.67, yRatio: 0.33 },
          { xRatio: 0.86, yRatio: 0.33 },
          { xRatio: 0.96, yRatio: 0.65 },
          { xRatio: 0.86, yRatio: 0.96 },
          { xRatio: 0.67, yRatio: 0.96 }
        ]
      },
      {
        name: '区域3',
        status: 1,
        points: [
          { xRatio: 0.2, yRatio: 0.42 },
          { xRatio: 0.3, yRatio: 0.11 },
          { xRatio: 0.5, yRatio: 0.11 },
          { xRatio: 0.6, yRatio: 0.42 },
          { xRatio: 0.5, yRatio: 0.73 },
          { xRatio: 0.3, yRatio: 0.73 }
        ]
      }
    ]

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
    this.selectIndex = event.currentTarget.className.split(':')[1]
  }

  setRowIndex({ row, rowIndex }: any) {
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
          status: 1
        }
        this.areaList.push(area)
      } else {
        this.areaList[this.selectIndex].name = this.areaForm.name
      }

      this.dialogVisible = false
    })
  }

  handleEdit(item: object) {
    this.dialogType = 'edit'
    this.areaForm = { ...item }
    this.dialogVisible = true
  }

  handleDelete() {
    this.$confirm('确认要删除吗？删除后将不可恢复?', '提示', {
      type: 'warning',
      center: true
    })
      .then(async () => {
        this.areaList.splice(this.selectIndex, 1)
        this.$message.success('删除成功!')
      })
      .catch(err => console.log(err))
    console.log(this.areaList)
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
  display: flex;

  .drag-canvas {
    flex: 1;
  }

  .area-list {
    width: 400px;

    .add-btn {
      float: right;
      margin-bottom: 20px;
    }

    /deep/.el-table thead tr th {
      background: #eff8ff;
      color: #666;
    }
  }
}
</style>