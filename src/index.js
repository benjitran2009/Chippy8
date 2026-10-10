let memory = new Uint16Array(4096);
let register = {};
let stack = [];
let indexRegister = 0;
let currentKey = "";
let delayTimer = 0;
let soundTimer = 0;
document.addEventListener("keypress", (e) => {
  currentKey = e.key.toLowerCase();
});

const font = {
  0: [0xf0, 0x90, 0x90, 0x90, 0xf0], // 0
  1: [0x20, 0x60, 0x20, 0x20, 0x70], // 1
  2: [0xf0, 0x10, 0xf0, 0x80, 0xf0], // 2
  3: [0xf0, 0x10, 0xf0, 0x10, 0xf0], // 3
  4: [0x90, 0x90, 0xf0, 0x10, 0x10], // 4
  5: [0xf0, 0x80, 0xf0, 0x10, 0xf0], // 5
  6: [0xf0, 0x80, 0xf0, 0x90, 0xf0], // 6
  7: [0xf0, 0x10, 0x20, 0x40, 0x40], // 7
  8: [0xf0, 0x90, 0xf0, 0x90, 0xf0], // 8
  9: [0xf0, 0x90, 0xf0, 0x10, 0xf0], // 9
  A: [0xf0, 0x90, 0xf0, 0x90, 0x90], // A
  B: [0xe0, 0x90, 0xe0, 0x90, 0xe0], // B
  C: [0xf0, 0x80, 0x80, 0x80, 0xf0], // C
  D: [0xe0, 0x90, 0x90, 0x90, 0xe0], // D
  E: [0xf0, 0x80, 0xf0, 0x80, 0xf0], // E
  F: [0xf0, 0x80, 0xf0, 0x80, 0x80], // F
};

class Screen {
  /**
   * Create a screen class.
   * @param {HTMLCanvasElement} canvas - The HTMLCanvasElement to draw to
   **/
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.context.fillStyle = "black";
    this.canvas.width = 640;
    this.canvas.height = 320;
    this.context.fillRect(0, 0, 640, 320);
    this.data = [];
    for (let indx = 0; indx < 32; indx++) {
      this.data[indx] = [];
      for (let indx2 = 0; indx2 < 64; indx2++) {
        this.data[indx][indx2] = false;
      }
    }
    console.log(this.data);
    return this;
  }
  on(x, y) {
    this.context.fillStyle = "white";
    this.context.fillRect(x * 10, y * 10, 10, 10);
    this.data[y][x] = true;
  }
  off(x, y) {
    this.context.fillStyle = "black";
    this.context.fillRect(x * 10, y * 10, 10, 10);
    this.data[y][x] = false;
  }
  get(x, y) {
    //console.log(x,y);
    return this.data?.[y]?.[x]; //|| false;
  }
}

class Chip {
  constructor() {}

  /**
   * @param {{[name: string|number]: number[]}} font - font to load
   */
  async loadFont(font) {
    let indx = 0;
    for (let [_, value] of Object.entries(font)) {
      //console.log(value)
      value.forEach((v) => {
        memory[indx] = v;
        indx++;
      });
    }
  }

  /**
   *
   * @param {File} rom - file to load
   */
  async loadRomFile(rom) {
    this.romData = await rom.arrayBuffer(); //await customRomInput.files[0].arrayBuffer();
    this.instructionArray = new Uint8Array(this.romData);
    this.instructionArray.forEach((val, indx) => {
      memory[indx + 0x200] = val;
    });
  }
  async loadRomBytes(bytes) {
    this.romData = bytes;
    this.instructionArray = bytes;
    this.instructionArray.forEach((val, indx) => {
      memory[indx + 0x200] = val;
    });
  }

  hexStringToNumber(hex) {
    return Number(`0x${hex}`);
  }
  executeInstruction(byteOne, byteTwo) {
    const b1String = byteOne.toString(16).padStart(2, "0").toLowerCase();
    const b2String = byteTwo.toString(16).padStart(2, "0").toLowerCase();
    const nibble1 = b1String[0];
    const nibble2 = b1String[1];
    const nibble3 = b2String[0];
    const nibble4 = b2String[1];
    const nnn = nibble2 + nibble3 + nibble4;
    byteOne = b1String;
    byteTwo = b2String;
    console.log(`byteOne: ${b1String} | byteTwo: ${b2String}
    nibble1: ${nibble1}
    nibble2: ${nibble2}
    nibble3: ${nibble3}
    nibble4: ${nibble4}
    mem: ${nnn} `);

    switch (nibble1) {
      case "0":
        if (nnn == "0e0") {
          // this is just clear screen.
          console.log("CLEAR");
          const x = new Array(64);
          const y = new Array(32);
          y.forEach((_, indxY) => {
            x.forEach((_, indxX) => {
              chippyScreen.off(indxX, indxY);
            });
          });
        } else if (nibble2 == "0") {
          this.programCounter = stack.pop();
        }
        break;
      case "1":
        // JUMP instruction - this should jump to NNN
        console.log("JUMP");
        this.programCounter = this.hexStringToNumber(nnn);
        break;
      case "2":
        console.log("SUBROUTINE");
        stack.push(this.programCounter);
        this.programCounter = this.hexStringToNumber(nnn);
        break;
      case "3":
        if (
          register[this.hexStringToNumber(nibble2)] ===
          this.hexStringToNumber(byteTwo)
        ) {
          this.programCounter += 2;
        }
        break;
      case "3":
        if (
          register[this.hexStringToNumber(nibble2)] !==
          this.hexStringToNumber(byteTwo)
        ) {
          this.programCounter += 2;
        }
        break;
      case "5":
        if (
          register[this.hexStringToNumber(nibble2)] ===
          register[this.hexStringToNumber(nibble3)]
        ) {
          this.programCounter += 2;
        }
        break;
      case "6":
        // SET set VX to NN (6XNN)
        console.log("SET");
        register[this.hexStringToNumber(nibble2)] =
          this.hexStringToNumber(byteTwo);
        break;
      case "7":
        console.log("ADD");
        register[this.hexStringToNumber(nibble2)] +=
          this.hexStringToNumber(byteTwo);
        break;
      case "8":
        switch (nibble4) {
          case "0":
            register[this.hexStringToNumber(nibble2)] =
              register[this.hexStringToNumber(nibble3)];
            break;
          case "1":
            register[this.hexStringToNumber(nibble2)] =
              register[this.hexStringToNumber(nibble2)] |
              register[this.hexStringToNumber(nibble3)];
            break;
          case "2":
            register[this.hexStringToNumber(nibble2)] =
              register[this.hexStringToNumber(nibble2)] &
              register[this.hexStringToNumber(nibble3)];
            break;
          case "3":
            register[this.hexStringToNumber(nibble2)] =
              register[this.hexStringToNumber(nibble2)] ^
              register[this.hexStringToNumber(nibble3)];
            break;
          case "4":
            var result =
              register[this.hexStringToNumber(nibble2)] &
              register[this.hexStringToNumber(nibble3)];
            if (result > 255) {
              register[0xf] = 1;
              result = result % 256;
            } else {
              register[0xf] = 0;
            }
            register[this.hexStringToNumber(nibble2)] = 0;
            break;
          case "5":
            register[this.hexStringToNumber(nibble2)] =
              register[this.hexStringToNumber(nibble2)] -
              register[this.hexStringToNumber(nibble3)];
            break;
          case "6":
            // this one might be wrong
            register[this.hexStringToNumber(nibble2)] =
              register[this.hexStringToNumber(nibble3)]; //OPT
            var shiftedBit = register[this.hexStringToNumber(nibble2)] & 1;
            register[this.hexStringToNumber(nibble2)] =
              register[this.hexStringToNumber(nibble2)] >> 1;
            register[0xf] = shiftedBit ? 1 : 0;
            break;
          case "7":
            register[this.hexStringToNumber(nibble2)] =
              register[this.hexStringToNumber(nibble3)] -
              register[this.hexStringToNumber(nibble2)];
            break;
          case "E":
            register[this.hexStringToNumber(nibble2)] =
              register[this.hexStringToNumber(nibble3)]; //OPT
            var shiftedBit = register[this.hexStringToNumber(nibble2)] & 1;
            register[this.hexStringToNumber(nibble2)] =
              register[this.hexStringToNumber(nibble2)] << 1;
            register[0xf] = shiftedBit ? 1 : 0;
            break;
        }
        break;
      case "9":
        if (
          register[this.hexStringToNumber(nibble2)] !==
          register[this.hexStringToNumber(nibble3)]
        ) {
          this.programCounter += 2;
        }
        break;
      case "a":
        indexRegister = this.hexStringToNumber(nnn);
        break;
      case "b":
        this.programCounter = this.hexStringToNumber(nnn) + register[0x0];
        break;
      case "c":
        register[this.hexStringToNumber(nibble2)] =
          Math.random & this.hexStringToNumber(byteTwo);
        break;
      case "d":
        console.log("DRAW");
        const pixelsTall = this.hexStringToNumber(nibble4);
        let x = register[this.hexStringToNumber(nibble2)] % 64;
        let y = register[this.hexStringToNumber(nibble3)] % 32;
        console.log(
          `Tall: ${pixelsTall} x: ${x} | y: ${y} | i: ${indexRegister}`,
        );
        register[0xf] = 0;
        for (let i = 0; i < pixelsTall; i++) {
          const nByte = memory[indexRegister + i].toString(2).padStart(8, "0");
          //x=x%64;
          //y=y%32;
          x = register[this.hexStringToNumber(nibble2)] % 64;
          //y = register[this.hexStringToNumber(nibble3)] % 32;
          nByte.split("").forEach((val) => {
            //console.log(val)
            val = parseInt(val);

            if (val && chippyScreen.get(x, y)) {
              console.log("OFF");
              chippyScreen.off(x, y);
              register[0xf] = true;
            } else if (val && !chippyScreen.get(x, y)) {
              console.log("ON");
              chippyScreen.on(x, y);
            }
            if (x == 64) return; //alert("stop");
            x++;
          });
          if (y == 32) return;
          y++;
          //console.log("nByte:" + nByte.toString(2).padEnd(8,"0"));
          //nBy
          //console.log("nByte: "+nByte);
        }

        break;
      case "e":
        switch (byteTwo) {
          case "9e":
            if (currentKey === register[this.hexStringToNumber(nibble2)]) {
              this.programCounter += 2;
            }
            break;
          case "a1":
            if (currentKey !== register[this.hexStringToNumber(nibble2)]) {
              this.programCounter += 2;
            }
            break;
        }

        break;
      case "f":
        switch (byteTwo) {
          case "07":
            register[this.hexStringToNumber(nibble2)] = delayTimer;
            break;
          case "15":
            delayTimer = register[this.hexStringToNumber(nibble2)];
            break;
          case "18":
            soundTimer = register[this.hexStringToNumber(nibble2)];
            break;
        }
        break;
      default:
        console.warn(
          `Unimplemented instruction: ${b1String + b2String}. This instruction will be skipped!`,
        );
        break;
    }
  }
  runProgram() {
    if (!this.romData || !this.instructionArray)
      throw new Error("No rom loaded!");
    this.programCounter = 0;
    const programLoop = setInterval(() => {
      if (this.programCounter < this.instructionArray.length) {
        this.executeInstruction(
          this.instructionArray[this.programCounter],
          this.instructionArray[this.programCounter + 1],
        ); // a|b
        this.programCounter += 2;
      } else {
        clearInterval(programLoop);
        alert("Program finished");
        return;
      }
    }, 1000 / 700);
    const soundLoop = setInterval(() => {
      soundTimer = soundTimer - 1 <= -1 ? 0 : soundTimer - 1;
    }, 1000 / 60);
    const delayLoop = setInterval(() => {
      delayTimer = delayTimer - 1 <= -1 ? 0 : soundTimer - 1;
    }, 1000 / 60);
    /*
    while ((this.programCounter += 2 < this.instructionArray.length)) {
      this.executeInstruction(
        this.instructionArray[this.programCounter] >> 8,
        this.instructionArray[this.programCounter + 1] >> 8,
      ); // a|b
    }*/
    //this.programCounter = 0;
    //this.executeInstruction(this.instructionArray[this.programCounter] >> 8, this.instructionArray[this.programCounter + 1] >> 8); // a|b
    //this.programCounter+=2;

    //const instruction
    //setInterval()
  }
}

/**@type {chippyScreen} */
const chippyScreen = new Screen(document.querySelector("#screen"));

/**@type {Chip} */
const chip = new Chip();

chip.loadFont(font);

/**@type {HTMLButtonElement} */
const loadCustomRom = document.querySelector("#loadrom");
/**@type {HTMLInputElement} */
const customRomInput = document.querySelector("#rom");
loadCustomRom.addEventListener("click", async () => {
  await chip.loadRomFile(customRomInput.files[0]);
  chip.runProgram();
  //const romData = await customRomInput.files[0].arrayBuffer();
  //const instructionArray = new Uint8Array(romData);

  //console.log(romData);
});

const downloadAndReturnData = async (url) =>
  fetch(url).then(async (x) => {
    return x && x.ok ? await x.bytes() : undefined;
  });

document.querySelectorAll("button[loadrom]").forEach(async (element) => {
  const link = element.getAttribute("loadrom");
  const data = await downloadAndReturnData(link);
  element.addEventListener("click", async () => {
    await chip.loadRomBytes(data);
    chip.runProgram();
  });
});
// init screen
