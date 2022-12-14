<template>
  <div style="padding: 0px 0px 8px 8px">
    <el-row :gutter="8" style="width: 100%">
      <el-col :span="24" :xs="24">
        <el-card shadow="never" :body-style="{ paddingBottom: '0' }" style="margin-top: 8px">
          <el-form :inline="true">
            <el-form-item label="创建时间">
              <my-date-range ref="crmUserDateRangeRef"></my-date-range>
            </el-form-item>
            <el-form-item label="查询内容">
              <el-input v-model="state.filterModel.filterStr" placeholder="客户名称，手机号码"></el-input>
            </el-form-item>
            <el-form-item label="客户所有人">
              <el-select v-model="state.filterModel.belongUserId" :clearable="true">
                <el-option v-for="item in state.belongUserList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="ele-Search" @click="onQuery"> 查询 </el-button>
              <el-button type="primary" icon="ele-Plus" @click="onAdd"> 新增 </el-button>
              <el-button type="primary" icon="ele-Setting" @click="onBatchSetBelongUser"> 批量分配 </el-button>
              <el-button type="primary" icon="ele-Setting" @click="onBatchSetTenant"> 批量转移 </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" style="margin-top: 8px">
          <el-table :data="state.listData" style="width: 100%" v-loading="state.loading" row-key="id" ref="multipleTableRef">
            <el-table-column type="selection" width="50" />
            <el-table-column label="客户名称" prop="userName" min-width="120" show-overflow-tooltip />
            <el-table-column label="手机号码" prop="mobile" min-width="120" show-overflow-tooltip />
            <el-table-column label="邮箱" prop="email" min-width="120" show-overflow-tooltip />
            <el-table-column label="客户所有人" prop="belongUserName" min-width="120" show-overflow-tooltip />
            <el-table-column label="创建时间" prop="createdTime" min-width="120" show-overflow-tooltip />
            <el-table-column label="操作" width="160" fixed="right" header-align="center" align="center">
              <template #default="{ row }">
                <my-dropdown-more>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="onEdit(row)">编辑</el-dropdown-item>
                      <el-dropdown-item @click="onSetBelongUser(row)">分配</el-dropdown-item>
                      <el-dropdown-item @click="onSetTenant(row)">转移</el-dropdown-item>
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

    <crm-user-form ref="crmUserFormRef" :title="state.crmUserFormTitle"></crm-user-form>
    <set-belong-user ref="setBelongUserRef" v-model="state.currentBelongUserId" :title="state.setBelongUserTitle"></set-belong-user>
    <set-belong-tenant ref="setBelongTenantRef" :title="state.setBelongTenantTitle"></set-belong-tenant>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, onUnmounted, reactive, ref } from 'vue'
import CrmUserForm from './components/crm-user-form.vue'
import MyDateRange from '/@/components/my-date-range/index.vue'
import { Crm as CrmApi } from '/@/api/customer/Crm'
import { PageInputCrmMemberSearchDto, CrmMemberInfoDto, CrmMemberSearchDto, FilterBelongUserDto } from '/@/api/customer/data-contracts'
import MyDropdownMore from '/@/components/my-dropdown-more/index.vue'
import SetBelongUser from './components/set-belong-user.vue'
import SetBelongTenant from './components/set-belong-tenant.vue'

const { proxy } = getCurrentInstance() as any

const crmUserFormRef = ref()

const crmUserDateRangeRef = ref()

const multipleTableRef = ref()

const setBelongUserRef = ref()

const setBelongTenantRef = ref()

const state = reactive({
  loading: false,
  crmUserFormTitle: '',
  setBelongUserTitle: '',
  setBelongTenantTitle: '',
  total: 0,
  pageSize: [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next',
  belongUserList: [] as FilterBelongUserDto[],
  currentBelongUserId: null,
  filterModel: {
    filterStr: '',
    belongUserId: null,
  },
  pageInput: {
    currentPage: 1,
    pageSize: 10,
    filter: {
      startDate: '',
      endDate: '',
      filterStr: '',
      belongUserId: null,
    } as CrmMemberSearchDto,
  } as PageInputCrmMemberSearchDto,
  listData: [] as CrmMemberInfoDto[],
})

onMounted(() => {
  onQuery()
  onGetFilterBelongUserList()
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
    state.pageInput.filter.startDate = crmUserDateRangeRef.value.dateRange[0]
    state.pageInput.filter.endDate = crmUserDateRangeRef.value.dateRange[1]
    state.pageInput.filter.filterStr = state.filterModel.filterStr
    state.pageInput.filter.belongUserId = state.filterModel.belongUserId
  }

  const res = await new CrmApi().getList(state.pageInput)

  state.listData = res?.data?.list ?? []
  state.total = res?.data?.total ?? 0

  state.loading = false
}

const onGetFilterBelongUserList = async () => {
  const res = await new CrmApi().getFilterBelongUserList()

  state.belongUserList = res?.data ?? []
}

const onAdd = () => {
  state.crmUserFormTitle = '新增'
  crmUserFormRef.value.open()
}

const onBatchSetBelongUser = () => {
  const selectRows = multipleTableRef.value!.getSelectionRows() as CrmMemberInfoDto[]

  if ((selectRows.length as number) > 0) {
    state.setBelongUserTitle = '批量分配'

    const memberIds = selectRows?.map((i) => i.id)

    setBelongUserRef.value.open(memberIds)
  } else {
    proxy.$modal.msgWarning('请先勾选客户')
  }
}

const onBatchSetTenant = () => {
  const selectRows = multipleTableRef.value!.getSelectionRows() as CrmMemberInfoDto[]

  if ((selectRows.length as number) > 0) {
    state.setBelongTenantTitle = '批量转移'

    const memberIds = selectRows?.map((i) => i.id)

    setBelongTenantRef.value.open(memberIds)
  } else {
    proxy.$modal.msgWarning('请先勾选客户')
  }
}

const onSetBelongUser = (row: CrmMemberInfoDto) => {
  state.setBelongUserTitle = '分配'

  const memberIds = []
  memberIds.push(row.id)

  setBelongUserRef.value.open(memberIds)
}

const onSetTenant = (row: CrmMemberInfoDto) => {
  state.setBelongTenantTitle = '转移'

  const memberIds = []
  memberIds.push(row.id)

  setBelongTenantRef.value.open(memberIds)
}

const onEdit = (row: CrmMemberInfoDto) => {
  state.crmUserFormTitle = '编辑'
  crmUserFormRef.value.open(row)
}

const onDelete = (row: CrmMemberInfoDto) => {
  proxy.$modal
    .confirmDelete(`确定要删除?`)
    .then(async () => {
      await new CrmApi().softDelete({ id: row.id }, { loading: true })
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
  name: 'admin/crmuser',
})
</script>

<style lang="scss" scoped></style>
