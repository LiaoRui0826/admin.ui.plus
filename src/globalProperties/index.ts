import modal from './modal'
import mitt from 'mitt'

export default function installGlobalProperties(app: any) {
  app.config.globalProperties.eventBus = mitt()

  // 模态框对象
  app.config.globalProperties.$modal = modal
}
