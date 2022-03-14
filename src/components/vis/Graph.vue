<template>
  <div
    :id="div_id"
    ref="mainGraph"
    style="
      width: 92%;
      margin-left: 4%;
      border: 3px solid #e4ae40;
      background: white;
    "
  >
    <svg
      v-show="vis_display"
      :id="svg_id"
      class="svgs"
      style="background: white"
    ></svg>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  name: "Graph",
  props: ["best", "obj"],
  data() {
    return {
      vis_display: false,
      glyph_display: false,
      path_size: [],
      mapper: {},
      dis_map: false,
      img_obj: {},
      div_id: "graphDiv",
      svg_id: "mainsvg",
      to_generate: true,
      // data_size: 0,
      pie_cnt: 0,
      star_cnt: 0,
    };
  },
  computed: {},
  mounted() {
    //console.log("~~~~~~---~~~~~~~");
    //console.log(this.best);
    if (this.best) {
      this.img_obj = this.$store.state.selected_img;
    } else {
      this.img_obj = this.obj;
      this.div_id = `graphDiv${this.obj.index}`;
      this.svg_id = `mainsvg${this.obj.index}`;
    }
    this.$nextTick(() => {
      if (this.to_generate) {
        this.generateGraph();
      }
    });
  },
  methods: {
    checkData() {
      console.log(this.$store.state);
    },
    getGroupType(group) {
      const data_type = this.$store.state.data_type;
      const sample = this.$store.state.data[0];
      let sum = 0;
      for (let i = 0; i < group.length; i++) {
        if (data_type[group[i]] != "degree") {
          return "value";
        }
        sum += sample[group[i]];
      }
      if (Math.abs(sum - 1.0) > 1e-5) {
        return "degree";
      }
      return "percent";
    },
    getEncodingType(data_type, ele_type, is_group) {
      if (data_type == "string" || data_type == "none") {
        return "none";
      }
      if (is_group) {
        if (ele_type != "square") {
          return "flower";
        }
        if (data_type == "percent") {
          return "pie";
        }
        if (data_type == "degree") {
          return "heatmap";
        }
        if (data_type == "value") {
          return "star";
        }
        return "flower";
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
    dataRangeMapping(data, prop, min_val, max_val) {
      // console.log(this.$store.state)
      const data_max = this.$store.state.data_range[prop].max;
      const data_min = this.$store.state.data_range[prop].min;
      return (
        min_val +
        ((max_val - min_val) * (data - data_min)) / (data_max - data_min)
      );
    },
    dataEncoding() {
      // console.log(this.img_obj);
      // const props = this.$store.state.props;
      const data_type = this.$store.state.data_type;
      // const ele_type = this.$store.state.img_type;
      const ele_type = this.img_obj.img_type;
      const mapping_res = this.img_obj.mapper;
      // console.log(mapping_res);
      // const mapping_res = this.$store.state.mapper;
      console.log("----------------------");
      // console.log(data_type);
      // console.log(ele_type);
      console.log(mapping_res);
      let encoding_res = [];
      // encoding_res.fill()
      mapping_res.forEach((it) => {
        if (it.is_group) {
          encoding_res.push({
            is_group: true,
            props: it.group,
            element: it.element,
            encoding: this.getEncodingType(
              this.getGroupType(it.group),
              ele_type[it.element],
              true
            ),
          });
          return;
        }
        encoding_res.push({
          is_group: false,
          prop: it.prop,
          element: it.element,
          encoding: this.getEncodingType(
            data_type[it.prop],
            ele_type[it.element],
            false
          ),
        });
      });
      for (let i = 1; i < ele_type.length; i++) {
        if (mapping_res.map((d) => d.element).includes(i)) continue;
        encoding_res.push({
          prop: "none",
          element: i,
          encoding: this.getEncodingType("none", ele_type[i], false),
        });
      }
      encoding_res.sort((a, b) => {
        return a.element - b.element;
      });
      console.log(encoding_res);
      return encoding_res;
    },

    drawGraph(p_encoding) {
      // console.log(p_encoding);

      this.vis_display = true;
      const graph_width = this.$refs.mainGraph.getBoundingClientRect().width;
      // const graph_width = document.getElementById(this.div_id).getBoundingClientRect().width;
      const _this = this;
      const encoding = p_encoding;
      // const vis_svg = d3.select("#mainsvg");
      const vis_svg = d3.select(`#${this.svg_id}`);
      // console.log(vis_svg);
      vis_svg
        .attr("width", graph_width * 0.9)
        .attr("height", graph_width * 0.5);
      vis_svg.attr("viewBox", "0 0 1500 750");
      // const vis_width = +vis_svg.attr("width");
      // const vis_height = +vis_svg.attr("height");
      const vis_width = 1500;
      // const vis_height = 750;
      const margin = { top: 50, right: 100, bottom: 50, left: 100 };
      const inner_width = vis_width - margin.left - margin.right;
      // const inner_height = vis_height - margin.top - margin.bottom;
      const g = vis_svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      let stran = { tx: 0, ty: 0 };
      let pos_x = 0,
        pos_y = 0,
        next_y = 0;
      const data = this.$store.state.data;
      const ds = this.img_obj.d_list;
      const fills = this.img_obj.fill;
      let img_width = this.img_obj.ori_size.width;
      let img_height = this.img_obj.ori_size.height;

      /*
      const xValue = (datum) => {
        return datum.year;
      };
      const yValue = (datum) => {
        return datum.mileage;
      };

      let xScale, yScale;

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
      */

      const render_color = (base, d, color) => {
        base
          .append("path")
          .attr("d", d)
          .attr("fill", color)
          .attr("transform", `translate(${stran.tx}, ${stran.ty})`);
      };

      const render_alpha = (base, d, color, alpha) => {
        let fill = color + ("00" + alpha.toString(16)).slice(-2);
        render_color(base, d, fill);
      };

      const render_size = (base, d, size, fill, scale) => {
        base
          .append("path")
          .attr("d", d)
          .attr("fill", fill)
          .attr(
            "transform",
            `translate(${stran.tx}, ${stran.ty}),scale(${scale}, ${scale})`
          );
        stran.tx += (scale - 1) * 0.5 * size.width;
        stran.ty += (scale - 1) * 0.5 * size.height;
      };

      const render_length = (base, d, size, fill, length) => {
        base
          .append("path")
          .attr("d", d)
          .attr("fill", fill)
          .attr(
            "transform",
            `translate(${stran.tx}, ${stran.ty}),scale(${length}, ${1})`
          );
        stran.tx += (length - 1) * 0.5 * size.width;
      };

      const render_number = (base, d, size, fill, num) => {
        // console.log(num);
        const sw = size.height;
        for (let k = 0; k < num; k++) {
          const trany = stran.ty + k * sw;
          base
            .append("path")
            .attr("d", d)
            .attr("fill", fill)
            .attr("transform", `translate(${stran.tx}, ${trany})`);
        }
        stran.ty += (num - 1) * sw;
      };

      const render_simple = (base, d, size, fill) => {
        render_number(base, d, size, fill, 1);
      };

      const render_pie = (base, d, size, color, props, datum) => {
        const pie = d3
          .pie()
          .sort(null)
          .value(function (d) {
            return d.value;
          });
        const pieColor = (id) => {
          const color_list = [
            "#ec6d76",
            "#b66dec",
            "#6d78ec",
            "#6dd6ec",
            "#6decb3",
            "#93ec6d",
            "#d5ec6d",
            "#ecb36d",
          ];
          return color_list[id % color_list.length];
        };
        let pie_data_array = [];
        props.forEach((it) => {
          pie_data_array.push({ value: datum[it] });
        });
        const pie_data = pie(pie_data_array);
        const pie_tx = size.width * 0.5,
          pie_ty = size.height * 0.5;
        const arc = d3
          .arc()
          .innerRadius(0)
          .outerRadius(Math.max(pie_tx, pie_ty));
        base
          .append("clipPath")
          .attr("id", `clip-pie-${this.pie_cnt}`)
          .append("path")
          .attr("d", d)
          .attr("transform", `translate(${-pie_tx},${-pie_ty})`);
        const pie_chart = base
          .append("g")
          .attr("class", "pie_area")
          .attr("clip-path", `url(#clip-pie-${this.pie_cnt})`)
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
        this.pie_cnt++;
      };

      const render_heatmap = (base, d, size, color, props, datum) => {
        const pie = d3
          .pie()
          .sort(null)
          .value(function (d) {
            return d.value;
          });
        const pieColor = (color_list, id) => {
          return color_list[id % color_list.length];
        };
        let pie_data_array = [];
        let values = []; 
        props.forEach((it) => {
          pie_data_array.push({ value: 1 });
          values.push(datum[it]);
        });
        const value_max = Math.max.apply(null, values);
        const value_min = Math.min.apply(null, values);
        let pie_colors = [];
        for (let i = 0; i < values.length; i++) {
          const alpha = parseInt(55 + 200 * (values[i] - value_min) / (value_max - value_min));
          pie_colors.push(color + ("00" + alpha.toString(16)).slice(-2));
        }
        const pie_data = pie(pie_data_array);
        const pie_tx = size.width * 0.5, pie_ty = size.height * 0.5;
        const arc = d3
          .arc()
          .innerRadius(0)
          .outerRadius(Math.max(pie_tx, pie_ty));
        base
          .append("clipPath")
          .attr("id", `clip-pie-${this.pie_cnt}`)
          .append("path")
          .attr("d", d)
          .attr("transform", `translate(${-pie_tx},${-pie_ty})`);
        const pie_chart = base
          .append("g")
          .attr("class", "pie_area")
          .attr("clip-path", `url(#clip-pie-${this.pie_cnt})`)
          .attr("transform", `translate(${pie_tx},${pie_ty})`);
        pie_chart
          .selectAll("g")
          .data(pie_data)
          .enter()
          .append("path")
          .attr("fill", function (d, i) {
            return pieColor(pie_colors, i);
          })
          .attr("d", function (d) {
            return arc(d);
          });
        this.pie_cnt++;
      };

      const render_star = (base, d, size, color, props, datum) => {
        const star_tx = size.width * 0.5;
        const star_ty = size.height * 0.5;
        const radius = Math.max(size.width, size.height) / 2;
        let values = [];
        props.forEach((it) => {
          values.push(datum[it]);
        });
        const value_max = Math.max.apply(null, values);
        for (let i = 0; i < values.length; i++) {
          values[i] = (radius * values[i]) / value_max;
        }
        const path = d3.radialLine();
        let pathData = [];
        let r = Math.PI / 2,
          radians = (2 * Math.PI) / props.length;
        values.forEach((d) => {
          pathData.push([d, r]);
          r += radians;
        });

        const star_plot = base
          .append("g")
          .attr("class", "star_plot")
          .attr("transform", `translate(${star_tx},${star_ty})`);

        star_plot
          .append("path")
          .attr("class", "star-path")
          .attr("transform", `translate(${radius}, ${radius})`)
          .attr("d", path(pathData) + "Z");
        this.star_cnt++;
      };

      const render_flower = (base, d, size, color, props, datum) => {
        const r = Math.max(size.width, size.height);
        let values = [],
          scales = [],
          fills = [],
          rotates = [];
        props.forEach((it) => {
          values.push(datum[it]);
        });
        const value_max = Math.max.apply(null, values);
        const value_min = Math.min.apply(null, values);
        for (let i = 0; i < values.length; i++) {
          scales.push(
            0.5 + (1.5 * (values[i] - value_min)) / (value_max - value_min)
          );
          const alpha = parseInt(55 + (200 * i) / values.length);
          fills.push(color + ("00" + alpha.toString(16)).slice(-2));
          rotates.push((180 / (values.length - 1)) * i);
        }
        for (let i = 0; i < values.length; i++) {
          base
            .append("path")
            .attr("d", d)
            .attr("fill", fills[i])
            .attr(
              "transform",
              `translate(${r}, ${r}), rotate(${rotates[i]}), scale(${scales[i]}, 1)`
            );
        }
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
        pos_x += width + stran.tx;
        next_y = Math.max(next_y, pos_y + height);
      };

      const render_data = (data) => {
        const glyph = g.append("g").attr("class", "burg");
        const path_size = _this.img_obj.path_size;
        for (let i = 1; i < ds.length; i++) {
          stran.tx = 0;
          stran.ty = 0;
          let pos = encoding.findIndex((d) => d.element == i);
          // console.log(encoding);
          let encoding_type = encoding[pos]["encoding"];
          if (encoding_type == "none") {
            render_simple(glyph, ds[i], path_size[i], fills[i]);
          } else if (encoding_type == "number") {
            render_number(
              glyph,
              ds[i],
              path_size[i],
              fills[i],
              data[encoding[pos]["prop"]]
            );
          } else if (encoding_type == "size") {
            const mapped_value = this.dataRangeMapping(
              data[encoding[pos]["prop"]],
              encoding[pos]["prop"],
              0.5,
              2
            );
            render_size(glyph, ds[i], path_size[i], fills[i], mapped_value);
          } else if (encoding_type == "length") {
            const mapped_value = this.dataRangeMapping(
              data[encoding[pos]["prop"]],
              encoding[pos]["prop"],
              0.5,
              2
            );
            render_length(glyph, ds[i], path_size[i], fills[i], mapped_value);
          } else if (encoding_type == "color") {
            const mapped_value = parseInt(
              this.dataRangeMapping(
                data[encoding[pos]["prop"]],
                encoding[pos]["prop"],
                0,
                255
              )
            );
            render_color(glyph, ds[i], `rgb(${mapped_value}, 0, 0)`);
          } else if (encoding_type == "alpha") {
            const mapped_value = parseInt(
              this.dataRangeMapping(
                data[encoding[pos]["prop"]],
                encoding[pos]["prop"],
                0,
                255
              )
            );
            render_alpha(glyph, ds[i], fills[i], mapped_value);
          } else if (encoding_type == "pie") {
            render_pie(
              glyph,
              ds[i],
              path_size[i],
              fills[i],
              encoding[pos]["props"],
              data
            );
          } else if (encoding_type == "heatmap") {
            render_heatmap(
              glyph,
              ds[i],
              path_size[i],
              fills[i],
              encoding[pos]["props"],
              data
            );
          } else if (encoding_type == "star") {
            render_star(
              glyph,
              ds[i],
              path_size[i],
              fills[i],
              encoding[pos]["props"],
              data
            );
          } else if (encoding_type == "flower") {
            render_flower(
              glyph,
              ds[i],
              path_size[i],
              fills[i],
              encoding[pos]["props"],
              data
            );
          }
        }
        render_glyph_transform(glyph, 120);
      };

      const render = (data) => {
        data.forEach((it) => {
          render_data(it);
        });
      };

      // render([data[0]]);
      render(data);
    },
    generateGraph() {
      this.to_generate = false;
      const encoding_res = this.dataEncoding();
      this.drawGraph(encoding_res);
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
