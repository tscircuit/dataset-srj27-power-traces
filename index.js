"use strict"

exports.manifest = require("./manifest.json")

exports.sample001 = require("./samples/sample001-usbc-pico-power.srj.json")
exports.sample002 = require("./samples/sample002-dual-motor-driver.srj.json")
exports.sample003 = require("./samples/sample003-pico-led-matrix.srj.json")
exports.sample004 = require("./samples/sample004-usbc-lipo-charger.srj.json")
exports.sample005 = require("./samples/sample005-pt4115-led-driver.srj.json")
exports.sample006 = require("./samples/sample006-acs37800-power-meter.srj.json")

exports.dataset = {
  sample001: exports.sample001,
  sample002: exports.sample002,
  sample003: exports.sample003,
  sample004: exports.sample004,
  sample005: exports.sample005,
  sample006: exports.sample006,
}

exports.default = exports.dataset
