function _1(md){return(
md`# HW2 Strong baseline (2pt)`
)}

function _data(FileAttachment){return(
FileAttachment("data.json").json()
)}

function _yCounts(){return(
[]
)}

function _Constellations(data){return(
data.map(item => item.Constellation)
)}

function _5(yCounts,Constellations,data)
{
  yCounts.length = 0; //將yCounts清空
  var minCons = Math.min(...Constellations); //最早出生年
  var maxCons = Math.max(...Constellations); //最晚出生年
  for (var y=minCons; y<=maxCons; y++) { 
    //所有年份都建立兩個Object，一個存放男性資料，一個存放女性資料
    yCounts.push({Constellations:y, gender:"male", count:0}); 
    //Object包含：1. 出生年，2.男性，3.人數(設為0)
    yCounts.push({Constellations:y, gender:"female", count:0}); 
    //Object包含：1. 出生年，2.女性，3.人數(設為0)
  }
  data.forEach (x=> {
    var i = (x.Constellation-minCons)*2 + (x.Gender== "男" ? 0 : 1); 
    yCounts[i].count++;
    //讀取data array，加總每個年份出生的人
  })
  return yCounts
}


function _6(Plot,yCounts){return(
Plot.plot({
  grid: true,
  y: {label: "count"},
  x: {
    tickFormat: (d) => ({
      0: "牡羊座", 
      1: "金牛座", 
      2: "雙子座", 
      3: "巨蟹座", 
      4: "獅子座", 
      5: "處女座", 
      6: "天秤座", 
      7: "天蠍座", 
      8: "射手座", 
      9: "魔羯座", 
      10: "水瓶座", 
      11: "雙魚座", 
    })[d]
  },
  marks: [
    Plot.ruleY([0]),
    Plot.barY(yCounts, {x: "Constellations", y: "count", fill:"gender",tip: {
    format: {
      x: (d) =>  ({
      0: "牡羊座", 
      1: "金牛座", 
      2: "雙子座", 
      3: "巨蟹座", 
      4: "獅子座", 
      5: "處女座", 
      6: "天秤座", 
      7: "天蠍座", 
      8: "射手座", 
      9: "魔羯座", 
      10: "水瓶座", 
      11: "雙魚座", 
    })[d]
      
    }
  }}),
  ],
  
})
)}

function _7(Plot,data){return(
Plot.plot({  
  width:750,
  y: {grid: true, label: "count"}, 
  x: {label: "Constellations"},  
  x: {
    tickFormat: (d) => ({
      0: "牡羊座", 
      1: "金牛座", 
      2: "雙子座", 
      3: "巨蟹座", 
      4: "獅子座", 
      5: "處女座", 
      6: "天秤座", 
      7: "天蠍座", 
      8: "射手座", 
      9: "魔羯座", 
      10: "水瓶座", 
      11: "雙魚座", 
    })[d]
  },
   marks: [    
    Plot.rectY(data, Plot.binX({y: "count"}, {x: "Constellation", interval:1, fill: "Gender", tip:{
    format: {
      x: (d) =>  ({
      0: "牡羊座", 
      1: "金牛座", 
      2: "雙子座", 
      3: "巨蟹座", 
      4: "獅子座", 
      5: "處女座", 
      6: "天秤座", 
      7: "天蠍座", 
      8: "射手座", 
      9: "魔羯座", 
      10: "水瓶座", 
      11: "雙魚座", 
    })[d]
      
    }}})),

    Plot.gridY({ interval: 1, stroke: "none", strokeOpacity: 0.5 }) 
  ],
   
})
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["data.json", {url: new URL("../data.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("yCounts")).define("yCounts", _yCounts);
  main.variable(observer("Constellations")).define("Constellations", ["data"], _Constellations);
  main.variable(observer()).define(["yCounts","Constellations","data"], _5);
  main.variable(observer()).define(["Plot","yCounts"], _6);
  main.variable(observer()).define(["Plot","data"], _7);
  return main;
}
