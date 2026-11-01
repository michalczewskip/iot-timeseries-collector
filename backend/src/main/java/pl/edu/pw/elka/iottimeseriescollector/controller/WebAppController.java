package pl.edu.pw.elka.iottimeseriescollector.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebAppController {

    @RequestMapping(value = {"/{path:[^.]*}", "/**/{path:[^.]*}"})
    public String forward(HttpServletRequest request, @PathVariable(required = false) String path) {
        String uri = request.getRequestURI();

        if (uri.startsWith("/api")) {
            return null;
        }

        return "forward:/index.html";
    }
}
