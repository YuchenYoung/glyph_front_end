<template>
  <div style="text-align: center" class="block-area">
    <div v-show="dataReady" class="table-area" style="margin-top: 20px; padding-top: 30px;">
      <el-table
        :data="tableData"
        border
        height="260px"
        style="width: 94%; margin-left: 3%"
        :header-cell-style="{ background: '#ffe3b1', color: '#dd9f20' }"
        :row-style="tableRowStyle"
      >
        <el-table-column
          v-for="it in tableProps"
          :key="it"
          :prop="it"
          :label="it"
        ></el-table-column>
      </el-table>
      <p class="title">Groups</p>
      <div style="width: 94%; margin-left:3%; margin-top: 16px; text-align: left; background-color: white; padding: 8px;">
        <div v-for="(it, idx) in groups" :key="idx"  style="margin-top: 5px; margin-bottom: 5px;">
          <span style="margin-left: 5px;">Group {{ idx }}</span>
          <el-select v-model="groups[idx]" multiple placeholder="Select Props" style="margin-left: 10px; width: 70%">
            <el-option
              v-for="(item, index) in noGroupProps(idx)"
              :key="index"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
        </div>
        <el-button type="warning" plain @click="addGroup" style="margin-top: 5px;">Add Group</el-button>
      </div>
      <el-button type="warning" class="btn-options" id="btn-ge" @click="generate">Generate</el-button>
      <el-button type="warning" class="btn-options" plain id="btn-re" @click="resetData">Re-upload</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data_type: [],
      groups: [],
    }
  },
  computed: {
    dataReady() {
      return this.$store.state.data_ready;
    },
    tableData() {
      return this.$store.state.data;
    },
    tableProps() {
      return this.$store.state.table_props;
    },
    noGroupProps() {
      return (idx) => {
        let used_props = [];
        for (let i = 0; i < this.groups.length; i++) {
          if (i == idx) continue;
          used_props = used_props.concat(this.groups[i]);
        }
        let all_props = JSON.parse(JSON.stringify(this.$store.state.table_props));
        for (let i = all_props.length - 1; i >= 0; i--) {
          if (used_props.includes(all_props[i])) {
            all_props.splice(i, 1);
          }
        }
        return all_props;
      }
    }
  },
  created() {
    console.log(this.$store.state);
    this.table_data = this.$store.state.data;
    this.data_ready = this.$store.state.data_ready;
    this.groups = this.$store.state.group_props;
  },
  methods: {
    tableRowStyle(row) {
      if (row.rowIndex % 2) {
        return { "background-color": "#fff6ec" };
      } else {
        return { "background-color": "#ffffff" };
      }
    },
    addGroup() {
      this.groups.push([]);
    },
    resetData() {
      this.groups = [];
      this.$store.dispatch("resetData", this);
    },
    generate() {
      console.log(this.groups);
      let group_props = [];
      this.groups.forEach(it => {
        if (it.length > 1) group_props.push(it);
      });
      this.$store.state.group_props = group_props;
      this.$store.dispatch("generate", this);
    },
  },
}
</script>

<style lang="less">
.el-table td,
.el-table th {
  text-align: center !important;
  min-height: 32px;
}
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.table-area {
  // width: 94%;
  // margin-left: 3%;
  width: 100%;
}

.el-table thead {
  color: #111111;
}

.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
  background: #fff6ec;
}

.btn-options {
  // width: 180px;
  // height: 50px;
  // margin-top: 22px;
  // font-size: 20px;
  width: 120px;
  height: 42px;
  margin-top: 22px;
  font-size: 18px;
}

#btn-re {
  margin-left: 60px;
}

.el-button--warning.is-plain:hover {
  background: #f7d694;
}

</style>
