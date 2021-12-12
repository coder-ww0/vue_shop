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
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="序号" :index="indexMethod"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页相关功能 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total" background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 分页查询参数
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        // 商品列表
        goodsList: [],
        // 商品总记录数
        total: 0
      }
    },
    created() {
      this.getGoodsList();
    },
    methods: {
      // 根据分页获取对应的商品
      async getGoodsList() {
        const {
          data: res
        } = await this.$http.get('goods', {
          params: this.queryInfo
        });
        if (res.meta.status !== 200) {
          return this.$message.error('获取对应的数据失败');
        }
        this.goodsList = res.data.goods;
        this.total = res.data.total;
      },
      handleSizeChange(newPageSize) {
        this.queryInfo.pagesize = newPageSize;
        this.getGoodsList();
      },
      handleCurrentChange(newPageNum) {
        this.queryInfo.pagenum = newPageNum;
        this.getGoodsList();
      },
      indexMethod(index) {
        // 解决序号相关的问题
        return (this.queryInfo.pagenum - 1) * this.queryInfo.pagesize + index + 1;
      },
      async removeById(id) {
        // 删除商品
        const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除操作');
        }
        const {
          data: res
        } = await this.$http.delete(`goods/${id}`);
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功');
        // 重新请求数据
        this.getGoodsList();
      },
      goAddPage() {
          // 跳转到新增的商品页面
          this.$router.push("/goods/add");
      }
      // 格式化时间
      //修改时间格式
      //   dataFormat(row, column) {
      //     let data = row.add_time * 1000;
      //     if (data === null) {
      //       return ''
      //     }
      //     let dt = new Date(data)
      //     // console.log("dt"+dt);
      //     return dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt
      //       .getMinutes() + ':' + dt.getSeconds()
      //   }
    }
  }

</script>

<style scoped>

</style>
