const memory = new Uint16Array(4096);

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
    return this;
  }
  on(x, y) {
    this.context.fillStyle = "black";
    this.context.fillRect(x * 10, y * 10, 10, 10);
  }
  off(x, y) {
    this.context.fillStyle = "white";
    this.context.fillRect(x * 10, y * 10, 10, 10);
  }
}

class Chip {
  constructor() {}

  /**
   *
   * @param {File} rom - file to load
   */
  async loadRom(rom) {
    this.romData = await customRomInput.files[0].arrayBuffer();
    this.instructionArray = new Uint16Array(this.romData);
  }
  hexStringToNumber(hex) {
    return Number(`$0x{hex}`)
  }
  executeInstruction(byteOne, byteTwo) {
    const b1String = ("00" + byteOne.toString(16)).substr(-2);
    const b2String = ("00" + byteTwo.toString(16)).substr(-2);
    const nibble1 = b1String[0];
    const nibble2 = b1String[1];
    const nibble3 = b2String[0];
    const nibble4 = b2String[1];
    const nnn = nibble2 + nibble3 + nibble4;
    console.log(`byteOne: ${b1String} | byteTwo: ${b2String}
    nibble1: ${nibble1}
    nibble2: ${nibble2}
    nibble3: ${nibble3}
    nibble4: ${nibble4}
    mem: ${nnn} `);

    switch (nibble1) {
      case "0":
        break;
      case "1":
        // JUMP instruction - this should jump to NNN
        console.log("JUMP");
        this.programCounter = this.hexStringToNumber(nnn);
        break;
      case "6":
        break;
      case "7":
        break;
      case "A":
        break;
      case "D":
        break;
      default:
        console.warn(
          `Unimplemented instruction: ${b1String + b2String}. This instruction will be skipped!`,
        );
        break;
    }

    //dcode
    /*
    const nibble1;
    const nibble2;
    const nibble3;
    const nibble4;
    const byteOne;
    const byteTwo;*/
  }
  runProgram() {
    if (!this.romData || !this.instructionArray)
      throw new Error("No rom loaded!");
    this.programCounter = 0;
    const programLoop = setInterval(() => {
      if ((this.programCounter < this.instructionArray.length)) {
        this.executeInstruction(
          this.instructionArray[this.programCounter] >> 8,
          this.instructionArray[this.programCounter + 1] >> 8,
        ); // a|b
        this.programCounter+=2;
      } else {
        clearInterval(programLoop);
        alert("Program finished");
        return;
      }
    }, 1000 / 700);
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

/**@type {HTMLButtonElement} */
const loadCustomRom = document.querySelector("#loadrom");
/**@type {HTMLInputElement} */
const customRomInput = document.querySelector("#rom");
loadCustomRom.addEventListener("click", async () => {
  await chip.loadRom(customRomInput.files[0]);
  chip.runProgram();
  //const romData = await customRomInput.files[0].arrayBuffer();
  //const instructionArray = new Uint8Array(romData);

  //console.log(romData);
});
// init screen
