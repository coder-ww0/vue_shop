<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card>
        <el-row>
            <el-col>
                <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
            </el-col>
        </el-row>
        <!-- 树形表格 -->
        <tree-table :data="cateList" :columns="columns" :selection-type="false"
        :expand-type="false" :show-index="true" border class="treeTable">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" style="color:lightgreen"
            v-if="scope.row.cat_deleted === false"></i>
            <i class="el-icon-error" v-else
            style="color:red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0" effect="dark">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1" effect="dark">二级</el-tag>
            <el-tag type="warning" size="mini" v-else effect="dark">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
        </tree-table>
        <!-- 分页相关 -->
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>
    </el-card>

    <!-- 显示添加分类的对话框 -->
    <el-dialog
    title="添加分类"
    :visible.sync="addCateDialogVisible"
    width="50%"
    @close="resetAddCateDialog">
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类">
                <!-- options用来指定数据源 -->
                <!-- props用来指定配置对象 -->
                <el-cascader
                v-model="selectedKeys"
                :options="parentCateList"
                :props="cascadeProps"
                @change="parentCateChanged" clearable
                ></el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
        // 查询条件
        queryInfo: {
            type: 3,
            pagenum: 1,
            pagesize: 5
        },
        // 商品分类的数据列表
        cateList: [],
        // 总数据条数，用于分页
        total: 0,
        columns: [
            { 
                label: '分类名称',
                prop: 'cat_name'
            },
            { 
                label: '是否有效',
                // 表示将当前列定义为模板列
                type: 'template',
                // 表示这一列使用的模板名称
                template: 'isok'
            },
            { 
                label: '分类等级',
                // 表示将当前列定义为模板列
                type: 'template',
                // 表示这一列使用的模板名称
                template: 'order'
            },
            { 
                label: '操作',
                // 表示将当前列定义为模板列
                type: 'template',
                // 表示这一列使用的模板名称
                template: 'opt'
            }
        ],
        // 增加分类对话框的显示与隐藏
        addCateDialogVisible: false,
        // 用于新增的表单
        addCateForm: {
            // 将要添加的分类的名称
            cat_name: '',
            // 父级分类的id
            cat_pid: 0,
            // 分类的等级，默认要添加的1级分类
            cat_level: 0
        },
        addCateFormRules:{
            cat_name: [
               { required: true, message: '请输入分类名称', trigger: 'blur' },
            ]
        },
        // 父级分类的列表
        parentCateList: [],
        // 级联选择器选择的值
        selectedKeys:[],
        // 级联选择器的规则
        cascadeProps: {
               value: 'cat_id',                 //匹配响应数据中的id
                label: 'cat_name',               //匹配响应数据中的name
                children: 'children',         //匹配响应数据中的children
                expandTrigger: 'hover',
                checkStrictly: true, 
        }
    }
  },
  created() {
      this.getCateList();
  },
  methods: {
      async getCateList() {
        const { data : res } = await this.$http.get('categories', { params : this.queryInfo });
        if (res.meta.status !== 200) {
            return this.$message.error('获取分类列表失败');
        }
        this.cateList = res.data.result;
        this.total = res.data.total;
        console.log(this.cateList);
        console.log(this.total);
      },
      // 处理当前页面大小，即每页显示多少行数据
      handleSizeChange(newPageSize) {
          this.queryInfo.pagesize = newPageSize;
          this.getCateList();
      },
      // 处理当前页面值的变化
      handleCurrentChange(newPage) {
          this.queryInfo.pagenum = newPage;
          this.getCateList();
      },
      // 显示添加分类对话框
      showAddCateDialog() {
          this.addCateDialogVisible = true;
          this.getParentCateList();
      },
      // 获取父级分类的数据列表
      async getParentCateList() {
          const { data : res } = await this.$http.get('categories'
          , {params : {type : 2}})
          if (res.meta.status !== 200) {
              return this.$message.error("获取分类数据失败");
          }
          this.parentCateList = res.data;
      },
      // 选择发生变化
      parentCateChanged() {
          // 如果selectedKeys长度大于0，证明选中了父级分类
          // 如果没有长度为0，证明没有选择对应的父级分类，说明此时添加的分类为一级分类
          console.log(this.selectedKeys);
          if (this.selectedKeys.length > 0) {
              // 父级分类的id
              this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
                // 为当前分类的等级赋值
                this.addCateForm.cat_level = this.selectedKeys.length;
                return;
          } else {
              this.addCateForm.cat_pid = 0;
              this.addCateForm.cat_level = 0;
          }
      },

      addCate() {
          // 添加新的分类
          this.$refs.addCateFormRef.validate(async valid => {
              if (!valid) {
                  return this.$message.error('请填写正确的数据');
              }
              
              const { data : res } = await this.$http.post('categories', this.addCateForm);
              if (res.meta.status !== 201) {
                  return this.$message.error('添加分类失败');
              }
              this.$message.success('添加分类成功');
              this.addCateDialogVisible = false;
              this.getCateList();
          })
      },
      // 重置dialog提交表单
      resetAddCateDialog() {
          this.$refs.addCateFormRef.resetFields();
          this.selectedKeys = [];
          this.addCateForm.cat_pid = 0;
          this.addCateForm.cat_level = 0;

      }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top:15px;
}

// .el-cascader-menu {
//     height:100px;
// }
</style>
