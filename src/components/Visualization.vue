<template>
  <div id="visD3" style="text-align: center">
    <h2>Visualization</h2>
    <el-button v-show="!vis_display" @click="generateVis"
      >Generate Visualization</el-button
    >
    <svg
      v-show="vis_display"
      width="1500"
      height="700"
      id="mainsvg"
      class="svgs"
    ></svg>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  name: "Visualization",
  data() {
    return {
      vis_display: false,
			path_size: [],
    };
  },
  methods: {
    getPathSize() {
      const path_list = document.getElementsByTagName("path");
      for (let i = 0; i < path_list.length; i++) {
        this.path_size.push(path_list[i].getBoundingClientRect())
      }
    },
    generateVis() {
      this.getPathSize();
      this.vis_display = true;
      const _this = this;
      const vis_svg = d3.select("#mainsvg");
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
        let pie_tx, pie_ty = 0;
				const d_list = this.$store.state.d_list;
        data.forEach((it) => {
          ++render_cnt;
          const glyph = g.append("g").attr("class", "glyph");
          for (let i = 0; i < d_list.length; i++) {
            if (i != 1) {
              const part = glyph.append("path").attr("d", d_list[i]);
              if (i == 0) {
                const part_width = _this.path_size[i].width;
                const cur_scale = it.engineSize - 0.5
                part.attr("transform", `translate(${part_width * (1 - cur_scale)},0),scale(${cur_scale}, 1)`);
              }
            } else {
              pie_tx = _this.path_size[i].width * 0.5;
              pie_ty = _this.path_size[i].height * 0.5;
              glyph
                .append("clipPath")
                .attr("id", `clip-${render_cnt}`)
                .append("path")
                .attr("d", d_list[i])
                .attr("transform",`translate(${-pie_tx},${-pie_ty})`);
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
          const arc = d3.arc().innerRadius(0).outerRadius(Math.max(pie_tx, pie_ty));
          const pie_chart = glyph
            .append("g")
            .attr("class", "pie_area")
            .attr("clip-path", `url(#clip-${render_cnt})`)
            .attr("transform",`translate(${pie_tx},${pie_ty})`);
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
					const svg_width =  this.$store.state.svg_width;
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

  },
};
</script>

<style lang="less">
.tick > line {
  stroke: #c0c0bb;
}
</style>

<style lang="less" scoped>
</style>