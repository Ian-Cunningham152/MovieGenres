import Graph from "graphology";
import Sigma from "sigma";
import circular from "graphology-layout/circular";
import forceAtlas2 from "graphology-layout-forceatlas2";


/**
 * Gets data from data.json and loads it
 */
async function loadGraph() {

    const response = await fetch("./data.json");
    const graphData = await response.json();
    return graphData;
}

let graph_json = await loadGraph()

let graph = new Graph();

//puts nodes in graph
for(let i = 0; i< graph_json.length; i++) {
    let node = graph_json[i];
    graph.addNode(node.id, node);
}

//setting the colors based on genre
const COLORS = {
    "Horror": "Red",
    "Sci-Fi": "Green",
    "Comedy": "Blue"
}

//adding the colors to the node, and size
graph.forEachNode((node, attributes) => {
    graph.setNodeAttribute(node, "color", COLORS[attributes.genre] || "gray");
    graph.setNodeAttribute(node, "size", 25);
});

//puts in edges
for(let i = 0; i < graph_json.length - 1; i++) {
    for(let j = i+1; j < graph_json.length; j++) {
        if(graph_json[i].genre === graph_json[j].genre) {
            graph.addEdge(
                graph_json[i].id,
                graph_json[j].id,
                {
                    size: 5,
                    color: "black"
                }
            );
        }
    }
}

//organizes graph based on genre
circular.assign(graph);
const settings = forceAtlas2.inferSettings(graph);
settings.gravity = 0.1;
settings.scalingRatio = 10;
forceAtlas2.assign(graph, { settings, iterations: 7});


const renderer = new Sigma(graph, document.getElementById("sigma-container"));

const tooltip = document.getElementById("tooltip");

renderer.on("enterNode", (event) => {
    const movie = graph.getNodeAttributes(event.node);
    tooltip.style.display = "block";

    tooltip.innerHTML =
    `<strong>${movie.name}</strong><br>
     Acronym: ${movie.acronym}</br>
     Genre: ${movie.genre}`;
});

renderer.on("leaveNode", () => {
    tooltip.style.display = "none";
});

renderer.on("clickNode", (event) => {
    const movie = graph.getNodeAttributes(event.node);
    window.open(movie.link, "_blank");
});


//event listeners for buttons that toggle visibility
document.getElementById("horror").addEventListener("change", (event) => {
    toggleGenreVisibility("Horror", event.target.checked);
});

document.getElementById("sci-fi").addEventListener("change", (event) => {
    toggleGenreVisibility("Sci-Fi", event.target.checked);
});

document.getElementById("comedy").addEventListener("change", (event) => {
    toggleGenreVisibility("Comedy", event.target.checked);
});


//this is to hide/show the nodes & edges
function toggleGenreVisibility(genre, isVisible) {
    graph.forEachNode((node, attributes) => {
        if(attributes.genre === genre) {
            graph.setNodeAttribute(node, "hidden", !isVisible);
        }
    });

    graph.forEachEdge((edgeId, source,target) => {
        const sourceHidden = graph.getNodeAttribute(source, "hidden");
        const targetHidden = graph.getNodeAttribute(target, "hidden");

        graph.setEdgeAttribute(
            edgeId,
            "hidden",
            sourceHidden || targetHidden
        );
    });

    renderer.refresh();
}