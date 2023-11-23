function _1(md){return(
md`# HW04 Sunburst`
)}

function _artist(FileAttachment){return(
FileAttachment("artist.csv").csv()
)}

function _3(__query,FileAttachment,invalidation){return(
__query(FileAttachment("artist.csv"),{from:{table:"artist"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation)
)}

function _innerCircleQuestion(artist){return(
Object.keys(artist[0])[2]
)}

function _outerCircleQuestion(artist){return(
Object.keys(artist[0])[16]
)}

function _data(artist,innerCircleQuestion,outerCircleQuestion,buildHierarchy)
{
  // 提取內外圈問題的答案
  var innerCircleAnswer = artist.map(row => row[innerCircleQuestion]);
  var outerCircleAnswer = artist.map(row => row[outerCircleQuestion]);

  // 將內外圈答案結合，形成新的答案陣列
  var combinedAnswers = innerCircleAnswer.map((innerAns, index) => innerAns + '-' + outerCircleAnswer[index]);

  // 重新格式化答案，將其轉換為符合特定模式的陣列
  var reformattedAnswers = combinedAnswers.map(item => {
    const [prefix, values] = item.split('-');
    const splitValues = values.split(';').map(value => value.trim());
    return splitValues.map(value => `${prefix}-${value}`);
  }).reduce((acc, curr) => acc.concat(curr), []);

  // 計算每個重新格式化答案的出現次數
  var answerCounts = {};
  reformattedAnswers.forEach(reformattedAns => {
    answerCounts[reformattedAns] = (answerCounts[reformattedAns] || 0) + 1;
  });

  // 轉換為CSV格式的數據
  var csvData = Object.entries(answerCounts).map(([answer, count]) => [answer, String(count)]);
  
  // 建立包含層次結構的數據
  return buildHierarchy(csvData);
}


function _breadcrumb(d3,breadcrumbWidth,breadcrumbHeight,sunburst,breadcrumbPoints,color)
{
  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${breadcrumbWidth * 10} ${breadcrumbHeight}`)
    .style("font", "12px sans-serif")
    .style("margin", "5px");

  const g = svg
    .selectAll("g")
    .data(sunburst.sequence)
    .join("g")
    .attr("transform", (d, i) => `translate(${i * breadcrumbWidth}, 0)`);

    g.append("polygon")
      .attr("points", breadcrumbPoints)
      .attr("fill", d => color(d.data.name))
      .attr("stroke", "white");

    g.append("text")
      .attr("x", (breadcrumbWidth + 10) / 2)
      .attr("y", 15)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(d => {
        if(d.data.name === "減少包裝材及文宣印製") {
          return "減少包裝";
        }
        else if(d.data.name === "使用無毒媒材、再生材料、廢物利用素材等") {
          return "使用再生材料";
        }
        else if(d.data.name === "工作場所、活動展場的節約能源") {
          return "節約能源";
        }
        else if(d.data.name.length > 6)
        {
          return "其他答案";
        }
        return d.data.name;
      });

  svg
    .append("text")
    .text(sunburst.percentage > 0 ? sunburst.percentage + "%" : "")
    .attr("x", (sunburst.sequence.length + 0.5) * breadcrumbWidth)
    .attr("y", breadcrumbHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle");

  return svg.node();
}


function _sunburst(partition,data,d3,radius,innerCircleQuestion,outerCircleQuestion,width,color,arc,mousearc)
{
  const root = partition(data);
  const svg = d3.create("svg");
  // Make this into a view, so that the currently hovered sequence is available to the breadcrumb
  const element = svg.node();
  element.value = { sequence: [], percentage: 0.0 };

  // 使用foreignObject插入HTML
  const fo = svg
    .append("foreignObject")
    .attr("x", `${radius+50}px`)
    .attr("y", -10)
    .attr("width", radius*2)
    .attr("height", 350);
  
  const div = fo
    .append("xhtml:div")
    .style("color","#555")
    .style("font-size", "25px")
    .style("font-family", "Arial");

  d3.selectAll("div.tooltip").remove(); // clear tooltips from before
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", `tooltip`)
    .style("position", "absolute")
    .style("opacity", 0)

  const label = svg
    .append("text")
    .attr("text-anchor", "middle");
    //.style("visibility", "hidden");

  label//內圈問題
    .append("tspan")
    .attr("class", "question1")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", `${radius*2+50}px`)
    .attr("dy", "-6em")
    .attr("font-size", "2.5em")
    .attr("fill", "#BBB")
    .text(innerCircleQuestion);

  label//外圈問題
    .append("tspan")
    .attr("class", "question2")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", `${radius*2+50}px`)
    .attr("dy", "-4em")
    .attr("font-size", "2.5em")
    .attr("fill", "#BBB")
    .text(outerCircleQuestion);

  label//答案
    .append("tspan")
    .attr("class", "sequence")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", `${radius*2+50}px`)
    .attr("dy", "-1em")
    .attr("font-size", "2.5em")
    .text("");

  label//占比%數
    .append("tspan")
    .attr("class", "percentage")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", 0)
    .attr("dy", "0em")
    .attr("font-size", "5em")
    .attr("fill", "#555")
    .text("");

  label//數量
    .append("tspan")
    .attr("class", "dataValue")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dx", 0)
    .attr("dy", "2em")
    .attr("font-size", "2em")
    .attr("fill", "#555")
    .text("");

  svg
    .attr("viewBox", `${-radius} ${-radius} ${width*2.2} ${width}`)
    .style("max-width", `${width*2}px`)
    .style("font", "12px sans-serif");

  const path = svg
    .append("g")
    .selectAll("path")
    .data(
      root.descendants().filter(d => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    )
    .join("path")
    .attr("fill", d => color(d.data.name))
    .attr("d", arc);

  svg
    .append("g")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseleave", () => {
      path.attr("fill-opacity", 1);
      //tooltip.text("");
      //label.style("visibility", null);
      // Update the value of this view
      element.value = { sequence: [], percentage: 0.0 };
      element.dispatchEvent(new CustomEvent("input"));
    })
    .selectAll("path")
    .data(
      root.descendants().filter(d => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    )
    .join("path")
    .attr("d", mousearc)
    .on("mouseover", (_evt, d) => {
      if(d.data.name === "減少包裝材及文宣印製") {
        tooltip
        .style("opacity", 1)
        .html(`減少包裝<br><svg width="64px" height="64px" viewBox="0 0 80 80" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"><defs><style>.cls-1{fill:#efd5ab;}.cls-2{fill:#cead89;}.cls-3,.cls-4{fill:none;stroke:#000000;stroke-linecap:round;stroke-width:4px;}.cls-3{stroke-linejoin:round;}.cls-4{stroke-miterlimit:10;}</style></defs><title/><path class="cls-1" d="M63,21a4,4,0,0,0-4-4H21a4,4,0,0,0-4,4V66.5791a3.9938,3.9938,0,0,1-.0876.8323l-.8214,3.861A3,3,0,0,0,19.0015,75h41.997a3,3,0,0,0,2.91-3.7276l-.8214-3.861A3.9938,3.9938,0,0,1,63,66.5791Z"/><path class="cls-2" d="M63.9089,71.2724l-.8213-3.861A4.0006,4.0006,0,0,1,63,66.5791V21a4,4,0,0,0-4-4H53a4,4,0,0,1,4,4V66.5791a4.0006,4.0006,0,0,0,.0876.8323l.8213,3.861A3,3,0,0,1,54.9985,75h6A3,3,0,0,0,63.9089,71.2724Z"/><line class="cls-3" x1="17" x2="57" y1="67" y2="67"/><path class="cls-3" d="M32,23V13a8,8,0,0,1,8-8h0a8,8,0,0,1,8,8V23"/><path class="cls-3" d="M42,17H21a4,4,0,0,0-4,4V67l-1.0681,4.2725A3,3,0,0,0,18.8423,75H61.1577a3,3,0,0,0,2.91-3.7276L63,67V21a4,4,0,0,0-4-4H48.1"/><path class="cls-4" d="M52.6029,49.375l3.1483,5.4531a1.4483,1.4483,0,0,1-1.2543,2.1724L38.0034,57"/><polyline class="cls-3" points="42.003 53 38.003 57 42.003 61"/><path class="cls-4" d="M35.6077,35.1658l3.1484-5.4531a1.4483,1.4483,0,0,1,2.5085,0l8.2463,14.284"/><polyline class="cls-3" points="44.047 42.533 49.511 43.997 50.975 38.533"/><path class="cls-4" d="M31.8,56.9886H25.5031a1.4484,1.4484,0,0,1-1.2543-2.1725L32.496,40.5327"/><polyline class="cls-3" points="33.96 45.997 32.496 40.533 27.032 41.997"/></svg>`)
        .style("border-color", color(d.data.name));
      }
      else if(d.data.name === "使用無毒媒材、再生材料、廢物利用素材等") {
        tooltip
        .style("opacity", 1)
        .html(`再生材料<br><svg height="64px" width="64px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 512 512" xml:space="preserve">
<path style="fill:#009245;" d="M320.047,264.005c0,35.372-28.675,64.047-64.047,64.047s-64.047-28.675-64.047-64.047
	S256,151.924,256,151.924S320.047,228.633,320.047,264.005z"/>
<polygon style="fill:#D9E021;" points="256,151.924 288.023,199.959 256,239.988 223.977,199.959 "/>
<g>
	<polygon style="fill:#8CC63F;" points="312.04,239.988 256,296.029 256,239.988 296.029,199.959 	"/>
	<polygon style="fill:#8CC63F;" points="199.959,239.988 256,296.029 256,239.988 215.97,199.959 	"/>
</g>
<path style="fill:#009245;" d="M408.111,256c0,84.008-68.102,152.111-152.111,152.111l40.03,48.035L256,504.181
	c137.067,0,248.181-111.115,248.181-248.181l-48.035-40.03L408.111,256z"/>
<path style="fill:#39B54A;" d="M256,103.889c84.008,0,152.111,68.103,152.111,152.111l48.035-40.03L504.181,256
	C504.181,118.933,393.066,7.819,256,7.819l-40.03,48.035L256,103.889z"/>
<path style="fill:#8CC63F;" d="M103.889,256c0-84.008,68.103-152.111,152.111-152.111l-40.03-48.035L256,7.819
	C118.933,7.819,7.819,118.934,7.819,256l48.035,40.03L103.889,256z"/>
<path style="fill:#D9E021;" d="M256,408.111c-84.008,0-152.111-68.102-152.111-152.111l-48.035,40.03L7.819,256
	c0,137.067,111.115,248.181,248.181,248.181l40.03-48.035L256,408.111z"/>
<polygon style="fill:#8CC63F;" points="223.977,408.301 264.005,456.256 223.977,504.21 256,504.21 296.029,456.256 256,408.301 "/>
<polygon style="fill:#D9E021;" points="408.301,288.023 456.256,247.994 504.21,288.023 504.21,256 456.256,215.97 408.301,256 "/>
<polygon style="fill:#009245;" points="288.023,103.893 247.994,55.938 288.023,7.983 256,7.983 215.97,55.938 256,103.893 "/>
<polygon style="fill:#39B54A;" points="103.893,223.977 55.938,264.005 7.983,223.977 7.983,256 55.938,296.029 103.893,256 "/>
<path d="M437.02,74.98C388.667,26.628,324.38,0,256,0S123.333,26.628,74.98,74.98C26.628,123.333,0,187.62,0,256
	s26.628,132.667,74.98,181.02C123.332,485.372,187.62,512,256,512s132.667-26.628,181.02-74.98C485.372,388.668,512,324.38,512,256
	S485.371,123.333,437.02,74.98z M495.753,238.799l-39.606-33.005l-41.017,34.18c-7.945-79.482-74.326-142.004-155.429-143.856
	l-33.553-40.264l33.477-40.173c62.847,0.924,121.795,25.814,166.337,70.356C467.282,127.358,491.697,181.074,495.753,238.799z
	 M256,400.293c-79.563,0-144.293-64.729-144.293-144.293S176.437,111.707,256,111.707S400.293,176.437,400.293,256
	S335.563,400.293,256,400.293z M86.038,86.038c41.32-41.319,95.036-65.735,152.761-69.791l-33.005,39.606l34.18,41.017
	c-79.482,7.945-142.004,74.326-143.856,155.429l-40.264,33.553l-40.173-33.477C16.605,189.529,41.495,130.581,86.038,86.038z
	 M16.247,273.201l39.606,33.005l41.017-34.18c7.945,79.483,74.326,142.004,155.429,143.857l33.553,40.263l-33.477,40.173
	c-62.847-0.924-121.795-25.814-166.337-70.356C44.718,384.642,20.303,330.926,16.247,273.201z M425.962,425.962
	c-41.32,41.319-95.036,65.735-152.761,69.791l33.005-39.606l-34.18-41.017c79.483-7.945,142.004-74.326,143.857-155.429
	l40.263-33.553l40.173,33.477C495.395,322.471,470.505,381.419,425.962,425.962z"/>
<path d="M327.865,264.005c0-37.135-59.122-109.018-65.864-117.092L256,139.724l-6.002,7.189
	c-6.741,8.074-65.864,79.957-65.864,117.092c0,36.839,27.866,67.274,63.622,71.379v24.961h15.637v-24.854
	C299.56,331.779,327.865,301.136,327.865,264.005z M263.394,173.838c6.22,8.179,13.191,17.79,19.887,27.812l-19.887,19.888V173.838z
	 M247.757,220.688l-19.034-19.035c6.389-9.565,13.035-18.764,19.034-26.694V220.688z M247.757,242.802v33.927l-39.755-39.755
	c3.354-6.983,7.509-14.396,12.078-21.849L247.757,242.802z M263.394,243.652l28.531-28.531c4.568,7.453,8.724,14.866,12.077,21.85
	l-40.608,40.608L263.394,243.652L263.394,243.652z M199.772,264.005c0-3.282,0.7-7.075,1.924-11.221l46.059,46.059v20.781
	C220.647,315.623,199.772,292.21,199.772,264.005z M263.394,319.732v-20.04l46.91-46.91c1.224,4.146,1.923,7.941,1.923,11.223
	C312.228,292.502,290.914,316.099,263.394,319.732z"/>
</svg>`)
        .style("border-color", color(d.data.name));
      }
      else if(d.data.name === "工作場所、活動展場的節約能源") {
        tooltip
        .style("opacity", 1)
        .html(`節約能源<br><svg height="64px" width="64px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 512.006 512.006" xml:space="preserve">
<circle style="fill:#FFE356;" cx="256.003" cy="256.003" r="256.003"/>
<path style="fill:#FF7069;" d="M184.47,222.192h143.066v71.303c0,31.056-25.407,56.462-56.462,56.462h-30.135
	c-31.056,0-56.462-25.407-56.462-56.462v-71.303H184.47z"/>
<polygon style="fill:#FFFFFF;" points="184.47,222.192 327.536,222.192 327.536,241.883 184.47,241.883 "/>
<path style="fill:#5FDC68;" d="M328.977,122.467c7.502-94.699-127.027-135.576-166.45-0.581c0,0,23.148-23.414,43.977-19.788
	c28.616,4.983,48.076,67.174,122.479,20.369H328.977z"/>
<path style="fill:#56BF5D;" d="M173.504,93.198c-4.172,8.513-7.871,18.05-10.978,28.682c0,0,23.148-23.414,43.977-19.788
	c7.865,1.368,15.04,7.066,22.857,13.624l0,0c-4.862-8.447-30.717-35.155-55.851-22.524L173.504,93.198z"/>
<path style="fill:#5D718F;" d="M340.373,127.886l-4.88,4.432c-29.245-38.146-98.017-91.563-139.112-53.017
	C239.17,35.082,311.939,88.523,340.373,127.886z"/>
<path style="fill:#5FDC68;" d="M109.788,244.832c-85.768,40.853-53.901,177.791,82.723,144.441c0,0-31.855-8.344-39.121-28.192
	C143.399,333.803,187.528,285.854,109.788,244.832z"/>
<path style="fill:#56BF5D;" d="M162.182,394.11c9.458-0.642,19.564-2.21,30.329-4.838c0,0-31.855-8.344-39.121-28.192
	c-2.743-7.496-1.405-16.56,0.375-26.605l0,0C148.885,342.91,138.682,378.652,162.182,394.11z"/>
<path style="fill:#5D718F;" d="M108.777,232.249l6.279,2.01c-18.413,44.401-30.287,130.666,23.645,146.984
	C79.011,366.294,88.911,276.553,108.777,232.249z"/>
<path style="fill:#5FDC68;" d="M326.428,378.434c78.26,53.847,180.922-42.221,83.728-143.865c0,0,8.701,31.758-4.85,47.979
	C386.681,304.836,323.092,290.595,326.428,378.434z"/>
<path style="fill:#56BF5D;" d="M429.513,258.419c-5.286-7.871-11.698-15.846-19.358-23.85c0,0,8.701,31.758-4.85,47.979
	c-5.116,6.128-13.636,9.494-23.233,12.982l0,0c9.748,0.006,45.8-9.028,47.434-37.105L429.513,258.419z"/>
<path style="fill:#5D718F;" d="M316.038,385.591l-1.399-6.442c47.658-6.255,128.298-39.103,115.468-93.967
	C447.006,344.345,364.344,380.644,316.038,385.591z"/>
<path style="fill:#ECF0F1;" d="M241.078,349.855h29.851v19.582c0,2.337-1.907,4.238-4.238,4.238h-21.368
	c-2.337,0-4.238-1.907-4.238-4.238v-19.582H241.078z"/>
<path style="fill:#6C7678;" d="M250.784,373.681h10.433v138.253c-1.738,0.03-3.476,0.067-5.219,0.067
	c-1.744,0-3.482-0.03-5.219-0.067V373.681H250.784z"/>
<path style="fill:#FFFFFF;" d="M232.104,171.736v50.456h-25.643v-50.456C206.461,154.776,232.104,154.776,232.104,171.736z"/>
<path style="fill:#ECF0F1;" d="M227.242,171.736v50.456h4.862v-50.456c0-9.561-8.144-13.733-15.252-12.516
	C222.356,160.159,227.242,164.331,227.242,171.736z"/>
<path style="fill:#FFFFFF;" d="M305.539,171.736v50.456h-25.643v-50.456C279.896,154.776,305.539,154.776,305.539,171.736z"/>
<path style="fill:#ECF0F1;" d="M300.676,171.736v50.456h4.862v-50.456c0-9.561-8.144-13.733-15.252-12.516
	C295.79,160.159,300.676,164.331,300.676,171.736z"/>
</svg>`)
        .style("border-color", color(d.data.name));
      }
      else
      {
        tooltip
        .style("opacity", 1)
        .html(`${d.data.name}`)
        .style("border-color", color(d.data.name));
      }
    })
    .on("mousemove", (evt, d) => {
      tooltip
        .style("top", evt.pageY - 10 + "px")
        .style("left", evt.pageX + 10 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    })
    .on("mouseenter", (event, d) => {
      // Get the ancestors of the current segment, minus the root

      //introduce
      if(d.data.name === "北部")
      {
        div
          .html("<ul><li>定義：台灣北部。</li><li>區域：基隆、台北、新北、桃園、新竹</li></ul>");
      }
      else if(d.data.name === "中部")
      {
        div
          .html("<ul><li>定義：台灣中部。</li><li>區域：苗栗、台中、南投、彰化、雲林</li></ul>");
      }
      else if(d.data.name === "南部")
      {
        div
          .html("<ul><li>定義：台灣南部。</li><li>區域：嘉義、台南、高雄、屏東</li></ul>");
      }
        else if(d.data.name === "東部")
      {
        div
          .html("<ul><li>定義：台灣東部。</li><li>區域：宜蘭、花蓮、台東</li></ul>");
      }
      else
      {
        div.html("");
      }
      
      //dataValue
      label
        .style("visibility", null)
        .select(".dataValue")
        .text("計數："+d.value);
      
      //question
      if(d.depth-1 === 0)
      {
        label
          .style("visibility", null)
          .select(".question1")
          .attr("fill", "#000");
        label
          .style("visibility", null)
          .select(".question2")
          .attr("fill", "#BBB");
      }
      else if(d.depth-1 === 1)
      {
        label
          .style("visibility", null)
          .select(".question1")
          .attr("fill", "#BBB");
        label
          .style("visibility", null)
          .select(".question2")
          .attr("fill", "#000");
      }
      
      const sequence = d
        .ancestors()
        .reverse()
        .slice(1);
      // Highlight the ancestors
      path.attr("fill-opacity", node =>
        sequence.indexOf(node) >= 0 ? 1.0 : 0.3
      );
      label
        .style("visibility", null)
        .select(".sequence")
        //.style("visibility", "visible")
        .attr("fill", sequence => color(d.data.name))
        .text(d.data.name);
      const percentage = ((100 * d.value) / root.value).toPrecision(3);
      label
        .style("visibility", null)
        .select(".percentage")
        .text(percentage + "%");

      /*tooltip
        .text(d.data.name);*/
      
      // Update the value of this view with the currently hovered sequence and percentage
      element.value = { sequence, percentage };
      element.dispatchEvent(new CustomEvent("input"));
    });     

  return element;
}


function _9(htl){return(
htl.html`<h2>結論</h2>
<h3>從上圖中，可以看出：
  <ul>
    <li>在此問卷中，在北部的藝術工作者填寫較多</li>
    <li>台灣的藝術工作者大多採取減少包裝，而在國外藝術工作者則採取再生能源來減少碳排放量</li>
    <li>在北部的藝術工作者採用最多為減少包裝為15%，其次為再生材料11.5%</li>
  </ul>
</h3>`
)}

function _buildHierarchy(){return(
function buildHierarchy(csv) {
  // Helper function that transforms the given CSV into a hierarchical format.
  const root = { name: "root", children: [] };
  for (let i = 0; i < csv.length; i++) {
    const sequence = csv[i][0];
    const size = +csv[i][1];
    if (isNaN(size)) {
      // e.g. if this is a header row
      continue;
    }
    const parts = sequence.split("-");
    let currentNode = root;
    for (let j = 0; j < parts.length; j++) {
      const children = currentNode["children"];
      const nodeName = parts[j];
      let childNode = null;
      if (j + 1 < parts.length) {
        // Not yet at the end of the sequence; move down the tree.
        let foundChild = false;
        for (let k = 0; k < children.length; k++) {
          if (children[k]["name"] == nodeName) {
            childNode = children[k];
            foundChild = true;
            break;
          }
        }
        // If we don't already have a child node for this branch, create it.
        if (!foundChild) {
          childNode = { name: nodeName, children: [] };
          children.push(childNode);
        }
        currentNode = childNode;
      } else {
        // Reached the end of the sequence; create a leaf node.
        childNode = { name: nodeName, value: size };
        children.push(childNode);
      }
    }
  }
  return root;
}
)}

function _width(){return(
640
)}

function _radius(width){return(
width / 2
)}

function _partition(d3,radius){return(
data =>
  d3.partition().size([2 * Math.PI, radius * radius])(
    d3
      .hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value)
  )
)}

function _mousearc(d3,radius){return(
d3
  .arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .innerRadius(d => Math.sqrt(d.y0))
  .outerRadius(radius)
)}

function _color(d3){return(
d3
  .scaleOrdinal()
  .domain(["北部", "中部", "南部", "東部", "國外", "減少包裝材及文宣印製", "使用無毒媒材、再生材料、廢物利用素材等", "工作場所、活動展場的節約能源"])
  .range(["#91B493", "#516E41", "#7BA23F", "#6fb971", "#A8D8B9", "#69B0AC", "#33A6B8", "#3A8FB7"])
)}

function _arc(d3,radius){return(
d3
  .arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .padAngle(1 / radius)
  .padRadius(radius)
  .innerRadius(d => Math.sqrt(d.y0))
  .outerRadius(d => Math.sqrt(d.y1) - 1)
)}

function _breadcrumbWidth(){return(
75
)}

function _breadcrumbHeight(){return(
30
)}

function _breadcrumbPoints(breadcrumbWidth,breadcrumbHeight){return(
function breadcrumbPoints(d, i) {
  const tipWidth = 10;
  const points = [];
  points.push("0,0");
  points.push(`${breadcrumbWidth},0`);
  points.push(`${breadcrumbWidth + tipWidth},${breadcrumbHeight / 2}`);
  points.push(`${breadcrumbWidth},${breadcrumbHeight}`);
  points.push(`0,${breadcrumbHeight}`);
  if (i > 0) {
    // Leftmost breadcrumb; don't include 6th vertex.
    points.push(`${tipWidth},${breadcrumbHeight / 2}`);
  }
  return points.join(" ");
}
)}

function _20(htl){return(
htl.html`<style>
.tooltip {
  padding: 8px 12px;
  color: white;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,0.5);
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.2);
  pointer-events: none;
  transform: translate(-50%, -100%);
  font-family: "Helvetica", sans-serif;
  background: rgba(20,10,30,0.6);
  transition: 0.2s opacity ease-out, 0.1s border-color ease-out;
}
</style>`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["artist.csv", {url: new URL("./artist.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("artist")).define("artist", ["FileAttachment"], _artist);
  main.variable(observer()).define(["__query","FileAttachment","invalidation"], _3);
  main.variable(observer("innerCircleQuestion")).define("innerCircleQuestion", ["artist"], _innerCircleQuestion);
  main.variable(observer("outerCircleQuestion")).define("outerCircleQuestion", ["artist"], _outerCircleQuestion);
  main.variable(observer("data")).define("data", ["artist","innerCircleQuestion","outerCircleQuestion","buildHierarchy"], _data);
  main.variable(observer("breadcrumb")).define("breadcrumb", ["d3","breadcrumbWidth","breadcrumbHeight","sunburst","breadcrumbPoints","color"], _breadcrumb);
  main.variable(observer("viewof sunburst")).define("viewof sunburst", ["partition","data","d3","radius","innerCircleQuestion","outerCircleQuestion","width","color","arc","mousearc"], _sunburst);
  main.variable(observer("sunburst")).define("sunburst", ["Generators", "viewof sunburst"], (G, _) => G.input(_));
  main.variable(observer()).define(["htl"], _9);
  main.variable(observer("buildHierarchy")).define("buildHierarchy", _buildHierarchy);
  main.variable(observer("width")).define("width", _width);
  main.variable(observer("radius")).define("radius", ["width"], _radius);
  main.variable(observer("partition")).define("partition", ["d3","radius"], _partition);
  main.variable(observer("mousearc")).define("mousearc", ["d3","radius"], _mousearc);
  main.variable(observer("color")).define("color", ["d3"], _color);
  main.variable(observer("arc")).define("arc", ["d3","radius"], _arc);
  main.variable(observer("breadcrumbWidth")).define("breadcrumbWidth", _breadcrumbWidth);
  main.variable(observer("breadcrumbHeight")).define("breadcrumbHeight", _breadcrumbHeight);
  main.variable(observer("breadcrumbPoints")).define("breadcrumbPoints", ["breadcrumbWidth","breadcrumbHeight"], _breadcrumbPoints);
  main.variable(observer()).define(["htl"], _20);
  return main;
}
