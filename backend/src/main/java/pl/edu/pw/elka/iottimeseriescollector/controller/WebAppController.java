package pl.edu.pw.elka.iottimeseriescollector.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebAppController {

    @GetMapping(value = {"/", "/dashboard", "/admin"})
    public String forward() {
        return "forward:/index.html";
    }
}
