<template>
  <div
    :id="div_id"
    ref="mainGraph"
    class="graph-div"
    style=""
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
  props: ["best", "old", "obj"],
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
      index: 0,
      x_prop: '',
      y_prop: '',
    };
  },
  computed: {},
  mounted() {
    if (this.best) {
      this.img_obj = this.$store.state.selected_img;
    } else {
      this.img_obj = this.obj;
      if (this.old) {
        this.index = 100 + this.obj.index;
      } else {
        this.index = this.obj.index;
      }
      this.div_id = `graphDiv${this.index}`;
      this.svg_id = `mainsvg${this.index}`;
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
      if (ele_type == "square" || ele_type == "rect") {
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
      const data_type = this.$store.state.data_type;
      const ele_type = this.img_obj.img_type;
      const mapping_res = this.img_obj.mapper;
      //console.log("----------------------");
      //console.log(mapping_res);
      let encoding_res = [];
      let axis = 0;
      mapping_res.forEach((it) => {
        if (it.element == 0) {
          if (axis == 0) {
            this.x_prop = it.prop;
            encoding_res.push({
              prop: it.prop,
              element: 0,
              encoding: 'x',
            });
          }
          else if (axis == 1) {
            this.y_prop = it.prop;
            encoding_res.push({
              prop: it.prop,
              element: 0,
              encoding: 'y',
            });
          }
          axis++;
          return;
        }
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
      //console.log(encoding_res);
      return encoding_res;
    },

    drawGraph(p_encoding) {
      // console.log(p_encoding);
      this.vis_display = true;
      const graph_width = this.$refs.mainGraph.getBoundingClientRect().width;
      const _this = this;
      const encoding = p_encoding;
      const vis_svg = d3.select(`#${this.svg_id}`);
      let svg_height = graph_width * 0.5;
      let svg_width = graph_width * 0.9;
      if (svg_height < 1 || svg_width < 1) {
        svg_height = 100;
        svg_width = 180;
      }
      vis_svg
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("width", svg_width)
        .attr("height", svg_height)
        .attr("viewBox", "0 0 1500 750")
        .attr("transform", `translate(${svg_height * 0.1}, 0)`)
      // const vis_width = +vis_svg.attr("width");
      // const vis_height = +vis_svg.attr("height");
      const vis_width = 1500;
      const vis_height = 750;
      const margin = { top: 50, right: 100, bottom: 50, left: 100 };
      const inner_width = vis_width - margin.left - margin.right;
      const inner_height = vis_height - margin.top - margin.bottom;
      const g = vis_svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      let stran = { tx: 0, ty: 0 };
      let pos_x = 0, pos_y = 0, next_y = 0;
      const data = this.$store.state.data;
      const ds = this.img_obj.d_list;
      const fills = this.img_obj.fill;
      let img_width = this.img_obj.ori_size.width;
      let img_height = this.img_obj.ori_size.height;
      const x_prop = this.x_prop;
      const y_prop = this.y_prop;
      let xValue, yValue;
      let xScale, yScale;
      const data_type = this.$store.state.data_type;
      let category_map = {};

      const category_init = (prop, arr) => {
        const colors = ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd']
        let pos = 0;
        category_map[prop] = {};
        let cat_set = new Set();
        arr.forEach((it) => {
          if (!cat_set.has(it)) {
            cat_set.add(it);
            category_map[prop][it] = colors[pos];
            pos++;
          }
        });
      };

      const render_init = (data) => {
        if (x_prop != '' && y_prop != '') {
          xValue = (datum) => {
            return datum[x_prop];
          };
          xScale = d3
            .scaleLinear()
            .domain([d3.min(data, xValue), d3.max(data, xValue)])
            .range([0, inner_width])
            .nice();
          const xAxis = d3.axisBottom(xScale).tickSize(inner_height);
          g.append("g").call(xAxis);
        }
        if (x_prop != '' && y_prop != '') {
          yValue = (datum) => {
            return datum[y_prop];
          };
          yScale = d3
            .scaleLinear()
            .domain([d3.max(data, yValue), d3.min(data, yValue)])
            .range([0, inner_height])
            .nice();
          const yAxis = d3.axisLeft(yScale).tickSize(-inner_width);
          g.append("g").call(yAxis);
        }
        g.selectAll(".tick text").attr("font-size", "1.5em");
        encoding.forEach(it => {
          if (!it.is_group && data_type[it.prop] == "category") {
            category_init(it.prop, data.map(d => d[it.prop]))
          }
        })
      };

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
        const star_tx = size.midX;
        const star_ty = size.midY;
        const radius = Math.min(size.width, size.height) / 2;
        let values = [];
        props.forEach((it) => {
          values.push(datum[it]);
        });
        const value_max = Math.max.apply(null, values);
        for (let i = 0; i < values.length; i++) {
          values[i] = (radius * values[i]) / value_max;
        }

        const star_plot = base
          .append("g")
          .attr("class", "star_plot")
          .attr("transform", `translate(${star_tx},${star_ty})`);

        const pathGen = d3.lineRadial();
        let pathData = [];
        let r = 0, lr = -Math.PI / 2, radians = (2 * Math.PI) / props.length;
        values.forEach((d) => {
          pathData.push([r, d]);
          // draw guidelines
          const x = radius * Math.cos(lr);
          const y = radius * Math.sin(lr);
          star_plot.append('line')
            .attr('class', 'star-axis')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', x)
            .attr('y2', y)
            .attr('stroke', '#aaaa')
            .attr('stroke-width', 8)
            .attr('stroke-dasharray', '20')

          // to next 
          r += radians;
          lr += radians;
        });

        star_plot
          .append("path")
          .attr("class", "star-path")
          .attr("d", pathGen(pathData) + "Z")
          .attr('stroke', '#444')
          .attr('stroke-width', 4)
          .attr('fill', color)
          .attr('fill-opacity', 0.4)
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

      const render_glyph_transform = (datum, glyph, width) => {
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
        let glyph_x = pos_x, glyph_y = pos_y;
        if (x_prop != '' && y_prop != '') {
          glyph_x = xScale(xValue(datum)) - width * 0.5;
          glyph_y = yScale(yValue(datum)) - height * 0.5;
        }
        glyph
          .attr("width", width)
          .attr("height", height)
          .attr(
            "transform",
            `translate(${glyph_x},${glyph_y}),scale(${scale},${scale})`
          );
        pos_x += width + stran.tx;
        next_y = Math.max(next_y, pos_y + height);
      };

      const render_data = (data) => {
        const glyph = g.append("g").attr("class", `glyph-${this.index}`);
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
            const cur_fill = category_map[encoding[pos]["prop"]][data[encoding[pos]["prop"]]];
            render_color(glyph, ds[i], cur_fill);
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
        render_glyph_transform(data, glyph, 120);
      };

      const render = (data) => {
        data.forEach((it) => {
          render_data(it);
        });
      };

      render_init(data);
      render(data);
    },
    generateGraph() {
      this.to_generate = false;
      const encoding_res = this.dataEncoding();
      this.drawGraph(encoding_res);
      const _this = this;
      _this.$nextTick(() => {
        _this.check_render();
        if (this.best) {
          this.$emit('selectedImgEncoding', encoding_res);
        }
      })
    },
    check_render() {
      //console.log('=========== render check ==============');
      const glyph_doms = document.getElementsByClassName(`glyph-${this.index}`)
      //console.log(glyph_doms);
      //console.log(glyph_doms.length);
      let boxes = [];
      for (let i = 0; i < glyph_doms.length; i++) {
        boxes.push(glyph_doms[i].getBoundingClientRect());
      }
      //console.log(boxes);
      let max_overlap = 0;
      for (let i = 0; i < boxes.length; i++) {
        const li = boxes[i].left, ri = boxes[i].right;
        const ti = boxes[i].top, bi = boxes[i].bottom;
        const wi = boxes[i].width, hi = boxes[i].height;
        for (let j = i + 1; j < boxes.length; j++) {
          const lj = boxes[j].left, rj = boxes[j].right;
          const tj = boxes[j].top, bj = boxes[j].bottom;
          const wj = boxes[j].width, hj = boxes[j].height;
          if (Math.min(ri, rj) <= Math.max(li, lj) || Math.min(bi, bj) <= Math.max(ti, tj)) {
            continue;
          }
          const overlap = (Math.min(ri, rj) - Math.max(li, lj)) * (Math.min(bi, bj) - Math.max(ti, tj));
          max_overlap = Math.max(max_overlap, overlap / Math.min(wi * hi, wj* hj));
        }
      }
      //console.log(max_overlap);
    }
  },
};
</script>

<style lang="less">
.tick > line {
  stroke: #c0c0bb;
}
</style>

<style lang="less" scoped>

.graph-div {
  // width: 92%;
  margin-left: 4%;
  border: 3px solid #e4ae40;
  border-radius: 6px;
  background: white;
  box-sizing: content-box;
  text-align: left;
}

// .star-axis {
//   stroke: #ccc;
//   stroke-width: 2px;
//   stroke-dasharray: 4 5;
// }

</style>
