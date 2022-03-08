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
        height="400px"
        style="width: 100%"
        :header-cell-style="{ background: '#ffe3b1', color: '#dd9f20' }"
        :row-style="tableRowStyle"
        @header-click="columnSelect"
      >
        <el-table-column
          v-for="it in props"
          :key="it"
          :prop="it"
          :label="it"
        ></el-table-column>
      </el-table>
      <el-button type="warning" id="btn-ge" @click="generate">Generate</el-button>
      <el-button type="warning" plain id="btn-re" @click="resetData">Re-upload</el-button>
    </div>
    <div ref="svgSize"></div>
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
      // data_ready: [],
      // table_data: false,
      // props: [],
      data_type: [],
      selected_props: []
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
  },
  created() {
    console.log(this.$store.state);
    this.table_data = this.$store.state.data;
    this.data_ready = this.$store.state.data_ready;
  },
  methods: {
    tableRowStyle(row) {
      // console.log(row)
      if (row.rowIndex % 2) {
        return {
          "background-color": "#fff6ec",
        };
      } else {
        return {
          "background-color": "#ffffff",
        };
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
        // _this.table_display = true;
        // _this.upload_display = false;
        // _this.table_data = tmp_data;
        console.log(tmp_data);
        _this.$store.state.data_ready = true;
        _this.$store.state.data = tmp_data;
        if (tmp_data.length <= 0) {
          return;
        }
        const props = Object.keys(tmp_data[0]);
        this.$store.state.props = props;
        this.selected_props = [];
        // console.log(props);
        // props.forEach((it) => {
        //   this.$store.state.data_type[it] = this.judgeDataType(
        //     tmp_data.map((d) => d[it])
        //   );
        //   this.$store.state.data_range[it] = this.getDataRange(
        //     tmp_data.map((d) => d[it])
        //   );
        // });
        // console.log(this.$store.state.data_type);
      };
      return false;
    },
    columnSelect(column) {
      console.log(column);
      if (this.selected_props.includes(column.property)) {
        this.selected_props.splice( this.selected_props.indexOf(column.property), 1);
        document.getElementsByClassName(column.id)[0].style.color = "#dd9f20";
      } else {
        this.selected_props.push(column.property);
        document.getElementsByClassName(column.id)[0].style.color = "red";
      }
    },
    // isDegreeData(arr) {
    //   for (let i = 0; i < arr.length; i++) {
    //     if (arr[i] > 1 || arr[i] < 0) {
    //       return false;
    //     }
    //   }
    //   return true;
    // },
    // isInteger(arr) {
    //   for (let i = 0; i < arr.length; i++) {
    //     if (arr[i] % 1 !== 0) {
    //       return false;
    //     }
    //   }
    //   return true;
    // },
    // isDataInSmallRange(arr) {
    //   for (let i = 0; i < arr.length; i++) {
    //     if (arr[i] > 5 || arr[i] < 0) {
    //       return false;
    //     }
    //   }
    //   return true;
    // },
    // isCategorical(arr) {
    //   const key_set = new Set();
    //   arr.forEach((it) => {
    //     if (key_set.size > 7) {
    //       return false;
    //     }
    //     if (!key_set.has(it)) {
    //       key_set.add(it);
    //     }
    //   });
    //   return key_set.size <= 7;
    // },
    // getDataRange(arr) {
    //   if (typeof arr[0] != typeof 0) {
    //     return { min: "", max: "" };
    //   }
    //   return {
    //     min: Math.min.apply(null, arr),
    //     max: Math.max.apply(null, arr),
    //   };
    // },
    // judgeDataType(arr) {
    //   const value_type = typeof arr[0];
    //   if (value_type == typeof 0) {
    //     if (this.isInteger(arr)) {
    //       if (this.isDataInSmallRange(arr)) {
    //         return "small_range";
    //       }
    //     } else {
    //       if (this.isDegreeData(arr)) {
    //         return "degree";
    //       }
    //     }
    //     return "number";
    //   } else if (value_type == typeof "") {
    //     if (this.isCategorical(arr)) {
    //       return "category";
    //     } else {
    //       return "string";
    //     }
    //   }
    // },
    resetData() {
      this.$store.dispatch('resetData');
      // this.$store.state.data_ready = false;
      // this.$store.state.data = [];
      // this.$store.state.props = [];
      // this.$store.state.data_type = {};
      // this.$store.state.data_range = {};
    },
    generate() {
      console.log(this.selected_props);
      this.$store.state.selected_props = this.selected_props;
      this.$store.dispatch('generate', this);
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
.table-area {
  width: 94%;
  margin-left: 3%;
}

.el-table thead {
  color: #111111;
}

.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
  background: #fff6ec;
}

.el-button {
  width: 180px;
  height: 50px;
  margin-top: 29px;
  font-size: 20px;
}

#btn-re {
  margin-left: 60px;
}
</style>