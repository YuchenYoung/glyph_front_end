<template>
  <div style="text-align: center" class="block-area">
    <p class="title">Data Upload</p>
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
</template>

<script>
export default {
  name: "UpFile",
  props: {},
  data() {
    return {
    };
  },
  methods: {
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
        const names = tmp_data.map(d => d[props[0]]);
        this.$store.state.props = props;
        this.$store.state.names = names;
        this.$store.state.table_props = JSON.parse(JSON.stringify(props)); 
        this.$router.push({path: '/index/preprocess'});
      };
      return false;
    },
    
  },
};
</script>

