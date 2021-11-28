#!/bin/bash

source "$home/lib/term_colors"

echo pwd

# dependecy checker

is_installed() {
echo -e "\n${green}checking $1 is installed ${reset}"

    if ! command -v $1; then
        echo "$1 CLI could not be found, you must install $1 to continue"
        exit 1
    fi
}

# check that all dependecies are installed

is_installed "node"
is_installed "yarn"
is_installed "curl"
is_installed "npx"
is_installed "code"

# Renders a text based list of options that can be selected by the
# user using up, down and enter keys and returns the chosen option.
#
#   Arguments   : list of options, maximum of 256
#                 "opt1" "opt2" ...
#   Return value: selected index (0 for opt1, 1 for opt2 ...)
function select_option {

    # little helpers for terminal print control and key input
    ESC=$( printf "\033")
    cursor_blink_on()  { printf "$ESC[?25h"; }
    cursor_blink_off() { printf "$ESC[?25l"; }
    cursor_to()        { printf "$ESC[$1;${2:-1}H"; }
    print_option()     { printf "   $1 "; }
    print_selected()   { printf "  $ESC[7m $1 $ESC[27m"; }
    get_cursor_row()   { IFS=';' read -sdR -p $'\E[6n' ROW COL; echo ${ROW#*[}; }
    key_input()        { read -s -n3 key 2>/dev/null >&2
                         if [[ $key = $ESC[A ]]; then echo up;    fi
                         if [[ $key = $ESC[B ]]; then echo down;  fi
                         if [[ $key = ""     ]]; then echo enter; fi; }

    # initially print empty new lines (scroll down if at bottom of screen)
    for opt; do printf "\n"; done

    # determine current screen position for overwriting the options
    local lastrow=`get_cursor_row`
    local startrow=$(($lastrow - $#))

    # ensure cursor and input echoing back on upon a ctrl+c during read -s
    trap "cursor_blink_on; stty echo; printf '\n'; exit" 2
    cursor_blink_off

    local selected=0
    while true; do
        # print options by overwriting the last lines
        local idx=0
        for opt; do
            cursor_to $(($startrow + $idx))
            if [ $idx -eq $selected ]; then
                print_selected "$opt"
            else
                print_option "$opt"
            fi
            ((idx++))
        done

        # user key control
        case `key_input` in
            enter) break;;
            up)    ((selected--));
                   if [ $selected -lt 0 ]; then selected=$(($# - 1)); fi;;
            down)  ((selected++));
                   if [ $selected -ge $# ]; then selected=0; fi;;
        esac
    done

    # cursor position back to normal
    cursor_to $lastrow
    printf "\n"
    cursor_blink_on

    return $selected
}

function NodeJS_setup {

mkdir src
touch src/index.ts
curl https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore -o .gitignore
yarn init -y
yarn add -D ts-node typescript nodemon @types/node
echo '{"watch": ["src"],"ext": "ts,json","ignore": ["src/*.spec.ts","src/*.test.ts"],"exec": "ts-node ./src/index.ts"}' > "nodemon.json"
npx npm-add-script -k start -v "nodemon" -y

}

function ExpressJS_setup {

mkdir src
touch src/index.ts

cat > src/index.ts <<- EOM
import express from 'express'
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log("Example app listening at http://localhost:"+port)
})
EOM

curl https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore -o .gitignore
yarn init -y
yarn add express
yarn add -D ts-node typescript nodemon @types/node @types/express
echo '{"watch": ["src"],"ext": "ts,json","ignore": ["src/*.spec.ts","src/*.test.ts"],"exec": "ts-node ./src/index.ts"}' > "nodemon.json"
npx -y npm-add-script -k start -v "nodemon" 

}


# ask for new project name
echo -e "\n${green}Enter the new project name:${reset}"
read project_name

cd $HOME

# project dir
project_dir="Projects/"

if [ ! -d $project_dir ]; then
  mkdir $project_dir
fi

cd $project_dir

# make folder
mkdir $project_name

# cd to dir

cd "$project_name/"

# ask which user wants a new daybook

echo "Select one option using up/down keys and enter to confirm:"
echo

options=("NodeJS" "ExpressJS" "ReactJS")

select_option "${options[@]}"
choice=$?

value=${options[$choice]}

# setup project

case $value in
    "NodeJS" )
        NodeJS_setup
        code .
        ;;
    "ExpressJS" )
        ExpressJS_setup
        code .
        ;;
    "ReactJS" )
        yarn create react-app . --template typescript
        code .
        ;;
    
esac