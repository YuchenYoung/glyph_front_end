<template>
  <div :id="div_id" ref="mainGraph" class="graph-div">
    <svg :id="svg_id" class="svgs" v-show="show_vis" style="background: white"></svg>
    <svg :id="legend_id" class="svgs" v-show="!show_vis" style="background: white"></svg>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  name: "Graph",
  props: ["best", "old", "obj"],
  data() {
    return {
      show_vis: true,
      glyph_display: false,
      path_size: [],
      mapper: {},
      dis_map: false,
      img_obj: {},
      div_id: "graphDiv",
      svg_id: "mainsvg",
      legend_id: 'legendsvg',
      to_generate: true,
      // data_size: 0,
      pie_cnt: 0,
      star_cnt: 0,
      index: 1000,
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
      this.legend_id = `legendsvg${this.index}`
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
          }
          else if (axis == 1) {
            this.y_prop = it.prop;
          }
          axis++;
          return;
        }
        if (Object.prototype.hasOwnProperty.call(this.img_obj.encoded, it.prop)) {
          const encoding = this.img_obj.encoded[it.prop];
          if (it.is_group) {
            if (encoding == 'pie' || encoding == 'heatmap' || encoding == 'star' || encoding == 'flower') {
              encoding_res.push({
                is_group: true,
                props: it.group,
                prop: it.prop,
                element: it.element,
                encoding: encoding
              });
            }
            return;
          } else {
            const dtype = data_type[it.prop];
            if (dtype != 'category' && (encoding == 'length' || encoding == 'size')) {
              encoding_res.push({
                is_group: false,
                prop: it.prop,
                element: it.element,
                encoding: encoding
              });
              return;
            }
          }
        }
        if (it.is_group) {
          encoding_res.push({
            is_group: true,
            props: it.group,
            prop: it.prop,
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
      if (this.x_prop != '' && this.y_prop != '') {
        if (this.x_prop.indexOf('Height') >= 0 || this.y_prop.indexOf('Width') >= 0) {
          const tmp = this.x_prop;
          this.x_prop = this.y_prop;
          this.y_prop = tmp;
        }
      }
      if (this.x_prop != '') {
        encoding_res.push({
          prop: this.x_prop,
          element: 0,
          encoding: 'x',
        });
      }
      if (this.y_prop != '') {
        encoding_res.push({
          prop: this.y_prop,
          element: 0,
          encoding: 'y',
        });
      }
      //console.log(encoding_res);
      return encoding_res;
    },
    drawGraph(p_encoding) {
      // console.log(p_encoding);
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
        .attr("viewBox", "0 0 1600 800")
        .attr("transform", `translate(${svg_height * 0.1}, 0)`)
      // const vis_width = +vis_svg.attr("width");
      // const vis_height = +vis_svg.attr("height");
      const vis_width = 1600;
      const vis_height = 800;
      const margin = { top: 25, right: 60, bottom: 25, left: 80 };
      const inner_width = vis_width - margin.left - margin.right;
      const inner_height = vis_height - margin.top - margin.bottom;
      const g = vis_svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // let dx = 0;
      // let dy = 0;
      let pos_x = 0, pos_y = 0, next_y = 0;
      const data = this.$store.state.data;
      // const names = this.$store.state.names;
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
      const height_scale = ((encoding.map(d => d.encoding)).includes('flower')) ? 1.85 : 1.55;

      const category_init = (prop, arr) => {
        const colors = ['#8dd3c7', '#fccde5', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd']
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
            // .domain([d3.min(data, xValue), d3.max(data, xValue)])
            .domain([0.6, 1.8])
            .range([0, inner_width])
            .nice();
          const xAxis = d3.axisBottom(xScale).ticks(7).tickSize(inner_height);
          const xAxisGroup = g.append('g').call(xAxis).attr('class', 'x-axis')
          xAxisGroup.selectAll('.domain').remove();
        }
        if (x_prop != '' && y_prop != '') {
          yValue = (datum) => {
            return datum[y_prop];
          };
          yScale = d3
            .scaleLinear()
            // .domain([d3.max(data, yValue), d3.min(data, yValue)])
            .domain([80, 0])
            .range([0, inner_height])
            .nice();
          const yAxis = d3.axisLeft(yScale).ticks(5).tickSize(-inner_width);
          const yAxisGroup = g.append('g').call(yAxis).attr('class', 'y-axis')
          yAxisGroup.selectAll('.domain').remove();
        }
        // g.selectAll(".tick text").attr("font-size", "1.5em");
        encoding.forEach(it => {
          if (!it.is_group && data_type[it.prop] == "category") {
            category_init(it.prop, data.map(d => d[it.prop]))
          }
        })
      };

      const render_color = (base, color) => {
        base.attr("fill", color)
      };

      const render_alpha = (base, color, alpha) => {
        let fill = color + ("00" + alpha.toString(16)).slice(-2);
        render_color(base, fill);
      };

      const render_size = (base, d, size, fill, scale, dy) => {
        const midX = size.midX, midY = size.midY, height = size.height;
        const tranx = midX * (1 - scale);
        const trany = midY * (1 - scale) + dy + (scale - 1) * height / 2;
        const shape = base
          .append("path")
          .attr("d", d)
          .attr("fill", fill)
          .attr(
            "transform",
            `translate(${tranx}, ${trany}),scale(${scale}, ${scale})`
          );
        // dy += (scale - 1) * height;
        return shape;
      };

      const render_length = (base, d, size, fill, scale, dy) => {
        const midX = size.midX;
        const tranx = midX * (1 - scale);
        const shape = base
          .append("path")
          .attr("d", d)
          .attr("fill", fill)
          .attr(
            "transform",
            `translate(${tranx}, ${dy}),scale(${scale}, 1)`
          );
        return shape;
      };

      const render_number = (base, d, size, fill, num, dy) => {
        const height = size.height;
        let semi_dy = dy;
        for (let k = 0; k < num; k++) {
          if (k > 0) semi_dy += height;
          // console.log(dy);
          // console.log(num);
          base.append("path")
            .attr("d", d)
            .attr("fill", fill)
            .attr("transform", `translate(0, ${semi_dy})`);
        }
        // dy += (num - 1) * height;
      };

      const render_simple = (base, d, size, fill, dy) => {
        // console.log('vvvvvvvvvvvvvvvvvvvvvsdsdvvvv');
        const shape = base.append("path")
          .attr("d", d)
          .attr("fill", fill)
          .attr("transform", `translate(0, ${dy})`);
        return shape;
      };

      const render_no_color = (base, d, dy) => {
        const shape = base.append("path")
          .attr("d", d)
          .attr("transform", `translate(0, ${dy})`);
        return shape;
      };

      const render_pie = (base, d, size, color, props, datum, dy) => {
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
        const pie_tx = size.midX, pie_ty = size.midY + dy;
        const arc = d3
          .arc()
          .innerRadius(0)
          .outerRadius(Math.max(pie_tx, pie_ty));
        base
          .append("clipPath")
          .attr("id", `clip-pie-${this.index}-${this.pie_cnt}`)
          .append("path")
          .attr("d", d)
          .attr("transform", `translate(${-pie_tx},${-pie_ty})`);
        const pie_chart = base
          .append("g")
          .attr("class", "pie_area")
          .attr("clip-path", `url(#clip-pie-${this.index}-${this.pie_cnt})`)
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

      const render_heatmap = (base, d, size, color, props, datum, dy) => {
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
          const alpha = parseInt(100 + 150 * (values[i] - value_min) / (value_max - value_min));
          pie_colors.push(color + ("00" + alpha.toString(16)).slice(-2));
        }
        const pie_data = pie(pie_data_array);
        const pie_tx = size.midX, pie_ty = size.midY + dy;
        const arc = d3
          .arc()
          .innerRadius(0)
          .outerRadius(Math.max(pie_tx, pie_ty));
        base
          .append("clipPath")
          .attr("id", `clip-pie-${this.index}-${this.pie_cnt}`)
          .append("path")
          .attr("d", d)
          .attr("transform", `translate(${-pie_tx},${-pie_ty})`);
        const pie_chart = base
          .append("g")
          .attr("class", "pie_area")
          .attr("clip-path", `url(#clip-pie-${this.index}-${this.pie_cnt})`)
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

      const render_star = (base, d, size, color, props, datum, dy) => {
        const star_tx = size.midX, star_ty = size.midY + dy;
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

      const render_flower = (base, d, size, color, props, datum, dy) => {
        // const r = Math.max(size.width, size.height);
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
            0.4 + 0.3 * (values[i] - value_min) / (value_max - value_min)
          );
          const alpha = parseInt(100 + (150 * i) / values.length);
          fills.push(color + ("00" + alpha.toString(16)).slice(-2));
          rotates.push((180 / (values.length - 1)) * i);
        }
        const midX = size.midX, midY = size.midY;
        const eleW = size.width, eleH = size.height;
        const rotX = midX - eleW / 2, rotY = midY;
        for (let i = 0; i < values.length; i++) {
          const tranx = (1- scales[i]) * midX + scales[i] / 2 * eleW;
          const trany = 0.5 * midY + dy - eleH / 2 + 0.5 * eleW;
          const transform = `translate(${tranx}, ${trany}), scale(${scales[i]}, 0.5), rotate(${-rotates[i]}, ${rotX}, ${rotY})`;
          // console.log(transform);
          base
            .append("path")
            .attr("d", d)
            .attr("fill", fills[i])
            .attr("transform", transform);
        }
        // dy += (0.5 * eleW - eleH / 2);
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
        // console.log(this.index);
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
        pos_x += width * 2;
        next_y = pos_y + height_scale * height;
        return height;
      };

      const render_name = (glyph, it_name, width, height) => {
        const font = parseInt(height / 8.5);
        glyph.append('text')
          .attr('text-anchor', 'middle')
          .attr('transform', `translate(${width / 2}, ${(height_scale - 0.02) * height - 1.2 * font})`)
          .attr('font-size', `${font}px`)
          .text(it_name);
      };

      const pre_render = (data) => {
        let dys = [0], dy = 0;
        const path_size = _this.img_obj.path_size;
        let render_series = [];
        for (let i = 1; i < path_size.length; i++) {
          render_series.push({
            idx: i,
            left: path_size[i].left,
            top: path_size[i].top
          });
          dys.push(0);
        }
        render_series.sort((a, b) => {
          if (Math.abs(a.top - b.top) < 1e-6) {
            return a.left - b.left;
          }
          return a.top - b.top;
        });

        for (let ix = 0; ix < render_series.length; ix++) {
          let i = render_series[ix].idx;
          const cur_encoding = encoding.filter(d => d.element == i);
          const cur_types = cur_encoding.map(d => d.encoding);
          dys[i] = dy;
          if (cur_types.includes("number")) {
            const prop = cur_encoding[cur_types.findIndex(d => d == "number")].prop;
            dy += (data[prop] - 1) * path_size[i].height;
          } else if (cur_types.includes("size")) {
            const prop = cur_encoding[cur_types.findIndex(d => d == "size")].prop;
            const scale = this.dataRangeMapping(data[prop], prop, 0.7, 1.3);
            dy += (scale - 1) *  path_size[i].height;
          } else if (cur_types.includes("flower")) {
            dy += (0.5 * path_size[i].width - path_size[i].height / 2);
          }
          dys.push(dy);
        }

        return dys;
      };

      const render_data = (data, glyph_width, name) => {
        const path_size = _this.img_obj.path_size;
        const glyph = g.append("g").attr("class", `glyph-${this.index}`);
        render_glyph_transform(data, glyph, glyph_width);
        const dys = pre_render(data);
        const group_types = ['pie', 'heatmap', 'star', 'flower'];
        const shape_types = ['none', 'number', 'size', 'length'];
        const color_types = ['color', 'alpha'];
        // console.log(encoding);
        for (let i = 1; i < ds.length; i++) {
          // let pos = encoding.findIndex((d) => d.element == i);
          const cur_encoding = encoding.filter(d => d.element == i);
          const cur_types = cur_encoding.map(d => d.encoding);
          // let encoding_type = encoding[pos]["encoding"];
          const group_index = cur_types.findIndex(d => group_types.includes(d));
          if (group_index >= 0) {
            const props = cur_encoding[group_index].props;
            const rtype = cur_types[group_index];
            if (rtype == 'pie') {
              render_pie(glyph, ds[i], path_size[i], fills[i], props, data, dys[i]);
            } else if (rtype == 'heatmap') {
              render_heatmap(glyph, ds[i], path_size[i], fills[i], props, data, dys[i]);
            } else if (rtype == 'star') {
              render_star(glyph, ds[i], path_size[i], fills[i], props, data, dys[i]);
            } else if (rtype == 'flower') {
              render_flower(glyph, ds[i], path_size[i], fills[i], props, data, dys[i]);
            }
            continue;
          }
          const shape_index = cur_types.findIndex(d => shape_types.includes(d));
          let shape;
          if (shape_index >= 0) {
            const prop = cur_encoding[shape_index].prop;
            const rtype = cur_types[shape_index];
            if (rtype == 'none') {
              shape = render_simple(glyph, ds[i], path_size[i], fills[i], dys[i]);
              // console.log(shape);
            } else if (rtype == 'number') {
              render_number(glyph, ds[i], path_size[i], fills[i], data[prop], dys[i]);
            } else if (rtype == "size") {
              const mapped_value = this.dataRangeMapping(data[prop], prop, 0.8, 1.2);
              shape = render_size(glyph, ds[i], path_size[i], fills[i], mapped_value, dys[i]);
            } else if (rtype == "length") {
              const mapped_value = this.dataRangeMapping(data[prop], prop, 0.7, 1.3);
              // console.log(mapped_value);
              shape = render_length(glyph, ds[i], path_size[i], fills[i], mapped_value, dys[i]);
            }
          }
          const color_index = cur_types.findIndex(d => color_types.includes(d));
          if (color_index >= 0) {
            if (shape_index < 0) {
              shape = render_no_color(glyph, ds[i], dys[i]);
            }
            const prop = cur_encoding[color_index].prop;
            const rtype = cur_types[color_index];
            if (rtype == 'color') {
              const cur_fill = category_map[prop][data[prop]];
              render_color(shape, cur_fill)
            } else if (rtype == 'alpha') {
              const cur_alpha = parseInt(this.dataRangeMapping(data[prop], prop, 180, 250));
              render_alpha(shape, fills[i], cur_alpha);
            }
          }
        }
        if (x_prop == '' && y_prop == '') {
          render_name(glyph, name, img_width, img_height);
        }
      };

      const render = (data) => {
        // console.log(_this.img_obj.path_size);
        const glyph_width = data.length > 10 ? 150 : 160;
        const names = this.$store.state.names;
        data.forEach((it, i) => {
          render_data(it, glyph_width, names[i]);
        });
      };

      const render_final = () => {
        if (x_prop != '' && y_prop != '') {
          g.append('text')
            .attr('y', inner_height + 60)
            .attr('x', inner_width / 2)
            .attr('fill', '#333333')
            .attr('font-size', '26px')
            .attr('text-anchor', 'middle')
            .text(x_prop);
          g.append('text')
            .attr('transform', `rotate(-90)`)
            .attr('x', -inner_height / 2)
            .attr('y', -50)
            .attr('fill', '#333333')
            .attr('font-size', '26px')
            .attr('text-anchor', 'middle')
            .text(y_prop);
        }
        d3.selectAll('.tick text').attr('font-size', '20px')
        d3.selectAll('.tick line').attr('stroke', '#838378')
        d3.selectAll('.x-axis .tick text').attr('transform', 'translate(0, 8)');
        d3.selectAll('.y-axis .tick text').attr('transform', 'translate(-5, 0)');
      } 

      render_init(data);
      render(data);
      render_final();
    },
    drawLegend(p_encoding) {
      const graph_width = this.$refs.mainGraph.getBoundingClientRect().width;
      // const _this = this;
      const encoding = p_encoding;
      const legend_svg = d3.select(`#${this.legend_id}`);
      let svg_height = graph_width * 0.5;
      let svg_width = graph_width * 0.9;
      if (svg_height < 1 || svg_width < 1) {
        svg_height = 100;
        svg_width = 180;
      }
      legend_svg
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("width", svg_width)
        .attr("height", svg_height)
        .attr("viewBox", "0 0 1000 500")
        .attr("transform", `translate(${svg_height * 0.1}, 0)`)
      const margin = { top: 25, right: 60, bottom: 25, left: 80 };
      const g = legend_svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
      // g.append('text').text('legend area');
      const data = this.$store.state.data;
      const ds = this.img_obj.d_list;
      const fills = this.img_obj.fill;
      const path_size = this.img_obj.path_size;
      const img_width = this.img_obj.ori_size.width;
      const img_height = this.img_obj.ori_size.height;
      let pos_x = 100, base_scale = 1;

      const pie_legend = (base, d, size, color, props, datum) => {
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
        const pie_tx = size.midX, pie_ty = size.midY;
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

      const heatmap_legend = (base, d, size, color, props, datum) => {
        const pie = d3
          .pie()
          .sort(null)
          .value(function (d) {
            return d.value;
          });
        const pieColor = (color_list, id) => {
          return color_list[id % color_list.length];
        };
        const midAngel = (d) => {
          return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }
        let pie_data_array = [];
        let values = []; 
        props.forEach((it) => {
          pie_data_array.push({ name: it, value: 1 });
          values.push(datum[it]);
        });
        const value_max = Math.max.apply(null, values);
        const value_min = Math.min.apply(null, values);
        let pie_colors = [];
        for (let i = 0; i < values.length; i++) {
          const alpha = parseInt(100 + 150 * (values[i] - value_min) / (value_max - value_min));
          pie_colors.push(color + ("00" + alpha.toString(16)).slice(-2));
        }
        const pie_data = pie(pie_data_array);
        const pie_tx = size.midX, pie_ty = size.midY;
        const radius = Math.max(pie_tx, pie_ty);
        const font_size = parseInt(radius / 6);
        const arc = d3
          .arc()
          .innerRadius(0)
          .outerRadius(radius);
        base
          .append("clipPath")
          .attr("id", `legend-clip-pie-${this.pie_cnt}`)
          .append("path")
          .attr("d", d)
          .attr("transform", `translate(${-pie_tx},${-pie_ty})`);
        const pie_chart = base
          .append("g")
          .attr("class", "pie_legend_area")
          .attr("clip-path", `url(#legend-clip-pie-${this.pie_cnt})`)
          .attr("transform", `translate(${pie_tx},${pie_ty})`);
        const pie_labels = base
          .append("g")
          .attr("class", "pie_label")
          .attr("transform", `translate(${pie_tx},${pie_ty})`);
        const pie_lines = base
          .append("g")
          .attr("class", "pie_line")
          .attr("transform", `translate(${pie_tx},${pie_ty})`);
        pie_chart.selectAll("g")
          .data(pie_data)
          .enter()
          .append("path")
          .attr("fill", function (d, i) {
            return pieColor(pie_colors, i);
          })
          .attr("d", function (d) {
            return arc(d);
          });
        pie_labels.selectAll('text')
          .data(pie_data)
          .enter()
          .append('text')
          .attr('dy', '0.35em')
          .attr('font-size', `${font_size}px`)
          .text(function (d) {
            return d.data.name;
          })
          .style('text-anchor', function (d) {
            return midAngel(d) < Math.PI ? 'start' : 'end';
          })
          .attr('transform', function (d) {
            var pos = arc.centroid(d);
            pos[0] = radius * (midAngel(d) < Math.PI ? 1.06 : -1.06);
            return 'translate(' + pos + ')';
          });
        pie_lines.selectAll('polyline')
          .data(pie_data)
          .enter()
          .append('polyline')
          .attr('points', function (d) {
            return [arc.centroid(d), arc.centroid(d), arc.centroid(d)];
          })
          .attr('points', function (d) {
            var pos = arc.centroid(d);
            pos[0] = radius * (midAngel(d) < Math.PI ? 1 : -1);
            return [arc.centroid(d), pos];
          })
          .style('opacity', 1);
        this.pie_cnt++;
      };

      const star_legend = (base, d, size, color, props, datum) => {
        const star_tx = size.midX, star_ty = size.midY;
        const radius = Math.min(size.width, size.height) / 2;
        let font_size = parseInt(img_width / 13);
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
          .attr("transform", `translate(${star_tx},${100+star_ty - size.midY + size.height / 2})`);

        const pathGen = d3.lineRadial();
        let pathData = [];
        let r = 0, lr = -Math.PI / 2, radians = (2 * Math.PI) / props.length;
        values.forEach((d, i) => {
          pathData.push([r, 3.5*d]);
          // draw guidelines
          let lx = 4* radius * Math.cos(lr);
          let ly = 4*radius * Math.sin(lr);
          star_plot.append('line')
            .attr('class', 'star-axis')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 1.05 * lx)
            .attr('y2', 1.05 * ly)
            .attr('stroke', '#aaaa')
            .attr('stroke-width', 8)
            .attr('stroke-dasharray', '20')
          let text_rotate = lr/ Math.PI * 180 + 90;
          if (text_rotate == 90 || text_rotate == 270) {
            text_rotate = 0;
          } else if (text_rotate > 90 && text_rotate < 270) {
            text_rotate -= 180;
          }
          let cur_font = font_size * 1.2
          if (radius * base_scale < 30) {
            lx *= 1.5; 
            ly *= 1.5;
          } else {
            cur_font = parseInt(cur_font * 1.2);
          }
          star_plot.append('text')
            .attr('font-size', `${cur_font}px`)
            .attr('x', 1.15 * lx)
            .attr('y', 1.15 * ly)
            .attr('text-anchor', 'middle')
            .attr('transform', `rotate(${text_rotate}, ${1.07* lx}, ${1.07 * ly})`)
            // .text('star')
            .text(props[i]);
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

      const flower_legend = (base, d, size, color, props, datum) => {
        const radius = Math.max(size.width, size.height);
        const font_size = parseInt(radius / 12);
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
            0.4 + 0.2 * (values[i] - value_min) / (value_max - value_min)
          );
          const alpha = parseInt(150 + 500 * (scales[i] - 0.4));
          // const alpha = parseInt(100 + (150 * i) / values.length);
          fills.push(color + ("00" + alpha.toString(16)).slice(-2));
          rotates.push((180 / (values.length - 1)) * i);
        }
        const midX = size.midX, midY = size.midY;
        const eleW = size.width, eleH = size.height;
        const rotX = midX - eleW / 2, rotY = midY;
        for (let i = 0; i < values.length; i++) {
          const tranx = (1 - scales[i]) * midX + scales[i] / 2 * eleW;
          const trany = 0.5 * midY - eleH / 2 + 0.5 * eleW;
          const transform = `translate(${tranx}, ${trany - size.midY +  size.height / 2 }), scale(${scales[i]}, 0.5), rotate(${-rotates[i]}, ${rotX}, ${rotY})`;
          // console.log(transform);
          base
            .append("path")
            .attr("d", d)
            .attr("fill", fills[i])
            .attr("transform", transform);
          // const x = radius * Math.cos(radius);
          // const y = radius * Math.sin(radius);
          //const text_rotate = (rotates[i] == 0 || rotates[i] == 180) ? 0 : 90 - rotates[i];
          //const text_x = tranx + 1.2*eleW * scales[i] * Math.cos((rotates[i]) / 180 * Math.PI) ;
          //const text_y = trany - 0.25 * eleW - 1.2*eleW * scales[i] * Math.sin((rotates[i]) / 180 * Math.PI) ;
          base.append('text')
            .attr('font-size', `${font_size}px`)
            .attr('text-anchor', 'middle')
            //.attr('transform', `translate(${text_x}, ${text_y}), rotate(${text_rotate})`)
            .attr('transform', `translate(${tranx - midY / 4}, ${trany - 3 * midY / 2 + size.height / 2}), rotate(${90 - rotates[i]}, ${rotX}, ${rotY})`)
            .text(props[i]);
        }
      };

      const group_encodings = ["pie", "heatmap", "star", "flower"];
      for (let i = 1; i < ds.length; i++) {
        let pos = encoding.findIndex((d) => d.element == i);
        let encoding_type = encoding[pos]["encoding"];
        if (!group_encodings.includes(encoding_type)) {
          continue;
        }
        let width = 200;
        let scale = width / img_width;
        base_scale = scale;
        let height = img_height * scale;
        const legend = g.append("g")
          .attr("class", `legend-${this.index}`)
          .attr("width", width)
          .attr("height", height)
          .attr(
            "transform",
            `translate(${pos_x}, 150),scale(${scale}, ${scale})`
          );
        if (encoding_type == "pie") {
          pie_legend(legend, ds[i], path_size[i], fills[i], encoding[pos]["props"], data[0]);
        } else if (encoding_type == "heatmap") {
          heatmap_legend(legend, ds[i], path_size[i], fills[i], encoding[pos]["props"], data[0]);
        } else if (encoding_type == "star") {
          star_legend(legend, ds[i], path_size[i], fills[i], encoding[pos]["props"], data[0]);
        } else if (encoding_type == "flower") {
          flower_legend(legend, ds[i], path_size[i], fills[i], encoding[pos]["props"], data[0]);
        }
        pos_x += width * 1.5;
      }

    },
    generateGraph() {
      this.to_generate = false;
      const encoding_res = this.dataEncoding();
      this.drawGraph(encoding_res);
      this.drawLegend(encoding_res);
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
