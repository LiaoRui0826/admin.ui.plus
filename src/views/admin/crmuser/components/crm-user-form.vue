<template>
  <div>
    <el-dialog v-model="state.showDialog" destroy-on-close :title="title" :close-on-click-modal="false" draggable width="600px">
      <el-form :model="form" ref="formRef" size="default" label-width="80px">
        <el-row :gutter="35">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <el-form-item
              label="手机号"
              prop="mobile"
              :rules="[
                { required: true, message: '请输入手机号', trigger: ['blur', 'change'] },
                { validator: testMobile, trigger: ['blur', 'change'] },
              ]"
            >
              <el-input v-model="form.mobile" clearable />
            </el-form-item>
            <el-form-item label="邮箱" prop="email" :rules="[{ validator: testEmail, trigger: ['blur', 'change'] }]">
              <el-input v-model="form.email" clearable />
            </el-form-item>
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
import { testMobile, testEmail } from '/@/utils/test'
import { Crm as CrmApi } from '/@/api/customer/Crm'
import { CrmMemberDetailInfoDto, CrmMemberUpdateDto } from '/@/api/customer/data-contracts'

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
  form: {} as CrmMemberUpdateDto & CrmMemberDetailInfoDto,
})

const { form } = toRefs(state)

// 打开对话框
const open = async (row: any = {}) => {
  proxy.$modal.loading()

  if (row.id > 0) {
    const res = await new CrmApi().get({ id: row.id }, { loading: true }).catch(() => {
      proxy.$modal.closeLoading()
    })

    if (res?.success) {
      state.form = res.data as CrmMemberUpdateDto & CrmMemberDetailInfoDto
    }
  } else {
    state.form = {} as CrmMemberUpdateDto & CrmMemberDetailInfoDto
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
      res = await new CrmApi().update(state.form, { showSuccessMessage: true }).catch(() => {
        state.sureLoading = false
      })
    } else {
      res = await new CrmApi().add(state.form, { showSuccessMessage: true }).catch(() => {
        state.sureLoading = false
      })
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
  name: 'admin/crmuser/form',
})
</script>

<style lang="scss" scoped></style>
