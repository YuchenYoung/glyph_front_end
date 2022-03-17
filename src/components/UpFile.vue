<template>
  <div style="text-align: center" class="block-area">
    <p class="title">Data Upload</p>
    <el-button v-if="false" @click="testData">Test Data</el-button>
    <div v-show="!dataReady">
      <el-upload
        class="upload-demo"
        drag
        :limit="1"
        action=""
        accept=".csv, .xls, .xlsx"
        :before-upload="readCsvFile"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Click or drag the file here to upload</div>
      </el-upload>
    </div>
    <div v-show="dataReady" class="table-area" style="margin-top: 20px">
      <el-table
        :data="tableData"
        border
        height="260px"
        style="width: 94%; margin-left: 3%"
        :header-cell-style="{ background: '#ffe3b1', color: '#dd9f20' }"
        :row-style="tableRowStyle"
      >
        <el-table-column
          v-for="it in props"
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
        <el-button @click="addGroup" style="margin-top: 5px; background: #ffe3b1;">Add Group</el-button>
      </div>
      <el-button type="warning" class="btn-options" id="btn-ge" @click="generate">Generate</el-button>
      <el-button type="warning" class="btn-options" plain id="btn-re" @click="resetData">Re-upload</el-button>
    </div>
    <div ref="svgSize"></div>
  </div>
</template>

<script>
export default {
  name: "UpFile",
  props: {},
  data() {
    return {
      table_display: false,
      upload_display: true,
      data_type: [],
      groups: [],
      selected_props: [],
    };
  },
  computed: {
    dataReady() {
      return this.$store.state.data_ready;
    },
    tableData() {
      return this.$store.state.data;
    },
    props() {
      return this.$store.state.props;
    },
    noGroupProps() {
      return (idx) => {
        let used_props = [];
        for (let i = 0; i < this.groups.length; i++) {
          if (i == idx) continue;
          used_props = used_props.concat(this.groups[i]);
        }
        let all_props = JSON.parse(JSON.stringify(this.$store.state.props));
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
  },
  methods: {
    tableRowStyle(row) {
      if (row.rowIndex % 2) {
        return { "background-color": "#fff6ec" };
      } else {
        return { "background-color": "#ffffff" };
      }
    },
    testData() {
      console.log(this.table_display);
      console.log(this.table_data);
    },
    readCsvFile(obj) {
      this.$store.state.theme = obj.name.split(".")[0];
      const reader = new FileReader();
      const _this = this;
      reader.readAsArrayBuffer(obj);
      reader.onload = () => {
        const buffer = reader.result;
        const bytes = new Uint8Array(buffer);
        const length = bytes.byteLength;
        let binary = "";
        for (let i = 0; i < length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const XLSX = require("xlsx");
        const wb = XLSX.read(binary, {
          type: "binary",
        });
        const outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        let tmp_data = [...outdata];
        console.log(tmp_data);
        _this.$store.state.data_ready = true;
        _this.$store.state.data = tmp_data;
        if (tmp_data.length <= 0) {
          return;
        }
        const props = Object.keys(tmp_data[0]);
        this.$store.state.props = props;
        this.selected_props = [];
      };
      return false;
    },
    addGroup() {
      this.groups.push([]);
    },
    resetData() {
      this.groups = [];
      this.$store.dispatch("resetData");
    },
    generate() {
      console.log(this.groups);
      let group_props = [];
      this.groups.forEach(it => {
        if (it.length > 0) group_props.push(it);
      });
      this.$store.state.group_props = group_props;
      this.$store.dispatch("generate", this);
    },
  },
};
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
  margin-top: 16px;
  font-size: 18px;
}

#btn-re {
  margin-left: 60px;
}
</style>