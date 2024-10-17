document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('grid');
    const gridSizeSlider = document.getElementById('gridSize');
    const gridSizeValue = document.getElementById('gridSizeValue');
    const delaySlider = document.getElementById('delay');
    const delayValue = document.getElementById('delayValue');
    const allowDiagonalsCheckbox = document.getElementById('allowDiagonals');
    let gridSize = parseInt(gridSizeSlider.value);
    let delay = parseInt(delaySlider.value);
    let allowDiagonals = allowDiagonalsCheckbox.checked;

    let grid = createGrid(gridSize, gridSize);
    let startNode = null;
    let targetNode = null;

    // Render the initial grid
    renderGrid(grid, gridElement);

    // Event Listeners
    gridSizeSlider.addEventListener('input', function () {
        gridSize = parseInt(this.value);
        gridSizeValue.textContent = `${gridSize}x${gridSize}`;
        grid = createGrid(gridSize, gridSize);
        startNode = null;
        targetNode = null;
        renderGrid(grid, gridElement);
    });

    delaySlider.addEventListener('input', function () {
        delay = parseInt(this.value);
        delayValue.textContent = `${delay}ms`;
    });

    allowDiagonalsCheckbox.addEventListener('change', function () {
        allowDiagonals = this.checked;

        // Reset the grid's visited and path statuses without removing walls, start, or target nodes
        if (startNode && targetNode) {
            resetPathAndVisitedStates(grid);
            renderGrid(grid, gridElement);
        }
    });

    document.getElementById('startBtn').addEventListener('click', () => {
        if (startNode && targetNode) {
            // Reset the grid's visited and path statuses before starting the algorithm
            resetPathAndVisitedStates(grid);
            runAStar(grid, startNode, targetNode, delay, allowDiagonals);
        } else {
            alert("Please set both a start and target node.");
        }
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        resetGrid(grid);
        resetPathAndVisitedStates(grid); // Reset paths and visited states
    });

    document.getElementById('generateMazeBtn').addEventListener('click', () => {
        resetPathAndVisitedStates(grid); // Reset paths and visited states before generating maze
        generateMaze(grid);
    });

    // Helper Functions
    function createGrid(rows, cols) {
        const grid = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push({
                    row: i,
                    col: j,
                    isStart: false,
                    isTarget: false,
                    isWall: false,
                    isVisited: false,
                    isPath: false,
                    f: Infinity,
                    g: Infinity,
                    h: Infinity,
                    previous: null
                });
            }
            grid.push(row);
        }
        return grid;
    }

    function renderGrid(grid, gridElement) {
        gridElement.innerHTML = ''; // Clear grid
        gridElement.style.gridTemplateColumns = `repeat(${grid.length}, 30px)`;
        gridElement.style.gridTemplateRows = `repeat(${grid[0].length}, 30px)`;

        grid.forEach(row => {
            row.forEach(node => {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                if (node.isStart) cell.classList.add('start');
                if (node.isTarget) cell.classList.add('target');
                if (node.isWall) cell.classList.add('wall');
                if (node.isVisited && !node.isStart && !node.isTarget) cell.classList.add('visited');
                if (node.isPath && !node.isStart && !node.isTarget) cell.classList.add('path');

                // Add interaction to set start, target, or walls
                cell.addEventListener('click', () => {
                    if (!startNode) {
                        node.isStart = true;
                        startNode = node;
                    } else if (!targetNode) {
                        node.isTarget = true;
                        targetNode = node;
                    } else if (!node.isStart && !node.isTarget) {
                        node.isWall = !node.isWall;
                    }
                    renderGrid(grid, gridElement);
                });

                gridElement.appendChild(cell);
            });
        });
    }

    function resetGrid(grid) {
        grid.forEach(row => {
            row.forEach(node => {
                node.isVisited = false;
                node.isPath = false;
                node.isWall = false;
                node.isStart = false;
                node.isTarget = false;
                node.previous = null;
                node.f = Infinity;
                node.g = Infinity;
                node.h = Infinity;
            });
        });
        startNode = null;
        targetNode = null;
        renderGrid(grid, gridElement);
    }

    function resetPathAndVisitedStates(grid) {
        grid.forEach(row => {
            row.forEach(node => {
                node.isVisited = false;
                node.isPath = false;
                node.previous = null;
                node.f = Infinity;
                node.g = Infinity;
                node.h = Infinity;
            });
        });
    }

    function generateMaze(grid) {
        grid.forEach(row => {
            row.forEach(node => {
                if (!node.isStart && !node.isTarget) {
                    node.isWall = Math.random() > 0.9;
                }
            });
        });
        renderGrid(grid, gridElement);
    }

    function runAStar(grid, startNode, targetNode, delay, allowDiagonals) {
        let openSet = [startNode];
        let closedSet = [];
        
        startNode.g = 0;
        startNode.f = heuristic(startNode, targetNode);

        function step() {
            if (openSet.length === 0) {
                alert("No path found.");
                return;
            }

            // Sort openSet by f value and pick the node with the lowest f
            openSet.sort((a, b) => a.f - b.f);
            let currentNode = openSet.shift();

            // Only mark the node as visited if it is neither the start nor the target node
            if (currentNode !== startNode && currentNode !== targetNode) {
                currentNode.isVisited = true;
            }

            // Check if the current node is the target
            if (currentNode === targetNode) {
                // Highlight the shortest path from target to start
                reconstructPath(currentNode);
                return;
            }

            closedSet.push(currentNode);

            // Get neighbors
            let neighbors = getNeighbors(grid, currentNode, allowDiagonals);

            neighbors.forEach(neighbor => {
                if (closedSet.includes(neighbor) || neighbor.isWall) return;

                let tentativeG = currentNode.g + 1;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeG >= neighbor.g) {
                    return; // Not a better path
                }

                // Update neighbor values
                neighbor.g = tentativeG;
                neighbor.h = heuristic(neighbor, targetNode);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.previous = currentNode;
            });

            renderGrid(grid, gridElement);

            setTimeout(step, delay); // Delay to visualize step by step
        }

        step();
    }

    function heuristic(nodeA, nodeB) {
        // Manhattan distance heuristic
        const dRow = Math.abs(nodeA.row - nodeB.row);
        const dCol = Math.abs(nodeA.col - nodeB.col);
        return dRow + dCol;
    }

    function getNeighbors(grid, node, allowDiagonals) {
        const neighbors = [];
        const { row, col } = node;

        if (row > 0) neighbors.push(grid[row - 1][col]);    // Up
        if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);  // Down
        if (col > 0) neighbors.push(grid[row][col - 1]);    // Left
        if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);  // Right

        if (allowDiagonals) {
            // Add diagonal neighbors
            if (row > 0 && col > 0) neighbors.push(grid[row - 1][col - 1]); // Top-left
            if (row > 0 && col < grid[0].length - 1) neighbors.push(grid[row - 1][col + 1]); // Top-right
            if (row < grid.length - 1 && col > 0) neighbors.push(grid[row + 1][col - 1]); // Bottom-left
            if (row < grid.length - 1 && col < grid[0].length - 1) neighbors.push(grid[row + 1][col + 1]); // Bottom-right
        }

        return neighbors;
    }

    function reconstructPath(node) {
        // Trace the path from the target to the start node
        while (node.previous) {
            if (node !== startNode && node !== targetNode) {
                node.isPath = true;  // Mark as part of the path
            }
            node = node.previous;
        }
        // Re-render the grid, highlight path in green
        renderGrid(grid, gridElement);

        gridElement.querySelectorAll('.path').forEach(cell => {
            cell.style.backgroundColor = 'green';
        });
    }
});
