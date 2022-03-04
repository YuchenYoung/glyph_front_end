<template>
  <div id="visD3" style="text-align: center" class="block-area">
    <h2>Visualization</h2>
    <div style="margin-bottom: 20px" v-show="!vis_display && !glyph_display">
      <!-- <el-button @click="checkData">Check Data</el-button>
      <el-button type="success" @click="generateVis">Car Data</el-button>
      <el-button type="primary" @click="visPrepare($event, true)">Burger Data</el-button>
      <el-button @click="visPrepare($event, false)">Burger Map Only</el-button> -->
      <el-button type="success" @click="generateGlyphs"
        >Generate Glyphs</el-button
      >
      <el-button type="primary" @click="generateGraph">Draw Graph</el-button>
    </div>
    <!-- <p v-show="dis_map">{{ mapper }}</p> -->
    <!-- <ul v-show="glyph_display">
      <li v-for="(i, index) in dataSize" :key="i" style="width: 120px; height: 120px">
        <svg :id="'glyph' + index"></svg>
      </li>
    </ul> -->
    <div ref="mainGraph" style="width: 96%; margin-left: 2%">
      <svg v-show="vis_display" id="mainsvg" class="svgs" style="border: 2px solid"></svg>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  name: "Graph",
  data() {
    return {
      vis_display: false,
      glyph_display: false,
      path_size: [],
      mapper: {},
      dis_map: false,
      // data_size: 0,
    };
  },
  computed: {
    dataSize() {
      return this.$store.state.data.length;
    },
    pathSize() {
      return this.$store.state.paths_size;
    },
  },
  methods: {
    checkData() {
      console.log(this.$store.state);
    },
    getEncodingType(data_type, ele_type) {
      if (data_type == "string" || data_type == "none") {
        return "none";
      }
      if (data_type == "category") {
        return "color";
      }
      if (data_type == "degree") {
        return "alpha";
      }
      if (data_type == "small_range") {
        return "number";
      }
      if (ele_type == "linear_horizon") {
        return "length";
      }
      if (ele_type == "linear_vertical") {
        return "size";
      }
      if (ele_type == "square") {
        return "size";
      }
      return "none";
    },
    dataEncoding() {
      // const props = this.$store.state.props;
      const data_type = this.$store.state.data_type;
      const ele_type = this.$store.state.img_type;
      const mapping_res = this.$store.state.mapper;
      console.log("----------------------");
      console.log(data_type);
      console.log(ele_type);
      console.log(mapping_res);
      let encoding_res = [];
      // encoding_res.fill()
      mapping_res.forEach((it) => {
        encoding_res.push({
          prop: it.prop,
          element: it.element,
          encoding: this.getEncodingType(
            data_type[it.prop],
            ele_type[it.element]
          ),
        });
      });
      for (let i = 1; i < ele_type.length; i++) {
        if (mapping_res.map((d) => d.element).includes(i)) continue;
        encoding_res.push({
          prop: "none",
          element: i,
          encoding: this.getEncodingType("none", ele_type[i]),
        });
      }
      encoding_res.sort((a, b) => {
        return a.element - b.element;
      });
      console.log(encoding_res);
      return encoding_res;
    },
    visPrepare(ev, vis) {
      const up_data = {
        // content: this.$store.state.img_content,
        content: "burger",
        dataProps: this.$store.state.props,
        svgList: this.$store.state.svg_list,
      };
      console.log(up_data);
      this.$axios({
        method: "post",
        url: "/mapping/",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: up_data,
      }).then((res) => {
        const mapper = res.data;
        console.log(mapper);
        // this.mapper = mapper;
        this.$store.state.mapper = mapper;
        this.dis_map = true;
        if (!vis) return;
        this.generateGlyphs();
      });
    },
    generateVis() {
      console.log(this.$store.state);
      this.vis_display = true;
      const graph_width = this.$refs.mainGraph.getBoundingClientRect().width;
      const _this = this;
      const vis_svg = d3.select("#mainsvg");
      vis_svg.attr("width", graph_width).attr("height", graph_width * 0.6);
      const vis_width = +vis_svg.attr("width");
      const vis_height = +vis_svg.attr("height");
      const margin = { top: 50, right: 100, bottom: 50, left: 100 };
      const inner_width = vis_width - margin.left - margin.right;
      const inner_height = vis_height - margin.top - margin.bottom;
      const g = vis_svg
        .append("g")
        .attr("id", "maingroup")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
      const xValue = (datum) => {
        return datum.year;
      };
      const yValue = (datum) => {
        return datum.mileage;
      };

      let xScale, yScale;
      let all_years;

      const render_init = (data) => {
        xScale = d3
          .scaleLinear()
          .domain([d3.min(data, xValue), d3.max(data, xValue)])
          .range([0, inner_width])
          .nice();
        yScale = d3
          .scaleLinear()
          .domain([d3.max(data, yValue), d3.min(data, yValue)])
          .range([0, inner_height])
          .nice();
        const xAxis = d3.axisBottom(xScale).tickSize(inner_height);
        g.append("g").call(xAxis);
        const yAxis = d3.axisLeft(yScale).tickSize(-inner_width);
        g.append("g").call(yAxis);
        g.selectAll(".tick text").attr("font-size", "1.5em");
      };

      const render = (data) => {
        let render_cnt = 0;
        console.log(data);
        const price_max = d3.max(data, (d) => d.price);
        const price_min = d3.min(data, (d) => d.price);
        let pie_tx,
          pie_ty = 0;
        const d_list = this.$store.state.d_list;
        data.forEach((it) => {
          ++render_cnt;
          const glyph = g.append("g").attr("class", "glyph");
          for (let i = 1; i < d_list.length; i++) {
            if (i != 2) {
              const part = glyph.append("path").attr("d", d_list[i]);
              if (i == 1) {
                const part_width = _this.$store.state.paths_size[i].width;
                const cur_scale = it.engineSize - 0.5;
                part.attr(
                  "transform",
                  `translate(${
                    part_width * (1 - cur_scale)
                  },0),scale(${cur_scale}, 1)`
                );
              }
            } else {
              pie_tx = _this.$store.state.paths_size[i].width * 0.5;
              pie_ty = _this.$store.state.paths_size[i].height * 0.5;
              glyph
                .append("clipPath")
                .attr("id", `clip-${render_cnt}`)
                .append("path")
                .attr("d", d_list[i])
                .attr("transform", `translate(${-pie_tx},${-pie_ty})`);
            }
          }
          const pie = d3
            .pie()
            .sort(null)
            .value(function (d) {
              return d.value;
            });
          const pieColor = (id) => {
            const color_list = ["#ef4136", "#f58220", "#fcaf17"];
            return color_list[id % color_list.length];
          };
          const pie_data = pie([
            { value: it.manual },
            { value: it.semiAuto },
            { value: it.automatic },
          ]);
          const arc = d3
            .arc()
            .innerRadius(0)
            .outerRadius(Math.max(pie_tx, pie_ty));
          const pie_chart = glyph
            .append("g")
            .attr("class", "pie_area")
            .attr("clip-path", `url(#clip-${render_cnt})`)
            .attr("transform", `translate(${pie_tx},${pie_ty})`);
          pie_chart
            .selectAll("g")
            .data(pie_data)
            .enter()
            .append("path")
            .attr("fill", function (d, i) {
              return pieColor(i);
            })
            .attr("d", function (d) {
              return arc(d);
            });
          const svg_width = this.$store.state.svg_width;
          const svg_height = this.$store.state.svg_height;
          const scale = (it.price - price_min) / (price_max - price_min) + 0.5;
          const x_pos = xScale(it.year) - svg_width * 0.5 * scale;
          const y_pos = yScale(it.mileage) - svg_height * 0.5 * scale;
          glyph.attr(
            "transform",
            `translate(${x_pos},${y_pos}), scale(${scale},${scale})`
          );
        });
      };

      const raw_data = this.$store.state.data;

      all_years = Array.from(new Set(raw_data.map((d) => xValue(d))));
      all_years.sort();
      let year_data = [];
      let vis_data = [];
      for (let i = 0; i < all_years.length; i++) {
        year_data.push([]);
      }
      raw_data.forEach((it) => {
        year_data[all_years.indexOf(it.year)].push(it);
      });
      const mileage_part =
        (d3.max(raw_data, yValue) - d3.min(raw_data, yValue)) / 10;
      for (let i = 0; i < all_years.length; i++) {
        year_data[i].sort((a, b) => {
          return a.mileage - b.mileage;
        });
        const cur_mileage_min = d3.min(year_data[i], yValue);
        const cur_mileage_range =
          d3.max(year_data[i], yValue) - d3.min(year_data[i], yValue);
        const cur_mileage_sections = Math.max(
          1,
          parseInt(cur_mileage_range / mileage_part + 0.5)
        );
        const cur_mileage_part = cur_mileage_range / cur_mileage_sections;
        vis_data.push([]);
        for (let j = 0; j < cur_mileage_sections; j++) {
          vis_data[i].push({
            year: all_years[i],
            cnt: 0,
            mileage: 0,
            price: 0,
            engineSize: 0,
            automatic: 0,
            semiAuto: 0,
            manual: 0,
          });
        }
        year_data[i].forEach((it) => {
          let u = 0;
          if (cur_mileage_part > 0) {
            u = Math.min(
              cur_mileage_sections - 1,
              parseInt((it.mileage - cur_mileage_min) / cur_mileage_part)
            );
          }
          vis_data[i][u].cnt++;
          vis_data[i][u].mileage += it.mileage;
          vis_data[i][u].price += it.price;
          vis_data[i][u].engineSize += it.engineSize;
          if (it.transmission.trim() == "Manual") {
            vis_data[i][u].manual++;
          } else if (it.transmission.trim() == "Semi-Auto") {
            vis_data[i][u].semiAuto++;
          } else if (it.transmission.trim() == "Automatic") {
            vis_data[i][u].automatic++;
          }
        });
        for (let j = vis_data[i].length - 1; j >= 0; j--) {
          if (vis_data[i][j].cnt == 0) {
            vis_data[i].splice(j, 1);
          } else {
            vis_data[i][j].mileage /= vis_data[i][j].cnt;
            vis_data[i][j].price /= vis_data[i][j].cnt;
            vis_data[i][j].engineSize /= vis_data[i][j].cnt;
            vis_data[i][j].manual /= vis_data[i][j].cnt;
            vis_data[i][j].semiAuto /= vis_data[i][j].cnt;
            vis_data[i][j].automatic /= vis_data[i][j].cnt;
          }
        }
      }
      let glyph_data = [];
      vis_data.forEach((arr) => {
        arr.forEach((it) => {
          glyph_data.push(it);
        });
      });
      render_init(glyph_data);
      render(glyph_data);
    },
    generateGlyphs() {
      console.log(this.mapper);
      console.log(this.path_size);
      this.glyph_display = true;
      // const mapper = this.mapper;
      const mapper = this.$store.state.mapper;
      const data = this.$store.state.data;
      const props = this.$store.state.props;
      const ds = this.$store.state.d_list;
      let width = this.$store.state.svg_width;
      let height = this.$store.state.svg_height;
      let dis_width = 120;
      let scale = dis_width / width;
      const tranx = width * 0.5 * (scale - 1);
      const trany = height * 0.5 * (scale - 1);
      // this.data_size = data.length;
      let dprop = new Array(ds.length).fill("");
      props.forEach((it) => {
        if (it == "Calories") return;
        dprop[mapper[it]] = it;
      });
      console.log("=====================");
      console.log(dprop);
      for (let i = 0; i < data.length; i++) {
        console.log(`now ${i}`);
        const g = d3.select(`#glyph${i}`);
        const glyph = g.append("g").attr("class", "burg");
        let last_tran = 0;
        for (let j = 1; j < ds.length; j++) {
          let dn = 1;
          if (dprop[j] != "") {
            dn = data[i][dprop[j]];
          }
          const sw = this.$store.state.paths_size[j].height;
          console.log(sw);
          for (let k = 0; k < dn; k++) {
            const tran = last_tran + k * sw;
            glyph
              .append("path")
              .attr("d", ds[j])
              .attr("transform", `translate(0, ${tran})`);
          }
          last_tran += (dn - 1) * sw;
        }
        g.attr("width", width)
          .attr("height", height)
          .attr(
            "transform",
            `translate(${tranx},${trany}),scale(${scale},${scale})`
          );
      }
    },
    drawGraph(p_encoding) {
      console.log(p_encoding);
      
      this.vis_display = true;
      const graph_width = this.$refs.mainGraph.getBoundingClientRect().width;
      const _this = this;
      const encoding = p_encoding;
      const vis_svg = d3.select("#mainsvg");
      vis_svg.attr("width", graph_width).attr("height", graph_width * 0.6);
      const vis_width = +vis_svg.attr("width");
      // const vis_height = +vis_svg.attr("height");
      const margin = { top: 50, right: 100, bottom: 50, left: 100 };
      const inner_width = vis_width - margin.left - margin.right;
      // const inner_height = vis_height - margin.top - margin.bottom;
      const g = vis_svg
        .append("g")
        .attr("id", "maingroup")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)

      let sub_trans = {translate_x: 0, translate_y: 0};
      let pos_x = 0, pos_y = 0, next_y = 0;
      const data = this.$store.state.data;
      const ds = this.$store.state.d_list;
      let img_width = this.$store.state.svg_width;
      let img_height = this.$store.state.svg_height;

      const render_number = (base, d, size, num) => {
        console.log(num);
        const sw = size.height;
        for (let k = 0; k < num; k++) {
          const tran = sub_trans.translate_y + k * sw;
          base.append("path").attr("d", d).attr("transform", `translate(0, ${tran})`);
        }
        sub_trans.translate_y += (num - 1) * sw;
      };

      const render_simple = (base, d, size) => {
        render_number(base, d, size, 1);
      };

      const render_glyph_transform = (glyph, width) => {
        let scale = width / img_width;
        let height = img_height * scale;
        if (pos_x + width > inner_width) {
          pos_x = 0;
          pos_y = next_y;
        }
        //const tranx = img_width * 0.5 * (scale - 1);
        //const trany = img_height * 0.5 * (scale - 1);
        // const tranx = pos_x;
        // const trany = pos_y;
        glyph
          .attr("width", width)
          .attr("height", height)
          .attr(
            "transform",
            `translate(${pos_x},${pos_y}),scale(${scale},${scale})`
          );
        pos_x += width;
        next_y = Math.max(next_y, pos_y + height);
      }

      const render_data = (data) => {
        const glyph = g.append("g").attr("class", "burg");
        for (let i = 1; i < ds.length; i++) {
          let pos = encoding.findIndex(d => d.element == i);
          console.log(pos);
          let encoding_type = encoding[pos]['encoding'];
          if (encoding_type != 'number') {
            render_simple(glyph, ds[i], _this.$store.state.paths_size[i]);
          } else {
            console.log(encoding[pos]["prop"]);
            render_number(glyph, ds[i], _this.$store.state.paths_size[i], data[encoding[pos]["prop"]]);
          }
        }
        render_glyph_transform(glyph, 120);
      };

      const render = (data) => {
        data.forEach(it => {
          render_data(it);
        })
      };

      // render([data[0]]);
      render(data);
      
    },
    generateGraph() {
      this.drawGraph(this.dataEncoding());
    },
  },
};
</script>

<style lang="less">
.tick > line {
  stroke: #c0c0bb;
}
</style>

<style lang="less" scoped>
ul {
  list-style: none;
  padding: 0;
}

ul > li {
  overflow: hidden;
  background-color: #fff;
  border: 1px solid #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  margin: 0 8px 8px 0;
  display: inline-block;
}
</style>
