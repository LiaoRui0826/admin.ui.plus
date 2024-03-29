<template>
  <div style="padding: 0px 0px 8px 8px">
    <el-row :gutter="8" style="width: 100%">
      <el-col :span="24" :xs="24">
        <el-card shadow="never" :body-style="{ paddingBottom: '0' }" style="margin-top: 8px">
          <el-form :model="state.filterModel" :inline="true">
            <el-form-item label="权限名称" prop="name">
              <el-input v-model="state.filterModel.name" placeholder="权限名称" />
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
                    <el-dropdown-item @click="onAdd(2)">新增菜单</el-dropdown-item>
                    <el-dropdown-item @click="onAdd(3)">新增权限点</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" style="margin-top: 8px">
          <el-table
            :data="state.permissionTreeData"
            style="width: 100%"
            v-loading="state.loading"
            row-key="id"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          >
            <el-table-column prop="label" label="权限名称" width="240" show-overflow-tooltip>
              <template #default="{ row }">
                <SvgIcon :name="row.icon" />
                {{ row.label }}
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="80" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.type === 1 ? '分组' : row.type === 2 ? '菜单' : row.type === 3 ? '权限点' : '' }}
              </template>
            </el-table-column>
            <el-table-column prop="path" label="权限地址" min-width="240" show-overflow-tooltip>
              <template #default="{ row }">
                <div v-if="row.type === 1 || row.type === 2">
                  {{ row.path ? '路由地址：' + row.path : '' }}
                  {{ row.viewPath ? '视图地址：' + row.viewPath : '' }}
                  {{ row.redirect ? '重定向地址：' + row.redirect : '' }}
                  {{ row.link ? '链接地址：' + row.link : '' }}
                </div>
                <div v-if="row.type === 3">接口地址：{{ row.apiPaths }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="80" align="center" show-overflow-tooltip />
            <el-table-column label="状态" width="80" align="center" show-overflow-tooltip>
              <template #default="{ row }">
                <el-tag type="success" v-if="row.enabled">启用</el-tag>
                <el-tag type="danger" v-else>禁用</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right" header-align="center" align="center">
              <template #default="{ row }">
                <el-button icon="ele-EditPen" size="small" text type="primary" @click="onEdit(row)">编辑</el-button>
                <el-button icon="ele-Delete" size="small" text type="danger" @click="onDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <permission-group-form
      ref="permissionGroupFormRef"
      :title="state.permissionFormTitle"
      :permission-tree-data="state.formPermissionGroupTreeData"
    ></permission-group-form>

    <permission-menu-form
      ref="permissionMenuFormRef"
      :title="state.permissionFormTitle"
      :permission-tree-data="state.formPermissionGroupTreeData"
    ></permission-menu-form>

    <permission-dot-form
      ref="permissionDotFormRef"
      :title="state.permissionFormTitle"
      :permission-tree-data="state.formPermissionMenuTreeData"
    ></permission-dot-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, getCurrentInstance, onUnmounted, defineAsyncComponent } from 'vue'
import { PermissionListOutput } from '/@/api/admin/data-contracts'
import { Permission as PermissionPermission } from '/@/api/admin/Permission'
import { listToTree } from '/@/utils/tree'
import { cloneDeep } from 'lodash-es'
import eventBus from '/@/utils/mitt'

// 引入组件
const PermissionGroupForm = defineAsyncComponent(() => import('./components/permission-group-form.vue'))
const PermissionMenuForm = defineAsyncComponent(() => import('./components/permission-menu-form.vue'))
const PermissionDotForm = defineAsyncComponent(() => import('./components/permission-dot-form.vue'))

const { proxy } = getCurrentInstance() as any

const permissionGroupFormRef = ref()
const permissionMenuFormRef = ref()
const permissionDotFormRef = ref()

const state = reactive({
  loading: false,
  permissionFormTitle: '',
  filterModel: {
    name: '',
  },
  permissionTreeData: [] as Array<PermissionListOutput>,
  formPermissionGroupTreeData: [] as Array<PermissionListOutput>,
  formPermissionMenuTreeData: [] as Array<PermissionListOutput>,
})

onMounted(() => {
  onQuery()
  eventBus.on('refreshPermission', async () => {
    onQuery()
  })
})

onUnmounted(() => {
  eventBus.off('refreshPermission')
})

const onQuery = async () => {
  state.loading = true
  const res = await new PermissionPermission().getList()
  if (res.data && res.data.length > 0) {
    state.permissionTreeData = listToTree(cloneDeep(res.data))
    state.formPermissionGroupTreeData = listToTree(cloneDeep(res.data).filter((a) => a.type === 1))
    state.formPermissionMenuTreeData = listToTree(cloneDeep(res.data).filter((a) => a.type === 1 || a.type === 2))
  } else {
    state.permissionTreeData = []
    state.formPermissionGroupTreeData = []
    state.formPermissionMenuTreeData = []
  }
  state.loading = false
}

const onAdd = (type: number) => {
  switch (type) {
    case 1:
      state.permissionFormTitle = '新增分组'
      permissionGroupFormRef.value.open()
      break
    case 2:
      state.permissionFormTitle = '新增菜单'
      permissionMenuFormRef.value.open()
      break
    case 3:
      state.permissionFormTitle = '新增权限点'
      permissionDotFormRef.value.open()
      break
  }
}

const onEdit = (row: PermissionListOutput) => {
  switch (row.type) {
    case 1:
      state.permissionFormTitle = '编辑分组'
      permissionGroupFormRef.value.open(row)
      break
    case 2:
      state.permissionFormTitle = '编辑菜单'
      permissionMenuFormRef.value.open(row)
      break
    case 3:
      state.permissionFormTitle = '编辑权限点'
      permissionDotFormRef.value.open(row)
      break
  }
}

const onDelete = (row: PermissionListOutput) => {
  proxy.$modal
    .confirmDelete(`确定要删除${row.type === 1 ? '分组' : row.type === 2 ? '菜单' : row.type === 3 ? '权限点' : ''}【${row.label}】?`)
    .then(async () => {
      await new PermissionPermission().delete({ id: row.id }, { loading: true })
      onQuery()
    })
    .catch(() => {})
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'admin/permission',
})
</script>

<style scoped lang="scss"></style>
