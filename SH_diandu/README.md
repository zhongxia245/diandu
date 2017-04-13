## 一、项目介绍


## 二、添加模块

>2017-04-13 07:49:34
### 2.1 如何添加一个新的点读点类型（比如：3D观察器）
1. 在 `js/page/create/PointTypes/PointTypes.js` 的 POINTTYPES 变量添加一个新的点读类型数据
2. 在 `js/page/create/PointTypes/style.css` 中添加新点读类型的默认图标和选中图标
3. 在 `css/index.css`  添加 一个上传或者创建好内容的 样式（找 .uploaded-imgtext ，然后在后面添加一个新的样式名），样式是一样的
4. 在 `js/index.js` 添加对应的点击操作