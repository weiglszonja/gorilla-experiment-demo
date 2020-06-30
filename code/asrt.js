// Implementation of the ASRT task

import gorilla = require("gorilla/gorilla");

const jsPsych = window['jsPsych'];

gorilla.ready(function () {


    // URL's for the pattern and random stimuli and the lab logo:
    const patternURL = gorilla.stimuliURL('cat.jpg');
    const randomURL = gorilla.stimuliURL('cat2.jpg');
    const logoURL = gorilla.stimuliURL('memo_logo.jpg');

    // We also create an array containing all the URL's for our required stimuli.
    // This is an important step which will be discussed further below!
    const images = [];
    images.push(patternURL);
    images.push(randomURL);
    images.push(logoURL);

    /* create timeline */
    let timeline = []; //create timeline

    const welcome = { //create welcome message trial
        type: "html-keyboard-response",
        stimulus: "<h1>Welcome to the experiment!</h1>" +
            "</p> Press any key to begin.</p>" +
            "<div class='float: center;'><img src='" + logoURL + "' height='100' width='120'/></div>"
    };

    const instructions1 = { //define instruction trial 1
        type: "html-keyboard-response",
        stimulus: "<p>In this experiment, you will see four circles on the screen.</p>" +
            "<p>An <b>image of a cat</b> will appear in one of the circles.</p>" +
            "<p>Your task will be to press the button corresponding to the position of the cat.</p>" +
            "<p>Press any key to continue!</p>"
    };

    const instructions2 = { //define instruction trial 2
        type: "html-keyboard-response",
        stimulus: "<p class = 'buttons'>If the cat is in the first position, press the <strong>'S'</strong> button!</p>" +
            "<p>If the cat is in the second position, press the <strong>'D'</strong> button!</p>" +
            "<p>If the cat is in the third position, press the <strong>'J'</strong> button!</p>" +
            "<p>If the cat is in the fourth position, press the <strong>'K'</strong> button!</p>" +
            "<p class = 'alert'><strong>Try to be as fast and as accurate as possible!</strong></p>" +
            "<p>If you are ready, press ANY key to start a practice!</p>"
    };

    const instructions3 = { //define instruction trial 3
        type: "html-keyboard-response",
        stimulus: "<p>The real task begins now.</p>" +
            "<p>If you are ready, press ANY key to start the task!</p>"
    };

    const end = { //define end of experiment message
        type: "html-keyboard-response",
        stimulus: "<p>End of the experiment.</p>" +
            "<p>Press ANY key to continue!</p>"
    };

    const subject_id = Math.floor(Math.random() * 100000) //generate a random subject number
    const sequences = [[0, 1, 2, 3], [0, 2, 1, 3]]; //define possible sequences: 4 positions (0 for first etc.)
    const usedSequence = sequences[Math.floor(Math.random() * sequences.length)]; //choose a random sequence from the list of sequences
    const responseKeys = [['s', 'd', 'j', 'k']]; //response keys settings

    /* define feedback message - based on only the first button press for the given stimulus */
    const feedback = {
        type: "html-keyboard-response",
        stimulus: function () {
            let message;
            let trials = jsPsych.data.get();
            let blockNum = jsPsych.data.get().last(1).values()[0].block; //relies only on the performance in the last block
            let correct_trials = trials.filter({correct: true, block: blockNum, firstResponse: 1}); //only: correct response, last block, first button press for a given trial
            let numberOfTrials = trials.filter({block: blockNum, firstResponse: 1}).count(); //number of DIFFERENT trials
            let accuracy = Math.round(correct_trials.count() / numberOfTrials * 100); //mean accuracy in the given block
            let rt = Math.round(correct_trials.select('rt').mean()); //mean rt of the given block
            if (accuracy < 92) { //if mean accuracy is less than 92, show this message
                message = "<p class='message'><strong>Try to be more accurate!</strong></p>"
            } else if (rt > 500) { //if mean rt is higher than 500, show this message
                message = "<p class='message'><strong>Try to be faster!</strong></p>"
            } else { //if mean accuracy is over 92% and mean rt is smaller than 500 ms, show this message
                message = "<p class='message'><strong>Please continue!</strong></p>"
            }
            return "<h2>End of block " + blockNum + "</h2>" +
                "<p>Your accuracy: " + accuracy + "%</p>" +
                "<p>Your average response time: " + rt + " ms</p>" + message +
                "<h3 class='continue'>Press any key to continue!</h3>";
        }
    }


    /*FUNCTIONS*/

    /*function for incorrect pattern trial procedures*/

    function IncorrectTrialProcs(timeline, timelineVariables) {
        this.timeline = timeline,
            this.timeline_variables = timelineVariables,
            this.conditional_function = function () { //function only happens is response is not correct!
                const data = jsPsych.data.get().last(1).values()[0];
                return data.correct !== true;
            }
    }

    /*function for random stimulus generation*/

    function randomStimulusProcedureGenerator(block) {
        let newRandom = Math.floor(Math.random() * 4); //choose a random position between 1-4
        let randomStimulus = [{stimulus: [0, newRandom], data: {tripletType: "R", block: block, firstResponse: 1}}] //jspsych.init modifies if necessary
        return {
            timeline: [random],
            timeline_variables: randomStimulus
        }
    }

    /*function for inserting the same random element after incorrect response*/

    function randomIfInsert(actualRandom) {
        return {
            timeline: [randomIf],
            timeline_variables: actualRandom.timeline_variables,
            conditional_function: function () { //function only happens is response is not correct!
                let data = jsPsych.data.get().last(1).values()[0];
                return data.correct !== true;
            }
        }
    }

    /*function for inserting conditional after incorrect response*/

    function insertConditionalAfterIncorrectResponse(element) {
        for (let i = 0; i < 100; i++) {
            timeline.push(element);
        }
    }

/////////////////////////////////////////

    /*TIMELINE*/

    timeline.push(welcome);
    timeline.push(instructions1);
    timeline.push(instructions2);
    jsPsych.data.addProperties({subject: subject_id}); //add subject ID to the data

    /*set properties of pattern trials*/

    let patternTrialProperties = {
        type: "serial-reaction-time",
        grid: [[1, 1, 1, 1]],
        choices: responseKeys,
        target: jsPsych.timelineVariable('stimulus'),
        pre_target_duration: 120, //RSI in ms
        target_color: `url(${patternURL})`, //set image for pattern trials
        data: jsPsych.timelineVariable('data'),
        response_ends_trial: true,
    }

    let patternIfTrialProperties = {
        type: "serial-reaction-time",
        grid: [[1, 1, 1, 1]],
        choices: responseKeys,
        target: jsPsych.timelineVariable('stimulus'),
        pre_target_duration: 0, //RSI set to 0 after incorrect response
        target_color: `url(${patternURL})`, //set image for pattern trials
        data: jsPsych.timelineVariable('data'),
        response_ends_trial: true, //the default target_color, i.e. the "target stimulus" is set in the source code
    }

    /*set properties of random trials*/

    let randomTrialProperties = {
        type: "serial-reaction-time",
        grid: [[1, 1, 1, 1]],
        choices: responseKeys,
        target: jsPsych.timelineVariable('stimulus'),
        pre_target_duration: 120,
        target_color: `url(${randomURL})`, //set image for random trials
        data: jsPsych.timelineVariable('data'),
        response_ends_trial: true,
    };

    let randomIfTrialProperties = {
        type: "serial-reaction-time",
        grid: [[1, 1, 1, 1]],
        choices: responseKeys,
        target: jsPsych.timelineVariable('stimulus'),
        pre_target_duration: 0,
        target_color: `url(${randomURL})`, //set image for random trials
        data: jsPsych.timelineVariable('data'),
        response_ends_trial: true,
    };

    let random = randomTrialProperties
    let randomIf = randomIfTrialProperties

    /*set up blocks*/

    /* practice blocks*/
    let actualRandom;

    for (let j = 1; j < 3; j++) { //SET UP NUMBER OF PRACTICE BLOCKS HERE
        for (let l = 1; l < 5; l++) {
            actualRandom = randomStimulusProcedureGenerator(j)
            timeline.push(actualRandom);
            insertConditionalAfterIncorrectResponse(randomIfInsert(actualRandom));
        }
        timeline.push(feedback);
    }

    timeline.push(instructions3);

    /* set up pattern protocols */

    for (let j = 1; j < 3; j++) { //2 blocks: MODIFY HERE FOR CHANGE IN THE NUMBER OF BLOCKS
        let dataForPattern = {tripletType: "P", block: j, firstResponse: 1} //output parameters for pattern stimuli
        /* first five random stimuli at the beginning of the block*/

        for (let l = 1; l < 6; l++) {
            actualRandom = randomStimulusProcedureGenerator(j)
            timeline.push(actualRandom);
            insertConditionalAfterIncorrectResponse(randomIfInsert(actualRandom));
        }

        /*create all remaining block elements*/

        for (let k = 0; k < 2; k++) { //repeat 8-elements sequence 2 times //MODIFY HERE FOR CHANGE IN THE ELEMENTS IN BLOCKS
            for (let n = 0; n < 4; n++) { //repeat pattern + repeat random
                actualRandom = randomStimulusProcedureGenerator(j)
                timeline.push(actualRandom);
                insertConditionalAfterIncorrectResponse(randomIfInsert(actualRandom));
                timeline.push(
                    {
                        timeline: [patternTrialProperties],
                        timeline_variables: [{stimulus: [0, usedSequence[n]], data: dataForPattern}]
                    })
                ;
                insertConditionalAfterIncorrectResponse(new IncorrectTrialProcs([patternIfTrialProperties], [{
                    stimulus: [0, usedSequence[n]],
                    data: dataForPattern
                }]))
            }
        }

        /*show feedback after the end of the block*/

        timeline.push(feedback);
    }

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
            var lastTrialMinus1 = jsPsych.data.get().last(2).values()[0]
            var lastTrial = jsPsych.data.get().last(1).values()[0]
            if (typeof (lastTrial.target) != "undefined") {
                if (lastTrialMinus1.correct === false) {
                    if (lastTrial.target === lastTrialMinus1.target) {
                        lastTrial.firstResponse = 0
                    }
                }
            }

            gorilla.metric(data)
        },
        on_finish: function (data) {
            gorilla.finish();
        }
    });
})