import { verifyEmail } from '/@/utils/toolsValidate'
/**
 * 手机号
 */
export function mobile(value: string) {
  return /^1([3589]\d|4[5-9]|6[1-2,4-7]|7[0-8])\d{8}$/.test(value)
}

/**
 * 手机号验证器
 */
export const testMobile = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
  }
  if (!mobile(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    callback()
  }
}

/**
 * 邮箱验证器
 */
export const testEmail = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
  }
  if (!verifyEmail(value)) {
    callback(new Error('请输入正确的邮箱'))
  } else {
    callback()
  }
}

/**
 * 外链
 */
export function externalLink(path: string) {
  return /^(http?:|https?:|mailto:|tel:)/.test(path)
}
