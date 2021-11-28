
import Enquirer from 'enquirer'


export const Select = (name: string, message: string, choices: string[]) => Enquirer.prompt({
    type: 'select',
    name: name,
    message: message,
    choices: choices
       //@ts-ignore
    }).then(res=>res[name]).catch(err=>{throw err})
export const Input = (name: string, message: string, validate?:(value:string)=>boolean|string) => Enquirer.prompt({
    type: 'input',
    name: name,
    message: message,
    validate
       //@ts-ignore
}).then(res=>res[name]).catch(err=>{throw err})
export const Confirm = (name: string, message: string) => Enquirer.prompt({
    type: 'confirm',
    name: name,
    message: message
       //@ts-ignore
}).then(res=>res[name]).catch(err=>{throw err})