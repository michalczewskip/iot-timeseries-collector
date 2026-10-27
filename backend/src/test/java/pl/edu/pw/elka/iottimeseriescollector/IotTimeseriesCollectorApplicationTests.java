package pl.edu.pw.elka.iottimeseriescollector;

import org.junit.jupiter.api.Test;
import pl.edu.pw.elka.iottimeseriescollector.security.PasswordManager;

class IotTimeseriesCollectorApplicationTests {

    PasswordManager passwordManager = new PasswordManager();

    @Test
    void testGeneratingHashForPassword() {
        System.out.println(passwordManager.hashPassword("admin"));
    }

}
