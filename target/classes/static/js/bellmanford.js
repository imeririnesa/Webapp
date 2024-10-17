
        let delay = 30; // Milliseconds delay between each step
        let solving = false;
        let solutionFound = false;
        let grid = []; // Array to hold grid nodes
        const rows = 10; // Number of rows
        const cols = 10; // Number of columns
        let startNode = null; // To keep track of the start node
        let finishNode = null; // To keep track of the finish node

        class Node {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.type = 'DEFAULT'; // Default value
                this.isWall = false;
                this.alreadyVisited = false;
                this.parent = null;
                this.element = this.createElement();
            }

            createElement() {
                const nodeElement = document.createElement('div');
                nodeElement.className = 'node';
                nodeElement.addEventListener('click', () => this.toggleWall());
                document.getElementById('grid').appendChild(nodeElement);
                return nodeElement;
            }

            setType(type) {
                this.type = type;
                this.updateElement();
            }

            updateElement() {
                this.element.className = `node ${this.type}`;
            }

            toggleWall() {
                this.isWall = !this.isWall;
                this.setType(this.isWall ? 'WALL' : 'DEFAULT');
            }

            getNeighbors() {
                const neighbors = [];
                const directions = [
                    { x: -1, y: 0 }, // Up
                    { x: 1, y: 0 }, // Down
                    { x: 0, y: -1 }, // Left
                    { x: 0, y: 1 }, // Right
                ];

                for (const { x: dx, y: dy } of directions) {
                    const newX = this.x + dx;
                    const newY = this.y + dy;

                    if (newX >= 0 && newX < rows && newY >= 0 && newY < cols) {
                        const neighbor = grid[newX][newY];
                        if (!neighbor.alreadyVisited && !neighbor.isWall) {
                            neighbors.push(neighbor);
                        }
                    }
                }

                return neighbors;
            }
        }

        function initializeGrid() {
            const gridContainer = document.getElementById('grid');
            for (let i = 0; i < rows; i++) {
                grid[i] = [];
                for (let j = 0; j < cols; j++) {
                    const node = new Node(i, j);
                    grid[i][j] = node;
                }
            }
        }

        function bfs(startNode) {
            const frontier = [];
            frontier.push(startNode);
            startNode.setType('CURRENT');

            function processNextNode() {
                if (!solving || frontier.length === 0 || solutionFound) return;

                const currentNode = frontier.shift();
                currentNode.setType('CURRENT');

                // Simulate the visual update
                setTimeout(() => {
                    if (currentNode === finishNode) {
                        extractSolution(currentNode); // Implement this function to extract the solution
                        solving = false;
                        solutionFound = true;
                    } else {
                        currentNode.setType('VISITED');
                        currentNode.alreadyVisited = true;

                        const neighbors = currentNode.getNeighbors();
                        for (const neighbor of neighbors) {
                            frontier.push(neighbor);
                            neighbor.setType('FRONTIER');
                        }
                    }
                    processNextNode();
                }, delay);
            }

            processNextNode();
        }

        function extractSolution(node) {
            let current = node;
            while (current) {
                current.setType('PATH');
                current = current.parent;
            }
        }

        document.getElementById('startButton').addEventListener('click', () => {
            if (startNode && finishNode) {
                solving = true;
                solutionFound = false;
                bfs(startNode);
            } else {
                alert('Please set the start and finish nodes!');
            }
        });

        document.getElementById('resetButton').addEventListener('click', () => {
            solving = false;
            solutionFound = false;
            grid.forEach(row => row.forEach(node => {
                node.setType('DEFAULT');
                node.isWall = false;
                node.alreadyVisited = false;
                node.parent = null;
            }));
            startNode = null;
            finishNode = null;
        });

        // Initialize the grid and set start/finish nodes
        initializeGrid();
        grid[0][0].setType('START'); // Set start node
        startNode = grid[0][0];
        grid[rows - 1][cols - 1].setType('FINISH'); // Set finish node
        finishNode = grid[rows - 1][cols - 1];
    