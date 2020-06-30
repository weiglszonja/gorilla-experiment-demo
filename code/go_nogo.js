// Implementation of the Simple Go-nogo task

//import gorilla = require("gorilla/gorilla");

const jsPsych = window['jsPsych'];

gorilla.ready(function () {


    // URL's for the pattern and random stimuli and the lab logo:
    const blueURL = gorilla.stimuliURL('blue.png');
    const orangeURL = gorilla.stimuliURL('orange.png');
    const logoURL = gorilla.stimuliURL('memo_logo.jpg');

    // We also create an array containing all the URL's for our required stimuli.
    // This is an important step which will be discussed further below!
    const images = [];
    images.push(blueURL);
    images.push(orangeURL);
    images.push(logoURL);

    /* create timeline */
    let timeline = []; //create timeline

    const welcome = { //create welcome message trial
        type: "html-keyboard-response",
        stimulus: "<h1>Welcome to the Go-Nogo experiment!</h1>" +
            "</p> Press any key to begin.</p>" +
            "<div class='float: center;'><img src='" + logoURL + "' height='100' width='120'/></div>"
    };

    const instructions = { //define instruction trial 1
        type: "html-keyboard-response",
        stimulus: "<p>In this experiment, a circle will appear in the centre of the screen.</p>" +
            "<p>If the cricle is <b>blue</b> press SPACE</p>" +
            "<p>If the cricle is <b>orange</b> do not press any key </p>" +
            "<p><strong>The stimuli will change very rapidly, so please do your best!</strong></p>" +
            "<p>Your goal is to respond as <em>quickly</em> and <em>accurately</em> as possible! " +
            "<p><strong>Press ANY key to begin.</strong></p>"
    };

    const end = { //define end of experiment message
        type: "html-keyboard-response",
        stimulus: "<p>End of the experiment.</p>" +
            "<p>Press ANY key to continue!</p>"
    };

    /* test trials */
    var test_stimuli = [
        { stimulus: blueURL, data: { test_part: 'test', correct_response: 'space' } },
        { stimulus: blueURL, data: { test_part: 'test', correct_response: 'space' } },
        { stimulus: blueURL, data: { test_part: 'test', correct_response: 'space' } },
        { stimulus: blueURL, data: { test_part: 'test', correct_response: 'space' } },
        { stimulus: orangeURL, data: { test_part: 'no-test', correct_response: 'space' } }
    ];

    var fixation = {
        type: 'html-keyboard-response',
        stimulus: '<div style="font-size:60px;">+</div>',
        choices: jsPsych.NO_KEYS,
        trial_duration: function () {
            return jsPsych.randomization.sampleWithReplacement([350, 400, 450, 500], 1)[0];
        },
        data: { test_part: 'fixation' }
    }

    var test = {
        type: "image-keyboard-response",
        stimulus: jsPsych.timelineVariable('stimulus'),
        choices: ['space'],
        trial_duration: function () {
            return jsPsych.randomization.sampleWithReplacement([250, 300, 350, 400, 450, 500], 1)[0];
        },
        data: jsPsych.timelineVariable('data'),
        on_finish: function (data) {
            data.correct = data.key_press === jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.correct_response);
        },
    };

    var test_procedure = {
        timeline: [fixation, test],
        timeline_variables: test_stimuli,
        repetitions: 2,
        randomize_order: true
    }

    /* define debrief */
    var debrief_block = {
        type: "html-keyboard-response",
        stimulus: function () {

            var trials = jsPsych.data.get().filter({ test_part: 'test' });
            var correct_trials = trials.filter({ correct: true });
            var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
            var rt = Math.round(correct_trials.select('rt').mean());

            return "<p>You responded correctly on "+accuracy+"% of the Go trials.</p>" +
                "<p>Your average response time was " + rt + "ms.</p>" +
                "<p>This concludes the experiment. Thank you!</p>" +
                "<p><strong>Please press any key, or wait for this text to disapear.</strong></p>";

        },
        choices: jsPsych.ALL_KEYS,
        trial_duration: 6000
    };


/////////////////////////////////////////

    /*TIMELINE*/

    timeline.push(welcome);
    timeline.push(instructions);
    timeline.push(test_procedure);
    timeline.push(debrief_block);
    timeline.push(end)

    // The remaining two changes are located in the jsPsych.init function

    // 2) Set images to be preloaded
    // To make sure your task displays as smoothly as possible, we STRONGLY recommend using jsPsych's inbuilt
    // preloading system.  In this case, we have used preload_images and provided it with an array of our images
    // Very helpfully, jsPsych automatically includes a preload progress bar, that informs the participant of
    // how far they are through the preloading process.
    // However, in our case, we have switched this functionality off using show_preload_progress_Bar: false
    // We have done this because we only have two images and they'll generally load very quickly
    // As a result, the progress bar will only flash up for a fraction of a second and this can just
    // look broken rather than informative!
    // If you need to preload a lot of images, or are accessing a participant pool spread across the world
    // you should consider adding the progress bar back in.

    // 3) Upload data to the gorilla database
    // We've added a function to on_data_update which passes the generated data object into gorilla.metric
    // This then uploads the data as a metric to the Gorilla database, which can then be downloaded from the
    // experiments data page (or at the end of a preview).
    // The data object needs to be a set of key, value pairs which Gorilla knows about in advance.
    // jsPsych uses a consistent format for it's data keys and we've added the ones relevant to this task to
    // the 'Metrics' section; located on the left hand side in the toolbar.

    // Important: If you need to add custom data keys, make sure you add them to the Metrics tool - otherwise Gorilla
    // won't know how to collect them!

    /* start the experiment */
    jsPsych.init({
        display_element: $('#gorilla')[0],
        timeline: timeline,
        preload_images: images,
        show_preload_progress_bar: true,
        on_data_update: function (data) {
            gorilla.metric(data)
        },
        on_finish: function (data) {
            gorilla.finish();
        }
    });
})