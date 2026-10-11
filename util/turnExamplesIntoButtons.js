const fs = require("node:fs");
const examples = fs.readdirSync("./examples");
examples.forEach((ex) => {
    //     <button type="button" loadrom="../examples/2-ibm-logo.ch8">2-ibm-logo.ch8</button>

    console.log(`<button type="button" loadrom="../examples/${ex}">${ex}</button>`);
})