// check the .log file
// if the lastupdated dt is later than the lastcommitted dt, run cmd to commit it to github
const fs = require('fs')
const path = require('path');
const path_thisfile = path.resolve(__dirname);
let dir_hierarchy_arr = path_thisfile.split(path.sep);
dir_hierarchy_arr.splice(-3, 3); // oldvar.splice(): remove (and replace) the elements; newvar = oldvar.splice: the remainign elements after removing 
const path_project = dir_hierarchy_arr.join('/');
dir_hierarchy_arr.splice(-1, 1);
const path_logfile = `${path_project}/.log`;

const { exec } = require("child_process");

(async () => {

    console.log('running commit.js...')

    if (!fs.existsSync(path_logfile)) { return }

    // read txt from .log
    let logtext = fs.readFileSync(path_logfile, 'utf-8')
    // console.log(logtext)
    let logtext_lines_arr = logtext.split('\r\n')
    // console.log(logtext_lines_arr)

    let lastupdated_dtstr, lastcommitted_dtstr
    let newlines_arr = []
    logtext_lines_arr.forEach(t => {
        if (t.substring(0, 'lastupdated:'.length) === 'lastupdated:') {
            lastupdated_dtstr = t.split(':')[1]
            newlines_arr.push(t)
        } else if (t.substring(0, 'lastcommitted:'.length) === 'lastcommitted:') {
            lastcommitted_dtstr = t.split(':')[1]
        } else if (t.trim().length > 0) {
            newlines_arr.push(t)
        }
    })

    // console.log(32, lastupdated_dtstr, lastcommitted_dtstr)

    // convert the dt string to dt value
    let lastupdated_dt = convert_dtstr_to_dt(lastupdated_dtstr) // Date.parse('2024-01-01T00:01:00')
    console.log(34, lastupdated_dtstr, lastupdated_dt)
    let lastcommitted_dt = convert_dtstr_to_dt(lastcommitted_dtstr) // Date.parse('2023-12-02T00:01:55')
    console.log(36, lastcommitted_dt)

    // if (lastupdated_dt > lastcommitted_dt), run the cmd lines to commit to github
    if (37, lastupdated_dt > lastcommitted_dt) {
        // run the cmd lines to commit to github

        // update the lastcommitted dt
        let currentTime = new Date()
        lastcommitted_dtstr = make_date_time_stamp(currentTime)

        exec("git add .", (error, stdout, stderr) => {
            if (error) {
                console.log(`error1: ${error.message}`);
                return;
            }
            if (stderr) { // stderr may not be errors, could be just a warning or reminding msg ...
                // console.log(`git add: ${stderr}`);
                // return;
            }
            // console.log(`stdout: ${stdout}`);

            exec(`git commit -m "${lastcommitted_dtstr}"`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error2: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`git commit: ${stderr}`);
                    // return;
                }
                // console.log(`stdout: ${stdout}`);

                exec(`git push origin master`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error3: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`git push: ${stderr}`);
                        // return;
                    }
                    // console.log(`stdout: ${stdout}`);
                });


            });


        });





    }

    let lastcommitted_linestr = `lastcommitted:${lastcommitted_dtstr}\r\n`
    newlines_arr.push(lastcommitted_linestr)

    let newtext = newlines_arr.join('\r\n')
    fs.writeFileSync(path_logfile, newtext)



})()

function convert_dtstr_to_dt(yyyymmddhhmmss) {
    let yyyy = yyyymmddhhmmss.substring(0, 4)
    let MM = yyyymmddhhmmss.substring(4, 6)
    let dd = yyyymmddhhmmss.substring(6, 8)
    let hh = yyyymmddhhmmss.substring(8, 10)
    let mm = yyyymmddhhmmss.substring(10, 12)
    let ss = yyyymmddhhmmss.substring(12, 14)
    ss = add_leading_zeros(ss, "00")

    let dt = Date.parse(`${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`)
    // console.log(52, dt)
    return dt
}

function make_date_time_stamp(currentTime) {
    let year = currentTime.toLocaleString('default', { year: 'numeric' })
    let month = currentTime.toLocaleString('default', { month: "2-digit" })
    let day = currentTime.toLocaleString('default', { day: "2-digit" })
    let hours = currentTime.toLocaleString('default', { hour: '2-digit', hourCycle: 'h23' })
    let minutes = currentTime.toLocaleString('default', { minute: "2-digit" })
    let seconds = currentTime.toLocaleString('default', { second: "2-digit" })
    let datetime_stampstr = `${year}${month}${day}${hours}${minutes}${seconds}`
    return datetime_stampstr
}

function add_leading_zeros(num, pattern) {
    let numstr = num.toString();
    let length = pattern.length
    while (numstr.length < length) numstr = "0" + numstr;
    return numstr;
}