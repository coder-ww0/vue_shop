<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon>
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类: </span>
          <!-- 商品选择的级联选择框 -->
          <el-cascader v-model="selectedCateKeys" :options="cateList" @change="handleChange" :props="cateProps">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible= true">添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable
                  @close="handleClosed(index, scope.row)">
                  {{item}}
                </el-tag>
                <!-- 添加的对话框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row)">修改
                </el-button>
                <el-button type="warning" size="mini" icon="el-icon-delete" @click="deleteParam(scope.row)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible= true">添加属性
          </el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable
                  @close="handleClosed(index, scope.row)">
                  {{item}}
                </el-tag>
                <!-- 添加的对话框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row)">修改
                </el-button>
                <el-button type="warning" size="mini" icon="el-icon-delete" @click="deleteParam(scope.row)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 显示新增的对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="addFormRules">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 显示修改的对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="editFormRules">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 获取所有的分类信息
        cateList: [],
        // 级联选择框的相关设置
        // 级联选择器的规则
        cateProps: {
          value: 'cat_id', //匹配响应数据中的id
          label: 'cat_name', //匹配响应数据中的name
          children: 'children', //匹配响应数据中的children
          expandTrigger: 'hover',
          //   checkStrictly: true,
        },
        // 被级联选择框选中
        selectedCateKeys: [],
        // 默认情况下tab被选中的标签
        activeName: "many",
        // 动态参数的属性
        manyTableData: [],
        // 静态属性
        onlyTableData: [],
        // 新增的对话框的显示与隐藏
        addDialogVisible: false,
        // 添加的对应的表单的数据
        addForm: {
          attr_name: ''
        },
        addFormRules: {
          attr_name: [{
            required: true,
            message: '请输入对应的参数',
            trigger: 'blur'
          }, ]
        },
        // 修改对话框的显示与隐藏
        editDialogVisible: false,
        editForm: {
          attr_name: ''
        },
        editFormRules: {
          attr_name: [{
            required: true,
            message: '请输入对应的参数',
            trigger: 'blur'
          }, ]
        },
        // 属性id
        attrId: '',
        // // 控制输入框的显示与隐藏
        // inputVisible: false,
        // inputValue: ''
      }
    },
    created() {
      this.getCateList()
    },
    computed: {
      // 按钮是否需要被禁用
      isBtnDisabled() {
        if (this.selectedCateKeys.length !== 3) {
          return true;
        }
        return false;
      },
      // 当前选中的三级分类id
      cateId() {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2];
        }
        return null;
      },
      // 动态计算标题的文本
      titleText() {
        if (this.activeName === 'many') {
          return '动态参数';
        }
        return '静态参数';
      }
    },
    methods: {
      async getCateList() {
        const {
          data: res
        } = await this.$http.get('categories');
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表失败');
        }
        this.cateList = res.data;
        console.log(this.cateList);
      },
      // 级联选择框变化的时候会触发的函数
      async handleChange() {
        this.getParamData();
      },
      // 监听tabs的变化
      handleTabClick() {
        this.getParamData();
        console.log(this.activeName);
      },
      // 请求参数列表数据
      async getParamData() {
        // 如果没有选中三级分类，进行清空退出
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = [];
          this.manyTableData = [];
          this.onlyTableData = [];
          return;
        }
        // 对应的参数列表
        let params = {
          sel: this.activeName
        }
        const {
          data: res
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: params
        });
        if (res.meta.status !== 200) {
          return this.$message.error('获取对应的参数列表失败');
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
          // 控制文本框的显示与隐藏
          item.inputVisible = false;
          // 文本框中输入的值
          item.inputValue = '';
        })

        if (this.activeName === 'many') {
          this.manyTableData = res.data;
        } else {
          this.onlyTableData = res.data;
        }
        console.log("==", res.data);
      },
      addDialogClosed() {
        // 对话框关闭的时候，清空对应的对话框的内容
        this.$refs.addFormRef.resetFields();
      },
      // 添加参数
      addParams() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请添加正确的参数');
          }
          const {
            data: res
          } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          });
          if (res.meta.status !== 201) {
            return this.$message.error('添加失败');
          }
          this.$message.success('添加成功');
          // 关闭对话框
          this.addDialogVisible = false;
          this.getParamData();
        });
      },
      // 修改对话框的显示
      showEditDialog(attributes) {
        // v2.0也可以在这里传入参数,然后直接请求后端接口，获取到对应的信息进行绑定
        this.attrId = attributes.attr_id;
        // 将对应的需要修改的值显示在页面中
        this.editForm.attr_name = attributes.attr_name;
        this.editDialogVisible = true;
      },
      // 重置修改表单
      editDialogClosed() {
        this.$refs.editFormRef.resetFields();
      },
      // 修改参数
      editParams() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填写正确的参数');
          }
          const {
            data: res
          } = await this.$http.put(`categories/${this.cateId}/attributes/${this.attrId}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          });
          if (res.meta.status !== 200) {
            return this.$message.error("修改对应的参数错误")
          }
          this.$message.success("修改对应的参数成功");
          this.editDialogVisible = false;
          this.getParamData();
        })
      },
      // 删除对应的参数
      async deleteParam(attributes) {
        const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if (confirmResult !== 'confirm') {
          return this.$message.info('取消删除');
        }
        const {
          data: res
        } = await this.$http.delete(`categories/${this.cateId}/attributes/${attributes.attr_id}`);
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败');
        }
        this.$message.success('删除成功');
        this.getParamData();
      },
      // 处理文本框的确认
      // 当文本框失去焦点以及按下enter时候会触发
      handleInputConfirm(row) {
        // 当文本框输入值为空字符时，将文本框置为空
        if (row.inputValue.trim().length === 0) {
          row.inputValue = '';
          row.inputVisible = false;
          return;
        }
        // 如果没有return,则证明输入的内容需要做后续的处理
        row.attr_vals.push(row.inputValue);
        // 将tag标签的内容置为空，防止影响下一个标签
        console.log(row.inputValue.trim())
        row.inputValue = '';
        row.inputVisible = false;
        this.saveAttrVals(row);
      },
      async saveAttrVals(row) {
        const {
          data: res
        } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        })
        if (res.meta.status !== 200) {
          return this.$message.error("修改参数失败");
        }
        this.$message.success('修改参数成功');
      },
      handleClosed(index, row) {
        row.attr_vals.splice(index, 1);
        this.saveAttrVals(row);
      },
      // 展示输入文本框
      showInput(row) {
        row.inputVisible = true;
        // 让文本框自动获得焦点
        // $nextTick方法的作用，就是当页面中的元素被重新渲染之后，才会指定回调函数中的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      }

    }
  }

</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }

  .el-tag {
    margin: 10px;
  }

  .input-new-tag {
    width: 120px;
  }

</style>
