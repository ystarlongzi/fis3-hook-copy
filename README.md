fis3-hook-copy
==============

一款基于 fis3 的拷贝文件或目录的插件。


### 安装
```
npm install fis3-hook-copy
```


### 用法
```
-- components
-- node_modules
-- page
-- locals
  -- en
  -- cn
-- mock
  -- api
    -- user.js
-- fis-conf.js
```

假设开发环境下的目录结构如上，其中 `/locals` 仅是用来存放国际化配置相关的文件，`/mock` 目录用来存放开发时的模拟数据。

再假如我们在 `fis-conf.js` 里并没有将 `/locals` 和 `/mock` 目录配置到 `project.files` 属性下，那么在 fis3 编译后，将不会产出这两个目录。

这时就可以利用本插件将 `/locals` 和 `/mock` 目录拷贝到产出目录。同时如果在拷贝后的 `/mock` 目录下再创建一个软连接 `/mock/node_modules` 链接到开发环境下的 `/node_modules` 目录，就可以解决在 `/mock/api/user.js` 模拟数据时，无法 require 到局部环境下安装的 npm 包的问题。

配置如下：

```
// 为了提高编译速度，我们配置如下的过滤器，并且我们也没有添加 `/locals` 和 `/mock`
fis.set('project.files', ['*.html', 'server.conf']);

fis.hook('copy', {
  tasks: [
    // 拷贝 `/locals` 目录至产出目录
    {
      from: '/locals',
      to: 'DEST_PATH',
    },

    // 拷贝 `/mock` 目录至产出目录
    {
      from: '/mock',
      to: 'DEST_PATH',
    },

    // 在产出目录下，创建一个软连接 `/mock/node_modules`
    {
      from: '/node_modules',
      to: 'DEST_PATH/mock/node_modules',
      symlink: true,
    }
  ],
});
```


### 参数说明
#### 拷贝单个目录或文件
- `from` **{String}**: 需要拷贝的文件或目录。
- `to` **{String}**: 拷贝到目标目录的位置。占位符 `DEST_PATH` 表示 fis3 默认产出的位置，你可以通过 `fis3 release` 的 `-d` 参数设置。
- `symlink` **{Bool}**: 是否需要创建软连接。

#### 拷贝多个目录或文件
- `tasks` **{Array}**: 当需要拷贝多个目录时，需要将 `from`、`to`、`symlink` 参数配置到该参数下。
