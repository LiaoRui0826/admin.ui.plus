const { generateTemplates } = require('swagger-typescript-api')
const path = require('path')

//导出默认模板
generateTemplates({
  cleanOutput: false,
  output: path.resolve(__dirname, './templates'),
  httpClientType: 'axios',
  modular: true,
  silent: false,
  rewrite: false,
})
