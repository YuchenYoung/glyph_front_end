<template>
  <div class="block-area" style="text-align: center">
    <p class="title" style="margin-bottom: 6px;">Edit</p>
    <div class="edit-area" style="">
      <el-scrollbar class="horizon-scroll">
        <div v-for="(it, idx) in maps" :key="idx" class="edit-item" :style="{'border-color': it.locked ? '#e56240': '#e4ae40'}">
          <el-tooltip class="item" effect="light" :disabled="!it.toTip" :content="it.tip" placement="top">
            <div class="prop-box" @click="selectMap($event, it, idx)" :style="{'background-color': it.selected ? '#e4ae40' : 'white'}">
              <div class="prop-text" :style="{'color': it.selected ? 'white' : 'black'}">
                <span>{{ it.dis_prop }}</span>
              </div>
              <svg v-if="it.dtype != 'category'" width="32" height="32" viewBox="0 0 39 39" class="type-icon" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.5625 39H2.4375C1.79103 39 1.17105 38.7432 0.713927 38.2861C0.256807 37.829 0 37.209 0 36.5625V2.4375C0 1.79103 0.256807 1.17105 0.713927 0.713927C1.17105 0.256807 1.79103 0 2.4375 0L36.5625 0C37.209 0 37.829 0.256807 38.2861 0.713927C38.7432 1.17105 39 1.79103 39 2.4375V36.5625C39 37.209 38.7432 37.829 38.2861 38.2861C37.829 38.7432 37.209 39 36.5625 39ZM36.5625 4.875C36.5625 4.22853 36.3057 3.60855 35.8486 3.15143C35.3915 2.69431 34.7715 2.4375 34.125 2.4375H4.875C4.22853 2.4375 3.60855 2.69431 3.15143 3.15143C2.69431 3.60855 2.4375 4.22853 2.4375 4.875V34.125C2.4375 34.7715 2.69431 35.3915 3.15143 35.8486C3.60855 36.3057 4.22853 36.5625 4.875 36.5625H34.125C34.7715 36.5625 35.3915 36.3057 35.8486 35.8486C36.3057 35.3915 36.5625 34.7715 36.5625 34.125V4.875ZM31.6875 29.25H26.8125C26.166 29.25 25.546 28.9932 25.0889 28.5361C24.6318 28.079 24.375 27.459 24.375 26.8125C24.375 26.166 24.6318 25.546 25.0889 25.0889C25.546 24.6318 26.166 24.375 26.8125 24.375H29.25V21.9375H26.8125C26.166 21.9375 25.546 21.6807 25.0889 21.2236C24.6318 20.7665 24.375 20.1465 24.375 19.5C24.375 18.8535 24.6318 18.2335 25.0889 17.7764C25.546 17.3193 26.166 17.0625 26.8125 17.0625H29.25V14.625H26.8125C26.166 14.625 25.546 14.3682 25.0889 13.9111C24.6318 13.454 24.375 12.834 24.375 12.1875C24.375 11.541 24.6318 10.921 25.0889 10.4639C25.546 10.0068 26.166 9.75 26.8125 9.75H31.6875C32.334 9.75 32.954 10.0068 33.4111 10.4639C33.8682 10.921 34.125 11.541 34.125 12.1875V26.8125C34.125 27.459 33.8682 28.079 33.4111 28.5361C32.954 28.9932 32.334 29.25 31.6875 29.25ZM19.5 24.375C20.1465 24.375 20.7665 24.6318 21.2236 25.0889C21.6807 25.546 21.9375 26.166 21.9375 26.8125C21.9375 27.459 21.6807 28.079 21.2236 28.5361C20.7665 28.9932 20.1465 29.25 19.5 29.25H14.625C13.9785 29.25 13.3585 28.9932 12.9014 28.5361C12.4443 28.079 12.1875 27.459 12.1875 26.8125V19.5C12.1875 18.8535 12.4443 18.2335 12.9014 17.7764C13.3585 17.3193 13.9785 17.0625 14.625 17.0625H17.0625V14.625H14.625C13.9785 14.625 13.3585 14.3682 12.9014 13.9111C12.4443 13.454 12.1875 12.834 12.1875 12.1875C12.1875 11.541 12.4443 10.921 12.9014 10.4639C13.3585 10.0068 13.9785 9.75 14.625 9.75H19.5C20.1465 9.75 20.7665 10.0068 21.2236 10.4639C21.6807 10.921 21.9375 11.541 21.9375 12.1875V19.5C21.9375 20.1465 21.6807 20.7665 21.2236 21.2236C20.7665 21.6807 20.1465 21.9375 19.5 21.9375H17.0625V24.375H19.5ZM7.3125 29.25C6.66603 29.25 6.04605 28.9932 5.58893 28.5361C5.13181 28.079 4.875 27.459 4.875 26.8125V12.1875C4.875 11.541 5.13181 10.921 5.58893 10.4639C6.04605 10.0068 6.66603 9.75 7.3125 9.75C7.95897 9.75 8.57895 10.0068 9.03607 10.4639C9.49319 10.921 9.75 11.541 9.75 12.1875V26.8125C9.75 27.459 9.49319 28.079 9.03607 28.5361C8.57895 28.9932 7.95897 29.25 7.3125 29.25Z" fill="black"/>
              </svg>
              <svg v-if="it.dtype == 'category'" width="32" height="32" viewBox="0 0 39 39" class="type-icon" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="36.9333" height="36.9333" rx="1" stroke="black" stroke-width="2" fill="none"/>
                <path d="M7.80901 21.5557V21.1619V19.9058H9.46957V19.8948H10.7253H11.1195H12.3862V21.1616V21.5554V23.2052H14.4406V21.5557V21.1619V19.8951V19.5014V18.2453V17.8405V16.5847V16.1906V14.5297H12.78V12.8584H11.1191V11.2192H9.07512V12.8801H7.41455V14.5407H5.76501V16.1906V16.5847V17.8511V18.2453V19.501V19.9058V21.1619V21.5557V23.2056H7.80901V21.5557ZM7.80901 16.5847V16.1906V14.9345H9.45889V13.2736H10.7253V14.9128H12.3866V16.1906V16.5847V17.8405H10.7253V17.8511H9.46957H9.07545H7.80901V16.5847ZM17.1724 23.2056H18.4388H18.8329H20.0884H20.4828H22.144V21.5557H23.8043V19.8948V19.501V17.8401H22.144V16.5844H23.8043V14.9341V14.5293V12.8798H22.144V11.2189H20.4828H20.0884H18.8329H18.4388H17.1724H16.7779H15.1284V12.8798V13.2843V14.5404V14.9341V16.1902V16.595V17.8508V18.2449V19.5114V19.9055V21.1616V21.5554V23.2052H16.7779H17.1724V23.2056ZM17.1724 14.9345V14.5407V13.2846V13.2736H18.4388H18.8329H20.0884H20.4828H21.7492V14.5297V14.9345V16.1906H20.4828H20.0884H18.8329H18.4388H17.1724V14.9345ZM17.1724 19.9058V19.5117V18.2453H18.4388H18.8329H20.0884H20.4828H21.7492V19.501V19.8948V21.1616H20.4828H20.0884H18.8329H18.4388H17.1724V19.9058ZM26.1416 21.5557H24.492V19.8948V19.501V18.2453V17.8511V16.5847V16.1906V14.9345V14.5407V12.8801H26.1419V11.2192H27.8025H28.1969H29.4524H29.8462H31.5074V12.8801H33.1679V14.9345H31.1133V13.2736H29.8462H29.4524H28.1969H27.8025H26.5357V14.5407V14.9345V16.1906V16.5847V17.8511V18.2453V19.501H26.5467V21.1619H27.8025H28.1969H29.4524H29.8575H31.1133V19.501H33.1679V21.5557H31.5074V23.2056H29.8575H29.4524H28.1969H27.8025H26.1419V21.5557H26.1416ZM7.47029 24.0232V25.8686H5.62451V24.0232H7.47029ZM7.47029 25.8686H9.31572V27.7144H7.47029V25.8686ZM11.1612 24.0232V25.8686H9.31572V24.0232H11.1612ZM11.1612 25.8686H13.0069V27.7144H11.1612V25.8686ZM14.8524 24.0232V25.8686H13.0066V24.0232H14.8524ZM14.8524 25.8686H16.6978V27.7144H14.8524V25.8686ZM18.5433 24.0232V25.8686H16.6978V24.0232H18.5433ZM18.5433 25.8686H20.389V27.7144H18.5433V25.8686ZM22.2348 24.0232V25.8686H20.389V24.0232H22.2348ZM22.2348 25.8686H24.0802V27.7144H22.2348V25.8686ZM25.9257 24.0232V25.8686H24.0802V24.0232H25.9257ZM25.9257 25.8686H27.7715V27.7144H25.9257V25.8686ZM29.6169 24.0232V25.8686H27.7715V24.0232H29.6169ZM33.3081 24.0232V25.8686H31.4627V24.0232H33.3081ZM29.6169 25.8686H31.4623V27.7144H29.6169V25.8686Z" fill="black"/>
              </svg>
            </div>
          </el-tooltip>
          <div style="margin-top: 10px;">
            <div style="width: 72px; display: inline-block;">
              <span style="font-size: 15px">Element</span>
            </div>
            <el-select v-model="it.element" size="mini" @change="changeMap($event, it)" style="width: 90px; margin-left: 4px">
              <el-option v-for="item in elements" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
          </div>
          <div style="margin-top: 8px;">
            <div style="width: 72px; display: inline-block;">
              <span style="font-size: 15px">Encoding</span>
            </div>
            <el-select v-model="it.type" size="mini" style="width: 90px; margin-left: 4px">
              <el-option v-for="item in encodings" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
          </div>
        </div>
        <div style="width: 17px; height: 1px; display: inline-block"></div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
export default {
  props: ['encoding', 'lastProps', 'lockedProps'],
  data() {
    return {
      maps: [],
      elements: ['none'],
      encodings: ['none', 'x', 'y', 'color', 'alpha', 'length', 'size', 'flower', 'pie', 'heatmap', 'star']
    }
  },
  created() {
    const props = this.$store.state.props;
    const groups = this.$store.state.group_props;
    const mapped_props = [];
    // const last_props = this.lastProps;
    const locked_props = this.lockedProps;
    const data_type = this.$store.state.data_type;
    const img = this.$store.state.selected_img;
    const prop_similarity = this.$store.state.prop_similarity;
    for (let i = 0; i < img.d_list.length; i++) {
      this.elements.push(i);
    }
    let group_cnt = 0;
    for (let i = 0; i < this.encoding.length; i++) {
      let prop = this.encoding[i].prop;
      let props = [];
      let tip = "";
      if (this.encoding[i].is_group) {
        prop = `group${group_cnt}`;
        props = this.encoding[i].props;
        tip = this.encoding[i].props.join(', ');
        group_cnt++;
      }
      if (prop != 'none') {
        // let in_last = false;
        let in_locked = false;
        // if (last_props.includes(prop)) in_last = true;
        if (locked_props.includes(prop)) in_locked = true;
        this.maps.push({
          prop: prop,
          props: props,
          similarity: prop_similarity[prop],
          element: this.encoding[i].element,
          type: this.encoding[i].encoding,
          isGroup: this.encoding[i].is_group,
          toTip: this.encoding[i].is_group,
          tip: tip,
          selected: false,
          locked: in_locked,
          dtype: data_type[prop]
        });
        mapped_props.push(prop)
      }
    }
    let group_props = [];
    groups.forEach(it => { group_props = group_props.concat(it); })
    const single_props = props.filter(d => (!group_props.includes(d) && !mapped_props.includes(d)));
    single_props.forEach(it => {
      let in_locked = false;
      if (locked_props.includes(it)) in_locked = true;
      this.maps.push({
        prop: it,
        props: [],
        similarity: prop_similarity[it],
        element: "none",
        type: "none",
        selected: false,
        isGroup: false,
        toTip: false,
        tip: "",
        locked: in_locked,
        dtype: data_type[it]
      });
    });
    for (let i = 0; i < groups.length; i++) {
      if (mapped_props.includes(`group${i}`)) continue;
      let name = `group${i}`
      this.maps.push({
        prop: name,
        props: groups[i],
        similarity: prop_similarity[name],
        element: "none",
        type: "none",
        selected: false,
        isGroup: true,
        toTip: true,
        tip: groups[i].join(', '),
        locked: locked_props.includes(name),
        dtype: data_type[name]
      });
    }
    this.maps.sort((a, b) => {
      return b['similarity'] - a['similarity']
    })
    this.maps.forEach(it => {
      it.dis_prop = it.prop;
      if (it.prop.length > 28) {
        it.dis_prop = it.prop.substr(0, 25) + '...';
        it.toTip = true;
        it.tip = it.prop;
      }
    });
  },
  methods: {
    selectMap(event, map) {
      map.selected = !map.selected;
    },
    changeMap(val, obj) {
      obj.selected = true;
    }
  }
};
</script>

<style lang="less" scoped>

.edit-area {
  height: 150px; 
  width: 94%; 
  margin-left: 3%; 
  margin-right: 25px; 
  white-space: nowrap; 
  // overflow-x: scroll;
}

.edit-item {
  height: 135px; 
  width: 180px; 
  margin-right: 10px; 
  display: inline-block; 
  border: 3px solid #e4ae40; 
  border-radius: 6px;
}

.prop-box {
  border: 1px solid; 
  border-radius: 4px;
  height: 40px; 
  width: 160px; 
  margin-left: 10px; 
  margin-top: 10px; 
  white-space: normal; 
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  // justify-content: center
}

.prop-text {
  width: 120px;
  // display: flex;
  // align-items: center;
  // justify-content: center
}

.type-icon {
  margin-left: 2px;
}

</style>

<style lang="less">
.el-tooltip__popper.is-light {
  max-width: 200px;
}
</style>
