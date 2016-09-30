*** Running coldstart tests

Run ${WaveHome}\client\run-coldstart-all.ps1 to test all tracked coldstart scenario.
You can also create a new config file run-coldstart.config.json to change which scenarios to run

Run run-coldstart.ps1 to test a single scenario

Due to the current design limiation, tests have to be run in sequence. There is no way for the test to notify caller that it has completed.
The tests can take a timeout parameter or user input so it knows when to stop the current test and run the next test.

*** Music Store DB Connections

For Music Store remote DB scenario, an environment variables aspnet_test_musicstore_dbid and aspnet_test_musicstore_dbpw needs to be set up on the lab machine via SetEnv
command.  These variables specifies the database username and password that should be use to connect.

For IIS scenario, SetEnv does not work. the variables should be set golbally to take effect.

*** Know issues

IIS scenario sometimes fails. Broker sometimes does not receive the completion notification for shutdown command (pending investigations).

When error occurs, the test needs to be manually stopped. Remove the IIS sites, publish directory and current test directory and rerun.
