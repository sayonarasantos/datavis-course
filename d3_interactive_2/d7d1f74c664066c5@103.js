// https://observablehq.com/@sayonarasantos/d3-com-crossfilter-dc-js-e-leaflet-parte-2@103
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# D3 com Crossfilter, DC.js e Leaflet (Parte 2)`
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<code>css</code> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.0/css/bootstrap.min.css" integrity="sha384-PDle/QlgIONtM1aqA2Qemk5gPOE7wFq8+Em+G/hmo5Iq0CCmYZLv3fVRDJ4MMwEA" crossorigin="anonymous">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css"
   integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
   crossorigin=""/>`
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.csv("https://gist.githubusercontent.com/emanueles/65a308ffa630689c11a031252998ef8d/raw/a004c770786229d54264406118ae21ba7e4c51a8/earthquakes.csv").then(function(data) {
  let parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S")
  let magFormat = d3.format(".1f")
  let depthFormat = d3.format("d")
  data.forEach(function(d) {
    d.dtg = parseDate(d.origintime.substr(0,19))
    d.latitude = +d.latitude
    d.longitude = +d.longitude
    d.magnitude = magFormat(+d.magnitude)
    d.depth = depthFormat(+d.depth)
  })
  return data
})
)});
  main.variable(observer("facts")).define("facts", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer("dateDimension")).define("dateDimension", ["facts"], function(facts){return(
facts.dimension( d => d.dtg)
)});
  main.variable(observer("magDimension")).define("magDimension", ["facts"], function(facts){return(
facts.dimension( d => d.magnitude)
)});
  main.variable(observer("magDimensionCount")).define("magDimensionCount", ["magDimension"], function(magDimension){return(
magDimension.group()
)});
  main.variable(observer("depthDimension")).define("depthDimension", ["facts"], function(facts){return(
facts.dimension( d => d.depth)
)});
  main.variable(observer("depthDimensionCount")).define("depthDimensionCount", ["depthDimension"], function(depthDimension){return(
depthDimension.group()
)});
  main.variable(observer("hourDimension")).define("hourDimension", ["facts","d3"], function(facts,d3){return(
facts.dimension(d => d3.timeHour(d.dtg))
)});
  main.variable(observer("hourDimensionCount")).define("hourDimensionCount", ["hourDimension"], function(hourDimension){return(
hourDimension.group()
)});
  main.variable(observer("view")).define("view", ["md","container"], function(md,container){return(
md`${container()}`
)});
  main.variable(observer("buildvis")).define("buildvis", ["magnitudeChart","magDimension","magDimensionCount","d3","updateMarkers","depthChart","depthDimension","depthDimensionCount","timeChart","hourDimension","hourDimensionCount","dataset","dataTable","dateDimension","dc"], function(magnitudeChart,magDimension,magDimensionCount,d3,updateMarkers,depthChart,depthDimension,depthDimensionCount,timeChart,hourDimension,hourDimensionCount,dataset,dataTable,dateDimension,dc)
{
  magnitudeChart.width(480)
          .height(150)
          .margins({top: 10, right: 10, bottom: 20, left:40})
          .dimension(magDimension)
          .group(magDimensionCount)
          .transitionDuration(500)
          .gap(56)
          .centerBar(true)
          .x(d3.scaleLinear().domain([0, 8]))
          .elasticY(true)
          .on("filtered", function(chart,filter){
                updateMarkers()
            })
  depthChart.width(480)
         .height(150)
          .margins({top: 10, right: 10, bottom: 20, left:40})
          .dimension(depthDimension)
          .group(depthDimensionCount)
          .transitionDuration(500)
          .centerBar(true)
          .gap(1)
          .x(d3.scaleLinear().domain([0, 100]))
          .elasticY(true)
          .on("filtered", function(chart,filter){
                updateMarkers()
            })
  
  timeChart.width(960)
           .height(150)
           .transitionDuration(500)
           .margins({top: 10, right: 10, bottom: 20, left:40})
           .dimension(hourDimension)
           .group(hourDimensionCount)
           .brushOn(false)
           .elasticY(true)
           .x(d3.scaleTime().domain(d3.extent(dataset, d => d.dtg)))
  
  dataTable.width(960)
           .height(800)
           .dimension(dateDimension)
           .group(d => "List of all earthquakes corresponding to the filters")
           .size(10)
           .columns([
            'dtg',
            'magnitude',
            'depth',
            'latitude',
            'longitude'])
          .sortBy(d => d.dtg)
          .order(d3.ascending)
  
  dc.renderAll()
  updateMarkers()
}
);
  main.variable(observer("layerList")).define("layerList", function(){return(
[]
)});
  main.variable(observer("circles")).define("circles", ["d3","dataset","L"], function(d3,dataset,L)
{
  let markers = d3.map()
  dataset.forEach( function(d) {
    let size = d.magnitude * 10000
    let circle = L.circle([d.latitude, d.longitude], size, {
      color: '#fd8d3c',
      weight: 2,
      fillColor: '#fecc5c',
      fillOpacity: 0.5
    })
    circle.bindPopup("Magnitude: "+d.magnitude+"<br>Time: "+d.dtg)
    circle.publicid = d.publicid //para interação na outra direção
    markers.set(d.publicid, circle)
  })
  return markers
}
);
  main.variable(observer("idDimension")).define("idDimension", ["facts"], function(facts){return(
facts.dimension(d=>d.publicid)
)});
  main.variable(observer("idGrouping")).define("idGrouping", ["idDimension"], function(idDimension){return(
idDimension.group()
)});
  main.variable(observer("magnitudeChart")).define("magnitudeChart", ["dc","view"], function(dc,view){return(
dc.barChart(view.querySelector("#magnitude-chart"))
)});
  main.variable(observer("depthChart")).define("depthChart", ["dc","view"], function(dc,view){return(
dc.barChart(view.querySelector("#depth-chart"))
)});
  main.variable(observer("timeChart")).define("timeChart", ["dc","view"], function(dc,view){return(
dc.lineChart(view.querySelector("#time-chart"))
)});
  main.variable(observer("dataTable")).define("dataTable", ["dc","view"], function(dc,view){return(
dc.dataTable(view.querySelector("#dc-table-graph"))
)});
  main.variable(observer("map")).define("map", ["view","L","updateFilters"], function(view,L,updateFilters)
{
  view;
  let mapInstance = L.map('mapid').setView([-41.05,172.93], 5)
   L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 17
    }).addTo(mapInstance)
  mapInstance.on('moveend', updateFilters)
  return mapInstance
}
);
  main.variable(observer("updateFilters")).define("updateFilters", ["idGrouping","layerList","idDimension","dc"], function(idGrouping,layerList,idDimension,dc){return(
function updateFilters(e){
  let visibleMarkers = new Array(idGrouping.size())
  layerList[0].eachLayer(function(layer) {
     if( e.target.getBounds().contains(layer.getLatLng()) )
    //add layer.publicid to some array visibleMarkers
       visibleMarkers.push(layer.publicid)       
  })
   
  idDimension.filterFunction(function(d) {
      return visibleMarkers.indexOf(d) > -1;
  });
  dc.redrawAll();
}
)});
  main.variable(observer("updateMarkers")).define("updateMarkers", ["idGrouping","circles","layerList","map","L"], function(idGrouping,circles,layerList,map,L){return(
function updateMarkers(){
  let ids = idGrouping.all()
  let todisplay = new Array(ids.length) //preallocate array to be faster
  let mc = 0; //counter of used positions in the array
  for (let i = 0; i < ids.length; i++) {
    let tId = ids[i];
    if(tId.value > 0){ //when an element is filtered, it has value > 0
      todisplay[mc] = circles.get(tId.key)
      mc = mc + 1
    }
  }
  todisplay.length = mc; //resize the array so Leaflet does not complain
  if (layerList.length == 1) {
    layerList[0].clearLayers() //remove circles in layerGroup
    if (map.hasLayer(layerList[0])){
      map.removeLayer(layerList[0]) //remove layerGroup if present
    }
  }
  layerList[0] = L.layerGroup(todisplay).addTo(map) //add it again passing the array of markers
}
)});
  main.variable(observer("container")).define("container", function(){return(
function container() { 
  return `
<main role="main" class="container">
    <div class="row">
      <h4> Earthquakes in New Zealand</h4>
    </div>
    <div class='row'>
        <div id="mapid" class="col-6">
        </div>
        <div class="col-6">
          <div id='magnitude-chart'>
            <h5> Number of Events by Magnitude</h5>
          </div>
            
          <div id='depth-chart'>
            <h5> Events by Depth (km) </h5>
          </div>
        </div>
    </div>
    <div class='row'>
      <div id='time-chart' class="single-col">
        <h5> Events per hour </h5>
      </div>
    </div>
    <table class="table table-hover" id="dc-table-graph">
        <thead>
            <tr class="header">
                <th>DTG</th>
                <th>Magnitude</th>
                <th>Depth</th>
                <th>Latitude</th>
                <th>Longitude</th>
            </tr>
        </thead>
    </table>
   <p>Earthquake data via <a href="https://quakesearch.geonet.org.nz/">Geonet</a>.</p>
  </main>
 `
}
)});
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula inclui o css do dc.
<style>
#mapid {
    width: 650px;
    height: 480px;
 }
.dc-chart path.dc-symbol, .dc-legend g.dc-legend-item.fadeout {
  fill-opacity: 0.5;
  stroke-opacity: 0.5; }

.dc-chart rect.bar {
  stroke: none;
  cursor: pointer; }
  .dc-chart rect.bar:hover {
    fill-opacity: .5; }

.dc-chart rect.deselected {
  stroke: none;
  fill: #ccc; }

.dc-chart .pie-slice {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }
  .dc-chart .pie-slice.external {
    fill: #000; }
  .dc-chart .pie-slice :hover, .dc-chart .pie-slice.highlight {
    fill-opacity: .8; }

.dc-chart .pie-path {
  fill: none;
  stroke-width: 2px;
  stroke: #000;
  opacity: 0.4; }

.dc-chart .selected path, .dc-chart .selected circle {
  stroke-width: 3;
  stroke: #ccc;
  fill-opacity: 1; }

.dc-chart .deselected path, .dc-chart .deselected circle {
  stroke: none;
  fill-opacity: .5;
  fill: #ccc; }

.dc-chart .axis path, .dc-chart .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges; }

.dc-chart .axis text {
  font: 10px sans-serif; }

.dc-chart .grid-line, .dc-chart .axis .grid-line, .dc-chart .grid-line line, .dc-chart .axis .grid-line line {
  fill: none;
  stroke: #ccc;
  shape-rendering: crispEdges; }

.dc-chart .brush rect.selection {
  fill: #4682b4;
  fill-opacity: .125; }

.dc-chart .brush .custom-brush-handle {
  fill: #eee;
  stroke: #666;
  cursor: ew-resize; }

.dc-chart path.line {
  fill: none;
  stroke-width: 1.5px; }

.dc-chart path.area {
  fill-opacity: .3;
  stroke: none; }

.dc-chart path.highlight {
  stroke-width: 3;
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart g.state {
  cursor: pointer; }
  .dc-chart g.state :hover {
    fill-opacity: .8; }
  .dc-chart g.state path {
    stroke: #fff; }

.dc-chart g.deselected path {
  fill: #808080; }

.dc-chart g.deselected text {
  display: none; }

.dc-chart g.row rect {
  fill-opacity: 0.8;
  cursor: pointer; }
  .dc-chart g.row rect:hover {
    fill-opacity: 0.6; }

.dc-chart g.row text {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }

.dc-chart g.dc-tooltip path {
  fill: none;
  stroke: #808080;
  stroke-opacity: .8; }

.dc-chart g.county path {
  stroke: #fff;
  fill: none; }

.dc-chart g.debug rect {
  fill: #00f;
  fill-opacity: .2; }

.dc-chart g.axis text {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .node {
  font-size: 0.7em;
  cursor: pointer; }
  .dc-chart .node :hover {
    fill-opacity: .8; }

.dc-chart .bubble {
  stroke: none;
  fill-opacity: 0.6; }

.dc-chart .highlight {
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart .fadeout {
  fill-opacity: 0.2;
  stroke-opacity: 0.2; }

.dc-chart .box text {
  font: 10px sans-serif;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .box line {
  fill: #fff; }

.dc-chart .box rect, .dc-chart .box line, .dc-chart .box circle {
  stroke: #000;
  stroke-width: 1.5px; }

.dc-chart .box .center {
  stroke-dasharray: 3, 3; }

.dc-chart .box .data {
  stroke: none;
  stroke-width: 0px; }

.dc-chart .box .outlier {
  fill: none;
  stroke: #ccc; }

.dc-chart .box .outlierBold {
  fill: red;
  stroke: none; }

.dc-chart .box.deselected {
  opacity: 0.5; }
  .dc-chart .box.deselected .box {
    fill: #ccc; }

.dc-chart .symbol {
  stroke: none; }

.dc-chart .heatmap .box-group.deselected rect {
  stroke: none;
  fill-opacity: 0.5;
  fill: #ccc; }

.dc-chart .heatmap g.axis text {
  pointer-events: all;
  cursor: pointer; }

.dc-chart .empty-chart .pie-slice {
  cursor: default; }
  .dc-chart .empty-chart .pie-slice path {
    fill: #fee;
    cursor: default; }

.dc-data-count {
  float: right;
  margin-top: 15px;
  margin-right: 15px; }
  .dc-data-count .filter-count, .dc-data-count .total-count {
    color: #3182bd;
    font-weight: bold; }

.dc-legend {
  font-size: 11px; }
  .dc-legend .dc-legend-item {
    cursor: pointer; }

.dc-hard .number-display {
  float: none; }

div.dc-html-legend {
  overflow-y: auto;
  overflow-x: hidden;
  height: inherit;
  float: right;
  padding-right: 2px; }
  div.dc-html-legend .dc-legend-item-horizontal {
    display: inline-block;
    margin-left: 5px;
    margin-right: 5px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-horizontal.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-vertical {
    display: block;
    margin-top: 5px;
    padding-top: 1px;
    padding-bottom: 1px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-vertical.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-color {
    display: table-cell;
    width: 12px;
    height: 12px; }
  div.dc-html-legend .dc-legend-item-label {
    line-height: 12px;
    display: table-cell;
    vertical-align: middle;
    padding-left: 3px;
    padding-right: 3px;
    font-size: 0.75em; }

.dc-html-legend-container {
  height: inherit; }
</style>`
)});
  main.variable(observer("dc")).define("dc", ["require"], function(require){return(
require('dc')
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require('crossfilter2')
)});
  main.variable(observer("$")).define("$", ["require"], function(require){return(
require('jquery').then(jquery => {
  window.jquery = jquery;
  return require('popper@1.0.1/index.js').catch(() => jquery);
})
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3@5')
)});
  main.variable(observer("bootstrap")).define("bootstrap", ["require"], function(require){return(
require('bootstrap')
)});
  main.variable(observer("L")).define("L", ["require"], function(require){return(
require('leaflet@1.5.1')
)});
  return main;
}
