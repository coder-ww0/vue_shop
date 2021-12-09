<template>
  <div>
      <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入用户名" v-model="queryInfo.query"  clearable @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button> 
        </el-col>
      </el-row>
    </el-card>
    <!-- 用户列表区域 -->  
    <el-table :data="userList" border stripe>
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="username" label="用户名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
          </el-switch>
        </template>

      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
        <!-- 修改按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUserById(scope.row.id)">
          </el-button>
          <!-- 分配角色按钮 -->
          <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页相关 -->
     <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <!-- 添加用户框 -->
    <el-dialog
      title="提示"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    
    <!-- 修改用户信息的对话框 -->
    
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前用户: {{userInfo.username}}</p>
        <p>当前角色: {{userInfo.role_name}}</p>
        <p>请选择分配的新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
      this.getUserList();
  },
  data () {
    // 添加验证邮箱规则
    var checkEmail = (rule, value, callback) => {
      const regexEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      if (regexEmail.test(value)) {
        // 验证通过
        return callback();
      } else {
        callback(new Error("无效的邮箱"));
      }
      };
    // 验证手机号码的合法性
    var checkMobile = (rule, value, callback) => {
        const regexMobile = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;
        if (regexMobile.test(value)) {
          return callback();
        } else {
          callback(new Error("无效的手机号"));
        }
      };
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userList:[],
      total:0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制分配角色的对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 被分配角色的用户相关信息
      userInfo: '',
      // 添加用户的表单数据
      addForm: {
        username:'',
        password:'',
        email:'',
        mobile:''
      },
      // 添加表单的验证的规则对象
      addFormRules:{
        username:[
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password:[
           { required: true, message: '请输入密码', trigger: 'blur' },
           { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email:[
           { required: true, message: '请输入邮箱', trigger: 'blur' },
             { validator: checkEmail, trigger: 'blur' }
        ],
        mobile:[
           { required: true, message: '请输入手机号', trigger: 'blur' },
             { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户信息的对话框的显示与隐藏
      editDialogVisible: false,
      // 修改的用户的数据表单
      editForm:[],
      // 修改表单的合法性
      editFormRules: {
        email:[
           { required: true, message: '请输入邮箱', trigger: 'blur' },
             { validator: checkEmail, trigger: 'blur' }
        ],
        mobile:[
           { required: true, message: '请输入手机号', trigger: 'blur' },
             { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 所有的角色列表
      roleList:[],
      // option中被选择的id值
      selectedRoleId:''
    }
  },
  methods: {
    async getUserList() {
        const { data : res} = await this.$http.get('users', {
          params:this.queryInfo
          })
        if (res.meta.status !== 200) {
          return this.$message.error("获取用户列表失败")
        }
        this.userList = res.data.users;
        this.total = res.data.total;
    },
    // 监听pageSize改变的事件
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize;
      this.getUserList();
    },
    // 监听到页码值改变的事件
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum;
      this.getUserList();
    },
    // 监听switch改变用户状态
    async userStateChanged(userInfo) {
      const { data : res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
      if (res.meta.status !== 200) {
        userInfo.my_state = !userInfo.my_state;
        this.$message.error("更新用户状态失败");
      }
      console.log(res);
      this.$message.success("更新用户状态成功");
    },
    // 监听对话框的关闭事件,然后进行重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 监听修改对话框的关闭事件，然后进行表单重置
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击按钮,添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请输入正确的数据");
        }
        // 发起对应的网络请求
        const { data : res} = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败');
        }
        this.$message.success('添加用户成功');
        // 关闭对话框
        this.addDialogVisible = false;
        // 重新进行数据的请求
        this.getUserList();
      })
    },
    // 显示修改用户信息的对话框
    async showEditDialog(id) {
      this.editDialogVisible = true;
      const { data : res } = await this.$http.get('users/' + id);
      if (res.meta.status !== 200) {
        this.$message.error("用户信息不存在，请重新刷新页面");
      }
      this.editForm = res.data;
      console.log(this.editForm);
    },
    // 修改用户数据，进行预验证，然后提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请填写正确的数据");
        }
        // 进行数据的修改请求
        const { data : res} = await this.$http.put('users/' + this.editForm.id, this.editForm);
        if (res.meta.status !== 200) {
          this.$message.error("更新用户信息失败");
        }
        this.$message.success("更新用户信息成功");
        // 关闭编辑对话框
        this.editDialogVisible = false;
        // 重新请求页面数据
        this.getUserList();
      })
    },
    // 删除用户
    async deleteUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
      // 确认删除，返回值为confirm
      // 取消删除, 返回值为cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除');
      }
      const { data : res } = await this.$http.delete('users/' + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败");
      };
      this.$message.success("删除用户成功");
      // 重新请求页面数据
      this.getUserList();
    },
    // 分配权限的对话框的显示
    async setRole(userInfo) {
      this.userInfo = userInfo;

      // 在展示对话框之前，获取所有角色的列表
      const { data : res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.roleList = res.data;
      this.setRoleDialogVisible = true;
      console.log(this.roleList);
    },
    // 保存用户的角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error("请选择对应的角色");
      }
      const { data : res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if (res.meta.status !== 200) {
        return this.$message.error("分配对应的角色失败")
      }
      this.$message.success("分配对应的角色成功");
      this.setRoleDialogVisible = false;
      // 重新进行页面的渲染
      this.getUserList();
    },
    // 将分配角色的对话框的相应 的选择信息留空
    setRoleDialogClosed() {
      this.selectedRoleId = '';
      this.userInfo = {}
    }
  }
}
</script>

<style  scoped lang="less">
// .el-pagination {
//   display: flex;
//   justify-content:center;
// }

</style>
