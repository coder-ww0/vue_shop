<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" :closable="false" center>
      </el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item v-for="item in manyTableData" :key="item.id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="value" v-for="(value, index) in item.attr_vals" :key="index" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片要上传到后台的api地址 -->
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture"
              :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg">
    </el-dialog>

  </div>
</template>

<script>
  import _ from 'lodash';
  export default {
    data() {
      return {
        activeIndex: '0',
        addForm: {
          goods_name: '',
          goods_price: '',
          goods_weight: '',
          goods_number: '',
          // 商品所属的分类数组
          goods_cat: [],
          // 图片的数组
          pics: [],
          // 商品的详情描述
          goods_introduce: '',
          attrs: []
        },
        addFormRules: {
          goods_name: [{
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }, ],
          goods_price: [{
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }],
          goods_weight: [{
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          }],
          goods_number: [{
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }],
          goods_cat: [{
            required: true,
            message: '请输入商品分类',
            trigger: 'blur'
          }],
        },
        // 商品分类列表
        cateList: [],
        cateProps: {
          label: 'cat_name',
          value: 'cat_id',
          children: 'children',
          expandTrigger: 'hover'
        },
        manyTableData: [],
        // 静态列表数据
        onlyTableData: [],
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        previewPath: '',
        // 预览图的显示与隐藏
        previewVisible: false,
      }
    },
    computed: {
      cateId() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2];
        }
        return null;
      }
    },
    created() {
      this.getCateList();
    },
    methods: {
      async getCateList() {
        const {
          data: res
        } = await this.$http.get('categories');
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类信息失败')
        }
        this.cateList = res.data;
      },
      // 级联选择器选中项变化的时候触发
      handleChange() {
        // console.log(this.addForm.goods_cat)
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = [];
        }
      },
      beforeTabLeave(activeName, oldActiveName) {
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.info("请选择分类");
          return false;
        }
        return true;
      },
      async tabClicked() {
        console.log(this.activeIndex);
        // 如果访问的是动态参数面板
        if (this.activeIndex === '1') {
          const {
            data: res
          } = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: {
              sel: "many"
            }
          });
          if (res.meta.status !== 200) {
            return this.$message.error('获取动态参数失败');
          }
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ');
          })
          this.manyTableData = res.data;
          console.log(this.manyTableData);
        } else if (this.activeIndex === '2') {
          // 访问的是静态参数
          const {
            data: res
          } = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: {
              sel: "only"
            }
          });
          if (res.meta.status !== 200) {
            return this.$message.error('获取静态参数失败');
          }
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ');
          })
          this.onlyTableData = res.data;
          console.log('onlyTableData');
          console.log(this.onlyTableData);
        }
      },
      // 处理图片预览的效果
      handlePreview(file) {
        this.previewPath = file.response.data.url;
        this.previewVisible = true;
      },
      // 处理移除图片的操作
      handleRemove(file) {
        // 获取将要删除的图片的临时路径
        const filePath = file.response.data.tmp_path;
        // 从pics数组中，找到这个图片对应的索引值
        const i = this.addForm.pics.findIndex(x => {
          x.pic === filePath
        })
        this.addForm.pics.splice(i, 1);
      },
      // 图片上传成功之后的操作
      handleSuccess(response) {
        // 拼接得到一个图片信息对象
        const picInfo = {
          pic: response.data.tmp_path
        }
        // 将图片信息对象push到pics数组中
        this.addForm.pics.push(picInfo);
        console.log(this.addForm)
      },
      // 进行添加商品操作
      add() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填写正确的表单项');
          }
          console.log(this.addForm)
          // 实现对象的深拷贝
          const form = _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join(',');
          // 处理动态参数
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newInfo);
          })
          // 处理静态属性
          this.onlyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo);
          })
          form.attrs = this.addForm.attrs;
          console.log(form);
          // 发起请求,保存对应的数据
          const { data : res } = await this.$http.post('goods', form);
          if (res.meta.status !== 201) {
            return this.$message.error('添加商品失败')
          }
          this.$message.success('添加商品成功');
          this.$router.push("/goods");
        })
      }
    }
  }

</script>

<style lang="less" scoped>
  .el-steps {
    margin-top: 15px;
  }

  .el-checkbox {
    margin: 0 10px 5px 0 !important;
  }

  .previewImg {
    width: 100%;
  }

  .addBtn {
    margin-top: 15px;
  }

</style>
