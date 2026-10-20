package pl.edu.pw.elka.iottimeseriescollector.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import pl.edu.pw.elka.iottimeseriescollector.api.SystemApi;
import pl.edu.pw.elka.iottimeseriescollector.model.ApiHealthGet200Response;

@RestController
public class SystemController implements SystemApi {

    @Override
    public ResponseEntity<ApiHealthGet200Response> apiHealthGet() {
        ApiHealthGet200Response response = new ApiHealthGet200Response(ApiHealthGet200Response.StatusEnum.OK);
        return ResponseEntity.ok(response);
    }
}
