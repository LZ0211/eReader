"use strict";
const fs = require('fs')
const path = require('path')

fs.mkdirsSync = function (dir){
    if (fs.existsSync(dir)) return
    let dirname = path.dirname(dir)
    fs.existsSync(dirname) || fs.mkdirsSync(dirname)
    fs.mkdirSync(dir)
}

fs.rmdirsSync = function (root){
    if (!fs.existsSync(root)) return
    let filestat = fs.statSync(root)
    if (filestat.isDirectory() == true){
        let files = fs.readdirSync(root)
        files.forEach(function (file){
            fs.rmdirsSync(path.join(root,file))
        })
        fs.rmdirSync(root)
    }else {
        fs.unlinkSync(root)
    }
}