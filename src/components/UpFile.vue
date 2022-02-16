<template>
  <div style="text-align: center; width: 80%; margin-left: 10%">
    <h2>Data Upload</h2>
    <el-button v-if="false" @click="testData">Test Data</el-button>
    <el-upload
      class="upload-demo"
      drag
      :limit="1"
      action=""
      accept=".csv, .xls, .xlsx"
      :before-upload="readCsvFile"
      v-show="upload_display"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <div v-show="table_display" style="margin-top: 20px">
      <el-table :data="table_data" border height="300px" style="width: 100%">
        <el-table-column prop="model" label="model"> </el-table-column>
        <el-table-column prop="year" label="year"> </el-table-column>
        <el-table-column prop="price" label="price"> </el-table-column>
        <el-table-column prop="transmission" label="transmission">
        </el-table-column>
        <el-table-column prop="mileage" label="mileage"> </el-table-column>
        <el-table-column prop="fuelType" label="fuelType"> </el-table-column>
        <el-table-column prop="tax" label="tax"> </el-table-column>
        <el-table-column prop="mpg" label="mpg"> </el-table-column>
        <el-table-column prop="engineSize" label="engineSize">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
// import xlsx from "xlsx";
export default {
  name: "UpFile",
  props: {},
  data() {
    return {
      table_display: false,
      upload_display: true,
      table_data: [],
      data_type: {}
    };
  },
  methods: {
    testData() {
      console.log(this.table_display);
      console.log(this.table_data);
    },
    readCsvFile(obj) {
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
        _this.table_display = true;
        _this.upload_display = false;
        _this.table_data = tmp_data;
        _this.$store.state.data = tmp_data;
        if (tmp_data.length <= 0) {
          return;
        }
        const props = Object.keys(tmp_data[0]);
        console.log(props);
        props.forEach(it => {
          this.judgeDataType(it, tmp_data.map(d => d[it]));
        });
        console.log(this.data_type);
      };
      return false;
    },
    judgeDataType(col, arr) {
      const value_type = typeof(arr[0]);
      if (value_type == typeof(0)) {
        this.data_type[col] = "number";
      } else if (value_type == typeof("")) {
        const key_set = new Set();
        arr.forEach(it => {
          if (key_set.size > 7) {
            return;
          }
          if (!key_set.has(it)) {
            key_set.add(it);
          }
        })
        if (key_set.size > 7) {
          this.data_type[col] = 'string';
        } else {
          this.data_type[col] = 'enum';
        }
      }
    }
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

</style>