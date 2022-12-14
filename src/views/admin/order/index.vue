<template>
  <div style="padding: 0px 0px 8px 8px">
    <el-row :gutter="8" style="width: 100%">
      <el-col :span="24" :xs="24">
        <el-card shadow="never" :body-style="{ paddingBottom: '0' }" style="margin-top: 8px">
          <el-form :inline="true">
            <el-form-item label="创建时间">
              <my-date-range ref="orderDateRangeRef"></my-date-range>
            </el-form-item>
            <el-form-item label="订单号">
              <el-input v-model="state.filterModel.sn" placeholder="订单号"></el-input>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="state.filterModel.status" :clearable="true">
                <el-option v-for="item in state.statusList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="ele-Search" @click="onQuery"> 查询 </el-button>
              <el-button type="primary" icon="ele-Plus" @click="onAdd"> 新增 </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" style="margin-top: 8px">
          <el-table :data="state.listData" style="width: 100%" v-loading="state.loading" row-key="id">
            <el-table-column label="订单名称" prop="name" min-width="120" align="center"></el-table-column>
            <el-table-column label="订单号" prop="sn" min-width="120" align="center"></el-table-column>
            <el-table-column label="创建人" prop="createdUserName" min-width="120" align="center"></el-table-column>
            <el-table-column label="创建时间" prop="createdTime" min-width="120" align="center"></el-table-column>
            <el-table-column prop="" label="" min-width="120" show-overflow-tooltip />
            <el-table-column label="操作" width="160" fixed="right" header-align="center" align="center">
              <template #default="{ row }">
                <el-button icon="ele-EditPen" size="small" text type="primary" @click="onEdit(row)">编辑</el-button>
                <el-button icon="ele-Delete" size="small" text type="danger" @click="onDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="my-flex my-flex-end" style="margin-top: 20px">
            <el-pagination
              v-model:currentPage="state.pageInput.currentPage"
              v-model:page-size="state.pageInput.pageSize"
              :total="state.total"
              :page-sizes="[10, 20, 50, 100]"
              small
              background
              @size-change="onSizeChange"
              @current-change="onCurrentChange"
              layout="total, sizes, prev, pager, next, jumper"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <order-form ref="orderFormRef" :title="state.orderFormTitle"></order-form>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, onUnmounted, reactive, ref } from 'vue'
import OrderForm from './components/order-form.vue'
import MyDateRange from '/@/components/my-date-range/index.vue'

const { proxy } = getCurrentInstance() as any

const orderFormRef = ref()

const orderDateRangeRef = ref()

const state = reactive({
  loading: false,
  orderFormTitle: '',
  statusList: [
    {
      id: 5,
      name: '待付款',
    },
    {
      id: 10,
      name: '已付款',
    },
    {
      id: 15,
      name: '待生产',
    },
    {
      id: 20,
      name: '生产中',
    },
  ],
  filterModel: {
    sn: '',
    status: null,
  },
  total: 0,
  pageInput: {
    currentPage: 1,
    pageSize: 10,
    filter: {
      startDate: '',
      endDate: '',
      sn: '',
    },
  },
  listData: [],
})

onMounted(() => {
  onQuery()
  proxy.eventBus.on('refresh', async () => {
    onQuery()
  })
})

onUnmounted(() => {
  proxy.eventBus.off('refresh')
})

const onQuery = async () => {
  state.loading = true

  if (state.pageInput.filter) {
    state.pageInput.filter.startDate = orderDateRangeRef.value.dateRange[0]
    state.pageInput.filter.endDate = orderDateRangeRef.value.dateRange[1]
    state.pageInput.filter.sn = state.filterModel.sn
  }

  const res = {} as any

  state.listData = res?.data?.list ?? []
  state.total = res?.data?.total ?? 0

  state.loading = false
}

const onAdd = () => {
  state.orderFormTitle = '新增'
  orderFormRef.value.open()
}

const onEdit = (row: any) => {
  state.orderFormTitle = '编辑'
  orderFormRef.value.open(row)
}

const onDelete = (row: any) => {
  proxy.$modal
    .confirmDelete(`确定要删除?`)
    .then(async () => {
      onQuery()
    })
    .catch(() => {})
}

const onSizeChange = (val: number) => {
  state.pageInput.pageSize = val
  onQuery()
}

const onCurrentChange = (val: number) => {
  state.pageInput.currentPage = val
  onQuery()
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'admin/order',
})
</script>

<style lang="scss" scoped></style>
