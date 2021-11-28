import shell from 'shelljs'

export default (shellProgramName:string)=>{
    if (!shell.which(shellProgramName)) {
        shell.echo(`Sorry, this script requires ${shellProgramName}`);
        shell.exit(1);
      }
}