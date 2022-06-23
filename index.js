const svg = d3.select(".canvas");
const margin = {
  top: 20,
  bottom: 100,
  left: 100,
  right: 20,
};

const graphWidth = 300 - margin.left - margin.right;
const graphHeight = 300 - margin.top - margin.bottom;
console.log(graphHeight);

const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const xAxisGroup = graph
  .append("g")
  .attr("transform", `translate(0,${graphHeight})`);
const yAxisGroup = graph.append("g");

const y = d3.scaleLinear().range([graphHeight, 0]);
const x = d3
  .scaleBand()
  .paddingInner(0.2)
  .paddingOuter(0.2)
  .range([0, graphWidth]);

const xAxis = d3.axisBottom(x);
const yAxis = d3
  .axisLeft(y)
  .ticks(3)
  .tickFormat((d) => d + " orders");

function update(data) {
  const t = d3.transition().duration(1500);

  let max = d3.max(data, (d) => d.orders);
  console.log(max);
  y.domain([0, max]);
  x.domain(data.map((d) => d.name));

  const rects = graph.selectAll("rect").data(data);

  rects
    .data(data)
    .attr("x", (d) => x(d.name))
    .attr("width", x.bandwidth())
    .attr("fill", "orange");
  // .transition(t);
  // .attr("y", (d) => y(d.orders))
  // .attr("height", (d) => graphHeight - y(d.orders))

  rects
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.name))
    .attr("width", x.bandwidth())
    .attr("y", graphHeight)
    .attr("height", 0)
    .attr("fill", "orange")
    .merge(rects)

    .transition(t)
    .attrTween("width", widthTween)
    .attr("y", (d) => y(d.orders))
    .attr("height", (d) => graphHeight - y(d.orders));

  rects.exit().remove();

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  xAxisGroup
    .selectAll("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-45)")
    .style("color", "orange");
}

// db.collection("dishes")
//   .get()
//   .then((res) => {
//     d3.select(".loader").style("display", "none");
//     let data = [];
//     res.docs.forEach((doc) => data.push(doc.data()));
//     update(data);

//     d3.interval(() => {
//       //   data[0].orders += 50;
//       data.pop();
//       update(data);
//     }, 3000);
//   });

let data = [];
db.collection("dishes").onSnapshot((res) => {
  res.docChanges().forEach((changes) => {
    console.log(changes.doc.data());
    console.log(changes.type);
    let doc = {};
    doc = { ...changes.doc.data(), id: changes.doc.id };

    console.log(changes.type);
    switch (changes.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        const index = data.findIndex((d) => d.id === doc.id);
        data[index] = doc;
        break;
      case "removed":
        data.filter((d) => d.id === doc.id);
        break;
      default:
        break;
    }
  });

  update(data);
  d3.select(".spinner-border").style("display", "none");
});

function widthTween(data) {
  const i = d3.interpolate(0, x.bandwidth());

  return function (duration) {
    return i(duration);
  };
}
