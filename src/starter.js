import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));

//color
const pointcolor = "#5232B9";

// console.log(width + "," + height);
const margin = { top: 65, right: 50, bottom: 65, left: 50 };
// group
const g = svg
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

// scale
let minLen = d3.min([height / 2 - margin.top, width / 2 - margin.right]);
const radiusScale = d3.scaleLinear().domain([0, 100]).range([0, minLen]);

const attributes = [
  "pace",
  "shooting",
  "passing",
  "dribbling",
  "defending",
  "physic",
];
const radius = [0, 25, 50, 75, 100];

const angleScale = d3
  .scaleLinear()
  .domain([0, attributes.length])
  .range([0, 2 * Math.PI]);

// line radial
const radarLine = d3
  .lineRadial()
  .angle((d, i) => angleScale(i))
  .curve(d3.curveCardinalClosed)
  .radius((d) => radiusScale(selectedPlayer[d]));

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
// data

let data = [];
let selectedPlayer;

let radiusAxis, angleAxis, labels;
let path;
let players;
let selectedName = "L. Messi";

d3.json("data/fifa23_maleplayers.json").then((raw_data) => {
  data = raw_data.filter((d) => d.overall > 85);

  players = [...new Set(data.map((d) => d.short_name))];
  // console.log(players);
  selectedPlayer = data.filter((d) => d.short_name === selectedName)[0];
  console.log(selectedPlayer);
  const dropdown = document.getElementById("options");
  players.map((d) => {
    const option = document.createElement("option");
    option.value = d; //text 가지고 있는 의미
    option.innerHTML = d; //d ="test"라고 하면 이름 + test라고 보임
    option.selected = d === selectedName ? true : false;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener("change", function () {
    selectedName = dropdown.value;
    console.log(selectedName);
    updatePlayer();
  });

  //axis
  radiusAxis = g
    .selectAll("radius-axis")
    .data(radius)
    .enter()
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", (d) => radiusScale(d))
    .attr("fill", "rgba(10,10,10,0.02")
    .attr("stroke", "#c3c3c3")
    .attr("stroke-width", 0.5);

  angleAxis = g
    .selectAll("angle-axis")
    .data(attributes)
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => getXPos(100, i))
    .attr("y2", (d, i) => getYPos(100, i))
    .attr("stroke", "#ccc")
    .attr("stroke-width", 0.5);

  labels = g
    .selectAll("labels")
    .data(attributes)
    .enter()
    .append("text")
    .attr("x", (d, i) => getXPos(120, i))
    .attr("y", (d, i) => getYPos(120, i))
    .text((d) => d)
    .attr("class", "labels");

  path = g
    .append("path")
    .datum(attributes)
    .attr("d", radarLine)
    .attr("fill", pointcolor)
    .attr("stroke", pointcolor)
    .attr("stroke-width", 1.3)
    .attr("fill-opacity", 0.1);

  d3.select("#player-name").text(selectedPlayer.long_name);
});

//function
const getXPos = (dist, index) => {
  //radius*cos(theta)
  return radiusScale(dist) * Math.cos(angleScale(index) - Math.PI / 2);
};
const getYPos = (dist, index) => {
  //radius*sin(theta)
  return radiusScale(dist) * Math.sin(angleScale(index) - Math.PI / 2);
};

//Update
const updatePlayer = () => {
  selectedPlayer = data.filter((d) => d.short_name == selectedName)[0];

  radarLine.radius((d) => radiusScale(selectedPlayer[d]));
  path.transition().duration(700).attr("d", radarLine);
  d3.select("#player-name").text(selectedPlayer.long_name);
  // console.log(selectedPlayer);
};

//Resize
window.addEventListener("resize", () => {
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  g.attr("transform", `translate(${width / 2}, ${height / 2})`);
  //scale
  minLen = d3.min([height / 2 - margin.top, width / 2 - margin.right]);
  radiusScale.range([0, minLen]);

  //axis
  radiusAxis.attr("r", (d) => radiusScale(d));

  angleAxis
    .attr("x2", (d, i) => getXPos(100, i))
    .attr("y2", (d, i) => getYPos(100, i));

  //path
  radarLine.radius((d) => radiusScale(selectedPlayer[d]));

  path.attr("d", radarLine);

  //labels
  labels
    .attr("x", (d, i) => getXPos(120, i))
    .attr("y", (d, i) => getYPos(120, i));
});
