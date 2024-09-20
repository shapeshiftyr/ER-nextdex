import { exec } from "child_process";
import config from "../config.js";
import path from "path"
import { existsSync } from "fs";
import { updateData } from "./nextdex_controls.js";
import file_list from "./file_list.js";

const remote = {
    owner: "Elite-Redux",
    repo: "eliteredux-source",
    branch: "upcoming",
}
const folderPath = path.join('./', config.projectName)

export function initGitRepoIfDoesNotExist(){  
    console.log(`Checking if the ${folderPath} exist`)
    if (existsSync(folderPath))
        return console.log(`Repository confirmed to be existing`)
    console.log(`Repository does not exist, initializing it`)
    cloneRepository()
}

function cloneRepository(){
    //`mkdir ${config.projectName} && cd ${config.projectName} && git init`
    const cmdClone = `git clone -b ${remote.branch} --depth=1 --no-checkout --filter=blob:none https://${config.token}@github.com/${remote.owner}/${remote.repo} ${config.projectName}\
&& mkdir -p ${config.projectName}/data/maps`
    console.log(`Running ${cmdClone}`)
    exec(cmdClone, (err, stdout, stderr)=>{
        if (stdout) console.log('STDOUT: ', stdout)
        if (stderr) console.error('STDERR: ', stderr)
        if (err){
            console.error(`Failed when initing git in the subfolder \nerror:`, err)
            return
        }
        sparseCheckout()
    }) 
}

function sparseCheckout(){
    //this method is rather slow because files are downloaded one by one
    const cmdSparseCheckout = `git checkout ${remote.branch} -- ${file_list.list.join(' ')}`
    console.log(`Running ${cmdSparseCheckout}`)
    exec(cmdSparseCheckout,{cwd: config.projectName} ,(err, stdout, stderr)=>{
        if (stdout) console.log('STDOUT: ', stdout)
        if (stderr) console.error('STDERR: ', stderr)
        if (err){
            console.error(`Failed when sparsing checkout the repository \nerror:`, err)
            return
        }
        updateData()
    }) 
}

export function fetchChanges(){
    const cmdPull = `git fetch https://${config.token}@github.com/${remote.owner}/${remote.repo}`
    console.log(`Running ${cmdPull}`)
    exec(cmdPull, {cwd: folderPath}, (err, stdout, stderr)=>{
        if (stdout) console.log('STDOUT: ', stdout)
        if (stderr) console.error('STDERR: ', stderr)
        if (err){
            console.error(`Failed when trying to pull git content\nerror:`, err)
            return
        }
        sparseCheckout()
    })
}

