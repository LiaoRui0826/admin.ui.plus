<template>
  <div style="padding: 0px 0px 8px 8px">
    <el-row :gutter="8" style="width: 100%">
      <el-col :span="24" :xs="24">
        <el-card shadow="never" :body-style="{ paddingBottom: '0' }" style="margin-top: 8px">
          <el-form :inline="true">
            <el-form-item>
              <el-button type="primary" icon="ele-Search" @click="onQuery"> 查询 </el-button>
              <el-button type="primary" icon="ele-Plus" @click="onAdd"> 新增 </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" style="margin-top: 8px">
          <el-table :data="state.listData" style="width: 100%" v-loading="state.loading" row-key="id">
            <el-table-column label="" prop="" min-width="120" show-overflow-tooltip />
            <el-table-column label="操作" width="160" fixed="right" header-align="center" align="center">
              <template #default="{ row }">
                <my-dropdown-more>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="onEdit(row)">编辑</el-dropdown-item>
                      <el-dropdown-item @click="onDelete(row)">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </my-dropdown-more>
              </template>
            </el-table-column>
          </el-table>
          <div class="my-flex my-flex-end view-info-page" style="margin-top: 20px">
            <el-pagination
              v-model:currentPage="state.pageInput.currentPage"
              v-model:page-size="state.pageInput.pageSize"
              :total="state.total"
              :page-sizes="state.pageSize"
              :layout="state.layout"
              @size-change="onSizeChange"
              @current-change="onCurrentChange"
            ></el-pagination>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <view-form ref="viewFormRef" :title="state.viewFormTitle"></view-form>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, onUnmounted, reactive, ref } from 'vue'
import ViewForm from './components/view-form.vue'
import MyDropdownMore from '/@/components/my-dropdown-more/index.vue'

const { proxy } = getCurrentInstance() as any

const viewFormRef = ref()

const state = reactive({
  loading: false,
  viewFormTitle: '',
  total: 0,
  pageSize: [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next',
  pageInput: {
    currentPage: 1,
    pageSize: 10,
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

  const res = {} as any

  state.listData = res?.data?.list ?? []
  state.total = res?.data?.total ?? 0

  state.loading = false
}

const onAdd = () => {
  state.viewFormTitle = '新增'
  viewFormRef.value.open()
}

const onEdit = (row: any) => {
  state.viewFormTitle = '编辑'
  viewFormRef.value.open(row)
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
  name: '',
})
</script>

<style lang="scss" scoped></style>
