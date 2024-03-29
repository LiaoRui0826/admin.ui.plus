<template>
  <div style="padding: 0px 0px 8px 8px">
    <el-row :gutter="8" style="width: 100%">
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card shadow="never" :body-style="{ paddingBottom: '0' }" style="margin-top: 8px">
          <el-form :model="state.filterModel" :inline="true">
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="state.filterModel.name" placeholder="角色名称" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="ele-Search" @click="onQuery"> 查询 </el-button>
              <el-dropdown style="margin-left: 12px">
                <el-button type="primary"
                  >新增<el-icon class="el-icon--right"><ele-ArrowDown /></el-icon
                ></el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="onAdd(1)">新增分组</el-dropdown-item>
                    <el-dropdown-item @click="onAdd(2)">新增角色</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" style="margin-top: 8px">
          <el-table
            ref="roleTableRef"
            v-loading="state.loading"
            :data="state.roleTreeData"
            row-key="id"
            default-expand-all
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            highlight-current-row
            style="width: 100%"
            @current-change="onCurrentChange"
          >
            <el-table-column prop="name" label="角色名称" min-width="120" show-overflow-tooltip />
            <el-table-column prop="sort" label="排序" width="80" align="center" show-overflow-tooltip />
            <el-table-column label="操作" width="100" fixed="right" header-align="center" align="right">
              <template #default="{ row }">
                <el-button v-if="row.type === 1" icon="ele-Plus" size="small" text type="primary" @click="onAdd(2, row)"></el-button>
                <my-dropdown-more icon-only>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-if="row.type === 2" @click="onSetRoleMenu(row)">菜单权限</el-dropdown-item>
                      <el-dropdown-item v-if="row.type === 2" @click="onSetRoleDataScope(row)">数据权限</el-dropdown-item>
                      <el-dropdown-item @click="onEdit(row)">编辑{{ row.type === 1 ? '分组' : '角色' }}</el-dropdown-item>
                      <el-dropdown-item @click="onDelete(row)">删除{{ row.type === 1 ? '分组' : '角色' }}</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </my-dropdown-more>
                <!-- <el-button icon="ele-EditPen" size="small" text type="primary" @click="onEdit(row)">编辑</el-button>
                <el-button icon="ele-Delete" size="small" text type="danger" @click="onDelete(row)">删除</el-button> -->
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card shadow="never" :body-style="{ paddingBottom: '0' }" style="margin-top: 8px">
          <el-form :model="state.filterModel" :inline="true">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="state.filterModel.name" placeholder="姓名" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="ele-Search" @click="onGetRoleUserList"> 查询 </el-button>
              <el-button type="primary" icon="ele-Plus" @click="onAddUser"> 添加员工 </el-button>
              <el-button type="danger" icon="ele-Delete" @click="onRemoveUser"> 移除员工 </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" style="margin-top: 8px">
          <el-table
            ref="userTableRef"
            v-loading="state.userListLoading"
            :data="state.userListData"
            row-key="id"
            style="width: 100%"
            @row-click="onUserRowClick"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="姓名" show-overflow-tooltip />
            <!-- <el-table-column prop="mobile" label="手机号" width="120" show-overflow-tooltip />
            <el-table-column prop="email" label="邮箱" min-width="120" show-overflow-tooltip /> -->
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <role-form ref="roleFormRef" :title="state.roleFormTitle" :role-tree-data="state.roleFormTreeData"></role-form>
    <user-select ref="userSelectRef" title="添加员工" multiple :sure-loading="state.sureLoading" @sure="onSureUser"></user-select>
    <set-role-menu ref="setRoleMenuRef"></set-role-menu>
    <set-role-data-scope ref="setRoleDataScopeRef"></set-role-data-scope>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, getCurrentInstance, onUnmounted, nextTick, defineAsyncComponent } from 'vue'
import { RoleGetListOutput, UserGetRoleUserListOutput, UserGetPageOutput, RoleAddRoleUserListInput, RoleType } from '/@/api/admin/data-contracts'
import { Role as RoleApi } from '/@/api/admin/Role'
import { listToTree } from '/@/utils/tree'
import { ElTable } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import eventBus from '/@/utils/mitt'

// 引入组件
const RoleForm = defineAsyncComponent(() => import('./components/role-form.vue'))
const SetRoleMenu = defineAsyncComponent(() => import('./components/set-role-menu.vue'))
const SetRoleDataScope = defineAsyncComponent(() => import('./components/set-role-data-scope.vue'))
const UserSelect = defineAsyncComponent(() => import('/@/views/admin/user/components/user-select.vue'))
const MyDropdownMore = defineAsyncComponent(() => import('/@/components/my-dropdown-more/index.vue'))

const { proxy } = getCurrentInstance() as any

const roleTableRef = ref()
const roleFormRef = ref()
const userTableRef = ref<InstanceType<typeof ElTable>>()
const userSelectRef = ref()
const setRoleMenuRef = ref()
const setRoleDataScopeRef = ref()

const state = reactive({
  loading: false,
  userListLoading: false,
  sureLoading: false,
  roleFormTitle: '',
  filterModel: {
    name: '',
  },
  roleTreeData: [] as any,
  roleFormTreeData: [] as any,
  userListData: [] as UserGetRoleUserListOutput[],
  roleId: undefined as number | undefined,
})

onMounted(() => {
  onQuery()
  eventBus.on('refreshRole', async () => {
    onQuery()
  })
})

onUnmounted(() => {
  eventBus.off('refreshRole')
})

const onQuery = async () => {
  state.loading = true
  const res = await new RoleApi().getList()
  if (res.data && res.data.length > 0) {
    state.roleTreeData = listToTree(cloneDeep(res.data))
    state.roleFormTreeData = listToTree(cloneDeep(res.data).filter((a) => a.parentId === 0))
    if (state.roleTreeData[0].children?.length > 0) {
      nextTick(() => {
        roleTableRef.value!.setCurrentRow(state.roleTreeData[0].children[0])
      })
    }
  } else {
    state.roleTreeData = []
    state.roleFormTreeData = []
  }

  state.loading = false
}

const onAdd = (type: RoleType, row: RoleGetListOutput | undefined = undefined) => {
  switch (type) {
    case 1:
      state.roleFormTitle = '新增分组'
      roleFormRef.value.open({ type: 1 })
      break
    case 2:
      state.roleFormTitle = '新增角色'
      roleFormRef.value.open({ type: 2, parentId: row?.id })
      break
  }
}

const onEdit = (row: RoleGetListOutput) => {
  switch (row.type) {
    case 1:
      state.roleFormTitle = '编辑分组'
      break
    case 2:
      state.roleFormTitle = '编辑角色'
      break
  }
  roleFormRef.value.open(row)
}

const onDelete = (row: RoleGetListOutput) => {
  proxy.$modal
    .confirmDelete(`确定要删除角色【${row.name}】?`)
    .then(async () => {
      await new RoleApi().delete({ id: row.id }, { loading: true })
      onQuery()
    })
    .catch(() => {})
}

const onGetRoleUserList = async () => {
  state.userListLoading = true
  const res = await new RoleApi().getRoleUserList({ RoleId: state.roleId })
  state.userListLoading = false
  if (res?.success) {
    if (res.data && res.data.length > 0) {
      state.userListData = res.data
    } else {
      state.userListData = []
    }
  }
}

const onCurrentChange = (currentRow: RoleGetListOutput, oldCurrentRow: RoleGetListOutput) => {
  if (!currentRow) {
    return
  }

  if (currentRow?.id !== oldCurrentRow?.id && (oldCurrentRow?.id as number) > 0) {
    if ((currentRow?.parentId as number) === 0) {
      roleTableRef.value!.setCurrentRow(oldCurrentRow)
    }
  } else {
    if ((currentRow?.parentId as number) === 0) {
      roleTableRef.value!.setCurrentRow()
    }
  }

  if ((currentRow?.parentId as number) !== 0 && (oldCurrentRow?.parentId as number) !== 0 && (currentRow?.id as number) > 0) {
    state.roleId = currentRow.id
    onGetRoleUserList()
  }
}

const onUserRowClick = (row: UserGetRoleUserListOutput) => {
  // TODO: improvement typing when refactor table
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  userTableRef.value!.toggleRowSelection(row, undefined)
}

const onAddUser = () => {
  if (!((state.roleId as number) > 0)) {
    proxy.$modal.msgWarning('请选择角色')
    return
  }
  userSelectRef.value.open({ roleId: state.roleId })
}

const onRemoveUser = () => {
  if (!((state.roleId as number) > 0)) {
    proxy.$modal.msgWarning('请选择角色')
    return
  }

  const selectionRows = userTableRef.value!.getSelectionRows() as UserGetPageOutput[]

  if (!((selectionRows.length as number) > 0)) {
    proxy.$modal.msgWarning('请选择员工')
    return
  }

  proxy.$modal
    .confirm(`确定要移除吗?`)
    .then(async () => {
      const userIds = selectionRows?.map((a) => a.id)
      const input = { roleId: state.roleId, userIds } as RoleAddRoleUserListInput
      await new RoleApi().removeRoleUser(input, { loading: true })
      onGetRoleUserList()
    })
    .catch(() => {})
}

const onSureUser = async (users: UserGetPageOutput[]) => {
  if (!(users?.length > 0)) {
    userSelectRef.value.close()
    return
  }

  state.sureLoading = true
  const userIds = users?.map((a) => a.id)
  const input = { roleId: state.roleId, userIds } as RoleAddRoleUserListInput
  await new RoleApi().addRoleUser(input, { showSuccessMessage: true })
  state.sureLoading = false
  userSelectRef.value.close()
  onGetRoleUserList()
}

const onSetRoleMenu = (role: RoleGetListOutput) => {
  if (!((role?.id as number) > 0)) {
    proxy.$modal.msgWarning('请选择角色')
    return
  }
  setRoleMenuRef.value.open(role)
}

const onSetRoleDataScope = (role: RoleGetListOutput) => {
  if (!((role?.id as number) > 0)) {
    proxy.$modal.msgWarning('请选择角色')
    return
  }
  setRoleDataScopeRef.value.open(role)
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'admin/role',
})
</script>

<style scoped lang="scss"></style>
