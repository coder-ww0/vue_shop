import Vue from 'vue'
import { Button } from 'element-ui'
import { Form, FormItem } from 'element-ui'
import { Input } from 'element-ui'
// 引入弹框提示组件
import { Message } from 'element-ui';
import { Container, Aside, Main, Header } from 'element-ui'
import { Menu, MenuItem, Submenu, MenuItemGroup } from 'element-ui'
import { Breadcrumb,BreadcrumbItem } from 'element-ui'
import { Card, Row, Col, Table, TableColumn, Switch, Tooltip, Pagination, Dialog } from 'element-ui'
import { MessageBox } from 'element-ui';

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Header)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Submenu)
Vue.use(MenuItemGroup)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Col)
Vue.use(Row)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)

Vue.component(Message)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm