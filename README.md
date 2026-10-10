# Chippy8

## A CHIP8 Emulator written in JavaScript

"never use UInt16Array again" -ben

- help from: [https://tobiasvl.github.io/blog/write-a-chip-8-emulator/#6xnn-set](https://tobiasvl.github.io/blog/write-a-chip-8-emulator/#6xnn-set)

## How the development went

The boilerplate for everything was relatively easy, but once I started doing the programming for the emulator I made some mistakes that
catched on later when I was implementing the other instructions like not including a index register or a program(?) register and a screen
that was broken but looked fine to me. I also used the wrong type of array which skipped every other byte. Other than that, the instructions
being implemented were straightforward with the guide that was provided in the guides tab for emulator and was pretty challenging at some parts
which I did like but overall would write another emulator after this.
Currently there is only 6 instructions implemented out of 35(?) but the rest should be relatively easy.
The goal is to ship with atleast 50% of instructions implemented or enough to run all the tests on CHIP8 Test Suite.

> Instructions implemented:
> 🟥 - Broken
> 🟩 - Working
> 🟨 - Semi Working

| Instruction | Status | Note |
| -- | -- | -- |
| 00EO | 🟩 | none |
| 1NNN | 🟩 | none |
| 6XNN | 🟩 | none |
| 7XNN | 🟩 | none |
| ANNN | 🟩 | none |
| DXYN | 🟨 | May be buggy idk |
