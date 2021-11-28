

import shell from 'shelljs';
import validate from "validate-npm-package-name";
import { Confirm, Input, Select } from "../prompt";
import isInstalledOnShell from "../util/isInstalledOnShell";
import ora from "ora"
import cliSpinners from 'cli-spinners';




const homedir = require('os').homedir();

function NodeJS_setup(verbose: boolean) {

    // mkdir src
    shell.mkdir("src")
    // touch src/index.ts
    shell.exec(`echo 'export default {}' > "src/index.ts"`, { silent: !verbose })
    // curl https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore -o .gitignore
    shell.exec("curl https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore -o .gitignore", { silent: !verbose })
    // yarn init -y
    shell.exec("yarn init -y", { silent: !verbose })
    // yarn add -D ts-node typescript nodemon @types/node
    shell.exec("yarn add -D ts-node typescript nodemon @types/node", { silent: !verbose })
    // echo '{"watch": ["src"],"ext": "ts,json","ignore": ["src/*.spec.ts","src/*.test.ts"],"exec": "ts-node ./src/index.ts"}' > "nodemon.json"
    shell.exec(`echo '{"watch": ["src"],"ext": "ts,json","ignore": ["src/*.spec.ts","src/*.test.ts"],"exec": "ts-node ./src/index.ts"}' > "nodemon.json"`, { silent: !verbose })
    // npx npm-add-script -k start -v "nodemon" -y
    shell.exec(`npx npm-add-script -k start -v "nodemon" -y`, { silent: !verbose })

}

function ExpressJS_setup(verbose: boolean) {

    // mkdir src
    shell.mkdir("src")

    // touch src/index.ts
    shell.touch("src/index.ts")


    // cat > src/index.ts <<- EOM
    // import express from 'express'
    // const app = express()
    // const port = 3000

    // app.get('/', (req, res) => {
    //   res.send('Hello World!')
    // })

    // app.listen(port, () => {
    //   console.log("Example app listening at http://localhost:"+port)
    // })
    // EOM
    shell.exec(`cat > src/index.ts <<- EOM
    import express from 'express'
    const app = express()
    const port = 3000
    
    app.get('/', (req, res) => {
      res.send('Hello World!')
    })
    
    app.listen(port, () => {
      console.log("Example app listening at http://localhost:"+port)
    })
    `, { silent: !verbose })


    // curl https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore -o .gitignore
    shell.exec("curl https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore -o .gitignore", { silent: !verbose })

    // yarn init -y
    // yarn add express
    shell.exec("yarn add express", { silent: !verbose })
    // yarn add -D ts-node typescript nodemon @types/node @types/express
    shell.exec("yarn add -D ts-node typescript nodemon @types/node @types/express", { silent: !verbose })
    // echo '{"watch": ["src"],"ext": "ts,json","ignore": ["src/*.spec.ts","src/*.test.ts"],"exec": "ts-node ./src/index.ts"}' > "nodemon.json"
    shell.exec(`echo '{"watch": ["src"],"ext": "ts,json","ignore": ["src/*.spec.ts","src/*.test.ts"],"exec": "ts-node ./src/index.ts"}' > "nodemon.json"`, { silent: !verbose })

    // npx -y npm-add-script -k start -v "nodemon" 
    shell.exec(`npx npm-add-script -k start -v "nodemon" -y`, { silent: !verbose })

}

export default async (initialProjectName?: string | number, initialProjectTemplate?: string | number, verbose?: boolean, openInCode?: boolean) => {
    isInstalledOnShell("node")
    isInstalledOnShell("yarn")
    isInstalledOnShell("curl")
    isInstalledOnShell("npx")
    isInstalledOnShell("code")

    const isVerbose = verbose === true

    if (initialProjectName !== undefined) {
        const valid = validate(`${initialProjectName}`);
        if (!valid.validForNewPackages || !valid.validForOldPackages) {
            //@ts-ignore
            if (valid.errors && valid.errors.length) console.error(valid.errors[0])
            //@ts-ignore
            if (valid.warnings && valid.warnings.length) console.error(valid.warnings[0])

            return void 1
        }
    }

    const projectTypes = ["NodeJS", "ExpressJS", "ReactJS"]

    if (initialProjectTemplate !== undefined) {
        const valid = projectTypes.some(pt => pt === initialProjectTemplate)
        if (!valid) {
            console.log(`${initialProjectTemplate} is an invalid project template, template must be one of the following:\n\n`)
            console.log(...projectTypes)
            console.log("\n\n")
            return void 1
        }
    }

    const project_name = initialProjectName !== undefined ? initialProjectName : await Input("projectName", "Enter the new project name:", (value) => {
        const valid = validate(value);
        if (valid.validForNewPackages && valid.validForOldPackages) return true;
        //@ts-ignore
        if (valid.errors && valid.errors.length) return valid.errors[0]
        //@ts-ignore
        if (valid.warnings && valid.warnings.length) return valid.warnings[0]
        return "error"
    })


    const choice = initialProjectTemplate !== undefined ? initialProjectTemplate : await Select("choice", "Choose a starting template", projectTypes)

    shell.cd(homedir)

    // project dir
    const project_dir = "Projects/"

    //check dir does not exist
    const project_dir_exists = shell.exec(`[ ! -d ${project_dir} ] && echo true`)

    if (project_dir_exists.stderr === "true") {
        console.log(`'${homedir}/${project_dir}' does not exist, creating directory`)
        shell.mkdir(project_dir)
    }

    shell.cd(project_dir)

    //check if dir exist
    const project_name_exists = shell.exec(`[ -d ${project_name}/ ] && echo true`, { silent: true })

    if (project_name_exists.stdout.trim() === "true") {
        console.log(`'${homedir}/${project_dir}${project_name}' exist, aborting!`)
        return void 1
    }

    // // # make folder
    shell.mkdir(project_name)



    // // # cd to dir

    shell.cd(project_name)

    // setup
    const spinner = ora({
        text: "Hatchin' the ducklets",
        ...cliSpinners.dots

    }).start()
    switch (choice) {
        case "NodeJS":
            NodeJS_setup(isVerbose)
            break;
        case "ExpressJS":
            ExpressJS_setup(isVerbose)
            break;
        case "ReactJS":
            shell.exec("yarn create react-app . --template typescript", { silent: !isVerbose })
            break;
        default:
            return void 1

    }
    spinner.stop()


    const open = openInCode ? openInCode : await Confirm("code", "Would you like to open in VScode?")

    if (open) shell.exec("code .")
}
