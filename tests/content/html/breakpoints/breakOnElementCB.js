const BP_BREAKONATTRCHANGE = 1;
const BP_BREAKONCHILDCHANGE = 2;
const BP_BREAKONREMOVE = 3;

function runTest()
{
    FBTest.sysout("html.breakpoints.CB; START");
    FBTest.setPref("filterSystemURLs", false);

    var doNotFilter = FBTest.getPref("filterSystemURLs");

    FBTest.compare(false, doNotFilter, "Pref filterSystemURLs must not be set true");
    FBTest.compare(false, FW.Firebug.filterSystemURLs, "Pref Firebug.filterSystemURLs must not be set true");


    FBTest.openNewTab(basePath + "html/breakpoints/breakOnElement.html", function(win)
    {
        var filter = FBTest.getPref("filterSystemURLs");
        FBTest.compare(false, filter, "Pref filterSystemURLs must not be set true");
        FBTest.compare(false, FW.Firebug.filterSystemURLs, "Pref Firebug.filterSystemURLs must not be set true");

        FBTest.openFirebug();
        FBTest.enableAllPanels();

        // A suite of asynchronous tests.
        var testSuite = [];
        testSuite.push(function(callback) {
            breakOnMutation(win, BP_BREAKONATTRCHANGE, "breakOnAttrModified", 42, callback);
        });
        testSuite.push(function(callback) {
            breakOnMutation(win, BP_BREAKONCHILDCHANGE, "breakOnNodeInserted", 47, callback);
        });
        testSuite.push(function(callback) {
            breakOnMutation(win, BP_BREAKONREMOVE, "breakOnNodeRemoved", 53, callback);
        });

        // Reload window to activate debugger and run all tests.
        FBTest.reload(function(win) {
            FBTest.runTestSuite(testSuite, function() {
                FBTest.testDone("html.breakpoints.CB; DONE");
            });
        })
    });
}

function breakOnMutation(win, type, buttonId, lineNo, callback)
{
    var chrome = FW.Firebug.chrome;
    var content = win.document.getElementById("content");
    var context = chrome.window.Firebug.currentContext;

    FBTest.selectPanel("html");

    // Set breakpoint.
    FW.Firebug.HTMLModule.MutationBreakpoints.onModifyBreakpoint(context,
        content, type);

    FBTest.waitForBreakInDebugger(chrome, lineNo, false, function(sourceRow)
    {
        FBTest.sysout("html.breakpoints.CB; " + buttonId);
        FBTest.clickContinueButton(chrome);
        FBTest.progress("The continue button is pushed");
        callback();
    });

    FBTest.click(win.document.getElementById(buttonId));
    FBTest.sysout("html.breakpoints.CB; " + buttonId + " button clicked");
}
