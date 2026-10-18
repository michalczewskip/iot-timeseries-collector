package pl.edu.pw.elka.iottimeseriescollector;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IotTimeseriesCollectorApplication {

	public static void main(String[] args) {
		SpringApplication.run(IotTimeseriesCollectorApplication.class, args);
	}

}
