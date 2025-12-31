# 测试与维护

使用 Node.js 22 或更新版本，无第三方依赖。npm test 使用 node --test，自动发现现有 core.test.js 和新增 tests/*.test.js；npm run check 检查产品脚本语法。

~~~powershell
npm test
npm run check
node --test tests/current-streak-boundaries.test.js
node --test tests/backup-contracts.test.js
node --test --experimental-test-coverage
~~~

测试分为日期和时区、计划与记录约束、不可变操作、区间统计与连续记录、备份大小与格式。每个文件针对完整的行为主题，新增回归用例应说明修复的问题和可观察结果。

fixtures.mjs 生成确定的普通记录，freeze 辅助函数递归冻结输入以检测意外修改。除测试 todayKey 外，测试显式传入固定日期，不依赖当前时间。时区测试使用独立 Node 子进程与 TZ 环境变量，不修改测试进程或系统时区。

日期偏移和每周计划测试使用有界枚举验证可逆性与所有非空星期集合。备份测试构造真实合法 JSON，并按 UTF-8 字节验证精确上限，不能用仅检测坏 JSON 的断言替代。

领域测试不覆盖浏览器存储配额、导入确认对话框、下载、点击与布局。界面改动后还应手动验证创建、补记、撤销、导出/导入以及窄屏日历。纯文档修改无需添加镜像实现的测试。
