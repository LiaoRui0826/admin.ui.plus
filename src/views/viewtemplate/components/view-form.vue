<template>
  <div>
    <el-dialog v-model="state.showDialog" destroy-on-close :title="title" :close-on-click-modal="false" draggable width="600px">
      <el-form :model="form" ref="formRef" size="default" label-width="80px">
        <el-row :gutter="35">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item label="" prop="" :rules="[]"> </el-form-item>
          </el-col>
        </el-row>
      </el-form>
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
import { getCurrentInstance, ref, reactive, toRefs } from 'vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
})

const { proxy } = getCurrentInstance() as any

const formRef = ref()

const state = reactive({
  showDialog: false,
  sureLoading: false,
  form: {} as any,
})

const { form } = toRefs(state)

// 打开对话框
const open = async (row: any = {}) => {
  proxy.$modal.loading()

  if (row.id > 0) {
    const res = {} as any

    if (res?.success) {
      state.form = res.data as any
    }
  } else {
    state.form = {} as any
  }

  proxy.$modal.closeLoading()
  state.showDialog = true
}

// 取消
const onCancel = () => {
  state.showDialog = false
}

// 确定
const onSure = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    state.sureLoading = true
    let res = {} as any

    if (state.form.id != undefined && state.form.id > 0) {
      res = {} as any
    } else {
      res = {} as any
    }

    state.sureLoading = false

    if (res?.success) {
      proxy.eventBus.emit('refresh')
      state.showDialog = false
    }
  })
}

defineExpose({
  open,
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: '',
})
</script>

<style lang="scss" scoped></style>
