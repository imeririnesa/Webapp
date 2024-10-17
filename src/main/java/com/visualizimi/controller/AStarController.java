package main.java.com.visualizimi.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AStarController {

    @GetMapping("/astar")
    public String astar() {
        return "astar";  // This will render astar.html
    }
}
