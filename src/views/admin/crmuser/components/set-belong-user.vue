<template>
  <div>
    <el-dialog v-model="state.showDialog" destroy-on-close :title="title" :close-on-click-modal="false" draggable width="600px">
      <el-row>
        <el-form :inline="true">
          <el-button type="primary" icon="ele-Setting" @click="onClearSet">清除已选 </el-button>
        </el-form>
      </el-row>
      <el-row :gutter="35">
        <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
          <el-table
            :data="state.userList"
            style="width: 100%"
            v-loading="state.loading"
            row-key="id"
            ref="singleTableRef"
            highlight-current-row
            @current-change="onSetChange"
          >
            <el-table-column label="姓名" prop="name" min-width="120" show-overflow-tooltip />
            <el-table-column label="手机号" prop="email" min-width="120" show-overflow-tooltip />
            <el-table-column label="邮箱" prop="mobile" min-width="120" show-overflow-tooltip />
            <el-table-column label="状态" prop="status" min-width="120" show-overflow-tooltip />
          </el-table>
          <div class="my-flex my-flex-end view-info-page" style="margin-top: 20px">
            <el-pagination
              v-model:currentPage="state.pageInput.CurrentPage"
              v-model:page-size="state.pageInput.PageSize"
              :total="state.total"
              :page-sizes="state.pageSize"
              :layout="state.layout"
              @size-change="onSizeChange"
              @current-change="onCurrentChange"
            ></el-pagination>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onCancel" size="default">取 消</el-button>
          <el-button type="primary" @click="onSure" size="default" :loading="state.sureLoading">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, ref, reactive } from 'vue'
import { Crm as CrmApi } from '/@/api/customer/Crm'
import { BelongUserDto } from '/@/api/customer/data-contracts'

defineProps({
  title: {
    type: String,
    default: '',
  },
})

const { proxy } = getCurrentInstance() as any

const singleTableRef = ref()

const currentRow = ref()

const state = reactive({
  loading: false,
  showDialog: false,
  sureLoading: false,
  total: 0,
  pageSize: [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next',
  pageInput: {
    CurrentPage: 1,
    PageSize: 10,
  },
  userList: [] as BelongUserDto[],
  memberIds: [] as number[],
})

// 打开对话框
const open = async (memberIds: number[]) => {
  proxy.$modal.loading()

  state.memberIds = memberIds

  currentRow.value = null

  onQuery()

  proxy.$modal.closeLoading()
  state.showDialog = true
}

// 取消
const onCancel = () => {
  state.showDialog = false
}

// 确定
const onSure = () => {
  if (currentRow.value) {
    onUpdate(currentRow.value!.id)
  } else {
    proxy.$modal
      .confirm('未选中任何所有者，确定继续？')
      .then(() => {
        onUpdate(null)
      })
      .catch(() => {})
  }
}

const onQuery = async () => {
  state.loading = true

  const res = await new CrmApi().getBelongUserList(state.pageInput, { loading: true }).catch(() => {
    proxy.$modal.closeLoading()
  })

  state.userList = res?.data?.list ?? []
  state.total = res?.data?.total ?? 0

  state.loading = false
}

const onUpdate = async (id: number | null) => {
  let res = {} as any

  res = await new CrmApi().setBelongUser({ ids: state.memberIds, newBelongUserId: id }, { showSuccessMessage: true }).catch(() => {
    state.sureLoading = false
  })

  state.sureLoading = false

  if (res?.success) {
    proxy.eventBus.emit('refresh')
    state.showDialog = false
  }
}

const onSizeChange = (val: number) => {
  state.pageInput.PageSize = val
  onQuery()
}

const onCurrentChange = (val: number) => {
  state.pageInput.CurrentPage = val
  onQuery()
}

const onSetChange = (user: BelongUserDto) => {
  currentRow.value = user
}

const onClearSet = () => {
  singleTableRef.value!.setCurrentRow(null)
}

defineExpose({
  open,
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'admin/crmuser/components/set-belong-user',
})
</script>

<style lang="scss" scoped></style>
