package main.java.com.visualizimi.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "index"; // This should map to index.html in templates
    }

    @GetMapping("/index")
    public String indexPage() {
        return "index"; // This also maps to index.html in templates
    }

    @GetMapping("/dijkstra")
    public String dijkstraPage() {
        return "dijkstra"; // Maps to dijkstra.html in templates
    }

    @GetMapping("/bellmanford")
    public String bellmanfordPage() {
        return "bellmanford"; // Maps to bellmanford.html in templates
    }
    @GetMapping("/bellmanford/info")
    public String bellmanfordInfoPage() {
        return "bellmanfordinfo"; // Maps to bellmanford.html in templates
    }
    @GetMapping("/dijkstra/info")
    public String dijkstraInfoPage() {
        return "dijkstrainfo"; // Maps to bellmanford.html in templates
    }
    @GetMapping("/astar/info")
    public String astarInfoPage() {
        return "astarinfo"; // Maps to bellmanford.html in templates
    }
}
