// https://observablehq.com/@sayonarasantos/taxa-de-desemprego-nos-eua-em-agosto-de-2016@93
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Taxa de desemprego nos EUA em agosto de 2016`
)});
  main.variable(observer("buildvis")).define("buildvis", ["d3","DOM","topojson","us","colorScale","rateById"], function(d3,DOM,topojson,us,colorScale,rateById)
{
  const width = 960
  const height = 600
  const svg = d3.select(DOM.svg(width, height))
  let path = d3.geoPath()
  
  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("fill", d => colorScale(rateById.get(d.id)))
      .attr("d", path)
    .append("title")
    .text((d) => "Taxa: "+rateById.get(d.id))

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path)
  
  // Once we append the vis elments to it, we return the DOM element for Observable to display above.
  return svg.node()
}
);
  main.variable(observer("colorScale")).define("colorScale", ["d3"], function(d3){return(
d3.scaleQuantize()
               .domain([1,10])
               .range(d3.schemeGreens[9])
)});
  main.variable(observer("rateById")).define("rateById", ["d3"], function(d3){return(
d3.tsv("https://gist.githubusercontent.com/emanueles/7fbdcd8ee412e3e63904114cf9d7ee3a/raw/af4fd93db1be3f9033caff46d4a574a54bf9363f/unemployment.tsv").then(function (data) {
  let rateMap = d3.map()
  data.forEach(function(d) {
    rateMap.set(d.id, +d.rate)
  })
  return rateMap
})
)});
  main.variable(observer("us")).define("us", ["d3"], function(d3){return(
d3.json("https://gist.githubusercontent.com/emanueles/ee2997bc6237f3dcab952ae8becaf6bf/raw/afdb12d4ef89bb239998b295c94d960e8d89c19e/us.json")
)});
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula contém os estilos da visualização.
<style>

		.counties {
		  fill: none;
		}

		.states {
		  fill: none;
		  stroke: #eee;
		  stroke-linejoin: round;
		}

	</style>`
)});
  main.variable(observer("topojson")).define("topojson", ["require"], function(require){return(
require("topojson-client@3")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3@5')
)});
  return main;
}
