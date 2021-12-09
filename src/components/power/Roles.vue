<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-row>
            <el-col>
                <el-button type="primary">添加用户</el-button>
            </el-col>
        </el-row>
        <!-- 角色区域列表 -->
        <el-table :data="roleList" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-row :class="['bdbottom',index1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, index1) in scope.row.children" :key="item1.id">
                        <!-- 渲染一级权限 -->
                        <el-col :span="5">
                            <el-tag  closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <!-- 渲染二级权限和三级权限 -->
                        <el-col :span="19">
                            <!-- 嵌套渲染二级权限 -->
                            <el-row v-for="(item2, index2) in item1.children" :key="item2.id"
                            :class="[index2 !== 0 ? 'bdtop' : '', 'vcenter']">
                                <el-col :span="6">
                                    <el-tag type="success"
                                     closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <el-col :span="18">
                                    <el-tag v-for="(item3, index3) in item2.children" :key="item3.id"
                                    :class="index3 !== 0 ? 'bdtop' : ''"
                                    type="warning" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                    <el-button type="warning" icon="el-icon-setting" size="mini" 
                    @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
    <!-- 展示分配权限的对话框 -->
    <el-dialog
    title="分配权限"
    :visible.sync="setRightDialogVisible"
    width="50%"
    @close="setRightDialogClosed">
        <!-- 树形控件 -->
        <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id"
        :default-expand-all="true" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRightDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
        // 所有角色列表
        roleList:[],
        // 设置权限分配的对话框的显示与隐藏
        setRightDialogVisible: false,
        // 所有的权限列表
        rightsList:[],
        treeProps:{
            children: 'children',
            label: 'authName'
        },
        // 默认被选中的选组
        defKeys:[],
        // 即将分配权限的角色id
        roleId:''
    }
  },
  created() {
      this.getRoleList();
  },
  methods: {
      async getRoleList() {
        const { data : res } = await this.$http.get('roles');
        if (res.meta.status !== 200) {
            return this.$message.error("获取角色列表失败");
        }
        this.roleList = res.data;
        console.log(this.roleList);
      },
      // 根据id移除对应的权限
      async removeRightById(role, rightId) {
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if (confirmResult !== 'confirm') {
            return this.$message.info('取消了删除');
        }
        const { data : res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
        if (res.meta.status !== 200) {
            return this.$message.error('删除权限失败');
        }
        this.$message.success('删除权限成功');
        // 会导致页面发生重新刷新
        // this.getRoleList();
        role.children = res.data;
      },
      // 分配权限的相关功能
      async showSetRightDialog(role) {
          this.roleId = role.id;
          const { data : res } = await this.$http.get('rights/tree');
          if (res.meta.status !== 200) {
              return this.$message.error('获取权限列表失败');
          }
          this.rightsList = res.data;
          console.log(this.rightsList);
          this.getLeafKeys(role, this.defKeys);
          console.log(this.defKeys);
          this.setRightDialogVisible = true;
      },
      // 通过递归的形式,获取角色下所有三级权限的id,并保存到refKeys数组中
      getLeafKeys(node, arr) {
          if (!node.children) {
              return arr.push(node.id);
          }
          node.children.forEach(element => {
              this.getLeafKeys(element, arr);
          });
      },
      setRightDialogClosed() {
        // 将数组中的元素进行清空
        this.defKeys = [];
      },
      // 分配对应的权限
      async allotRights() {
          let keys = [
              ...this.$refs.treeRef.getCheckedKeys(),
              ...this.$refs.treeRef.getHalfCheckedKeys()
          ];
          console.log(keys);
          let keyStr = keys.join(',');
          
        this.setRightDialogVisible = false;
        const { data : res } = await this.$http.post(`roles/${this.roleId}/rights`, {rids:keyStr});
        if (res.meta.status !== 200) {
            return this.$message.error("分配角色权限失败");
        }
        this.$message.success("分配角色权限成功");
        // 重新请求页面
        this.getRoleList();
      }
  }
}
</script>

<style scoped lang="less">
.el-tag {
    margin: 7px;
}

.bdtop {
    border-top: 1px solid #eee;
}

.bdbottom {
    border-bottom: 1px solid #eee;
}

// 保持元素竖直居中
.vcenter {
    display: flex;
    align-items:center;
}
</style>
