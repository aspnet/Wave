# Startup scenario. Run 3 iterations of tests and archive the results

| Command     | Host      |Description|
|-------------|-----------|-----------|
| `git clone -b shhsu/coldstart $(scriptSource)` <config cwd="$(gitHome)" continueOnError="true"/> | $(server) | Clone the scripts repo |
| `git fetch --all` <config cwd="$(perfHome)"/> | $(server) | Fetch from git |
| `git checkout $(perfBranch)` <config cwd="$(perfHome)"/> | $(server) | Checkout, in case the clone command failed due to dir exists |
| `git clean -xdf` <config cwd="$(perfHome)"/> | $(server) | Cleanup local perf repo |
| `git reset --hard origin/$(perfBranch)` <config cwd="$(perfHome)"/> | $(server) | Reset to coldstart branch |
| `git clone -b $(testAppBranch) $(testAppSource)` <config cwd="$(gitHome)" continueOnError="true"/> | $(server) | Clone the test apps repo |
| `git fetch --all` <config cwd="$(testAppHome)"/> | $(server) | Fetch from git |
| `git checkout $(testAppBranch)` <config cwd="$(testAppHome)"/> | $(server) | Checkout, in case the clone command failed due to dir exists |
| `git clean -xdf` <config cwd="$(testAppHome)"/> | $(server) | Cleanup local test app repo |
| `git reset --hard origin/$(testAppBranch)` <config cwd="$(testAppHome)"/> | $(server) | Reset to coldstart branch |
| `$(publishScript) -t $(targetApp) -f $(framework) -d $(testAppDir) $(precompileOption)` <config cwd="$(scriptHome)"> | $(server) | Publish App |
| `$(rebootCommand)` | $(server) | Reboot |
| `$(measureScript) -t $(targetApp) -f $(framework)` <config cwd="$(scriptHome)"> | $(server) | Measure Iteration 1 |
| `$(rebootCommand)` | $(server) | Reboot |
| `$(measureScript) -t $(targetApp) -f $(framework)` <config cwd="$(scriptHome)"> | $(server) | Measure Iteration 2 |
| `$(rebootCommand)` | $(server) | Reboot |
| `$(measureScript) -t $(targetApp) -f $(framework)` <config cwd="$(scriptHome)"> | $(server) | Measure Iteration 3 |
| `$(archiveScript) -t $(targetApp) -f $(framework) -n $(testName)` <config cwd="$(scriptHome)"> | $(server) | Archive Test Results |
