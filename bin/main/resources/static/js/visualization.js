// Define positions and graph (example data)
const positions = {
    A: [100, 100],
    B: [300, 100],
    C: [500, 100],
    D: [300, 300],
    E: [100, 300],
    F: [500, 300]
};

const graph = {
    A: { B: 1, C: 4 },
    B: { C: 2, D: 5 },
    C: { D: 1, F: 3 },
    D: { E: 2 },
    E: { F: 1 },
    F: {}
};

function heuristicCostEstimate(start, end) {
    const pos1 = positions[start];
    const pos2 = positions[end];
    return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
}

function dijkstra(graph, start) {
    const distances = {};
    const priorityQueue = new Set();
    const visited = {};

    for (let node in graph) {
        distances[node] = Infinity;
        priorityQueue.add(node);
    }
    distances[start] = 0;

    while (priorityQueue.size > 0) {
        let minNode = null;
        priorityQueue.forEach(node => {
            if (!minNode || distances[node] < distances[minNode]) {
                minNode = node;
            }
        });

        priorityQueue.delete(minNode);
        visited[minNode] = true;

        for (let neighbor in graph[minNode]) {
            if (!visited[neighbor]) {
                const newDist = distances[minNode] + graph[minNode][neighbor];
                if (newDist < distances[neighbor]) {
                    distances[neighbor] = newDist;
                }
            }
        }
    }

    return distances;
}

function bellmanFord(graph, start) {
    const distances = {};
    for (let node in graph) {
        distances[node] = Infinity;
    }
    distances[start] = 0;

    for (let i = 0; i < Object.keys(graph).length - 1; i++) {
        for (let u in graph) {
            for (let v in graph[u]) {
                const newDist = distances[u] + graph[u][v];
                if (newDist < distances[v]) {
                    distances[v] = newDist;
                }
            }
        }
    }

    return distances;
}

function aStar(graph, start, end) {
    const openSet = new Set([start]);
    const cameFrom = {};
    const gScore = {};
    const fScore = {};

    for (let node in graph) {
        gScore[node] = Infinity;
        fScore[node] = Infinity;
    }
    gScore[start] = 0;
    fScore[start] = heuristicCostEstimate(start, end);

    const pathNodes = [];
    const exploredNodes = new Set();

    while (openSet.size > 0) {
        let current = null;
        openSet.forEach(node => {
            if (!current || fScore[node] < fScore[current]) {
                current = node;
            }
        });

        if (current === end) {
            pathNodes.push(current);
            while (current in cameFrom) {
                current = cameFrom[current];
                pathNodes.unshift(current);
            }
            return { pathNodes, exploredNodes: Array.from(exploredNodes) };
        }

        openSet.delete(current);
        exploredNodes.add(current);

        for (let neighbor in graph[current]) {
            const tentativeGScore = gScore[current] + graph[current][neighbor];
            if (tentativeGScore < gScore[neighbor]) {
                cameFrom[neighbor] = current;
                gScore[neighbor] = tentativeGScore;
                fScore[neighbor] = gScore[neighbor] + heuristicCostEstimate(neighbor, end);
                if (!openSet.has(neighbor)) {
                    openSet.add(neighbor);
                }
            }
        }
    }

    return { pathNodes: [], exploredNodes: Array.from(exploredNodes) };
}

function animateNodes(node, pathNodes, exploredNodes) {
    node.transition()
        .duration(500)
        .attr("fill", d => (pathNodes.includes(d.id) ? "green" : (exploredNodes.includes(d.id) ? "red" : "#69b3a2")))
        .ease(d3.easeLinear);
}

function visualizeGraph(pathNodes = [], exploredNodes = []) {
    d3.select("svg").remove(); // Remove any existing SVG to prevent overlap

    const width = 600;
    const height = 400;

    const nodes = Object.keys(positions).map(id => ({ id, x: positions[id][0], y: positions[id][1] }));
    const links = Object.keys(graph).flatMap(source => 
        Object.keys(graph[source]).map(target => ({ source, target, weight: graph[source][target] }))
    );

    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke-width", 2)
        .style("stroke", "#aaa");

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 20)
        .attr("fill", "#69b3a2")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(d => d.id);

    svg.append("g")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y + 5)
        .attr("text-anchor", "middle")
        .text(d => d.id);

    function update() {
        link
            .attr("x1", d => positions[d.source][0])
            .attr("y1", d => positions[d.source][1])
            .attr("x2", d => positions[d.target][0])
            .attr("y2", d => positions[d.target][1]);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    update();

    function dragstarted(event, d) {
        d3.select(this).raise().classed("active", true);
    }

    function dragged(event, d) {
        d.x = event.x;
        d.y = event.y;
        update();
    }

    function dragended(event, d) {
        d3.select(this).classed("active", false);
    }

    animateNodes(node, pathNodes, exploredNodes);
}











// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const dijkstraBtn = document.getElementById('visualize-dijkstra');
    if (dijkstraBtn) {
        dijkstraBtn.addEventListener('click', () => {
            visualizeGraph();
            const distances = dijkstra(graph, "A");
            console.log('Dijkstra Distances:', distances);
        });
    } else {
        console.error('Dijkstra button not found');
    }

    const bellmanFordBtn = document.getElementById('visualize-bellmanford');
    if (bellmanFordBtn) {
        bellmanFordBtn.addEventListener('click', () => {
            visualizeGraph();
            const distances = bellmanFord(graph, "A");
            console.log('Bellman-Ford Distances:', distances);
        });
    } else {
        console.error('Bellman-Ford button not found');
    }

    const astarBtn = document.getElementById('visualize-astar');
    if (astarBtn) {
        astarBtn.addEventListener('click', () => {
            console.log("Visualize A* clicked");
            const result = aStar(graph, "A", "D");
            visualizeGraph(result.pathNodes, result.exploredNodes);
            console.log('A* Path:', result.pathNodes);
            console.log('A* Explored Nodes:', result.exploredNodes);
        });
    } else {
        console.error('A* button not found');
    }
});

