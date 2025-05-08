# Git Shortcuts command line application

## To use in bash console
1. Add a .bashrc file in your home folder.
2. Add this to the .bashrc to be able to use handy shortcuts
```
  # Git shortcuts aliases
alias git-shortcuts="~/OneDrive/Documenten/custom-terminal/git-shortcuts.ts"

alias gaa="git-shortcuts gaa"
alias gra="git-shortcuts gra"
alias gcm="git-shortcuts gcm"
alias gp="git-shortcuts gp"
alias gpb="git-shortcuts gpb"
alias gpl="git-shortcuts gpl"
alias gplb="git-shortcuts gplb"
alias gp="git-shortcuts gp"
alias gs="git-shortcuts gs"
alias gl="git-shortcuts gl"
alias gb="git-shortcuts gb"
alias gbd="git-shortcuts gbd"
alias gco="git-shortcuts gco"
alias gcb="git-shortcuts gcb"
alias gsh="git-shortcuts gsh"
alias cl="git-shortcuts cl"
```
3. Now use this command to refresh the bash terminal:
```
source ~/.bashrc
```
- '~' is the home folder where the .bashrc file is located

4. Now use gsh to view all the commands available: output will look like this:
```
  Git Shortcuts - Available Commands:
----------------------------------
gaa               - git add .
gra               - git restore .
gcm "message"     - git commit -m "message"
gp                - git push
gpb branch-name   - git push origin branch-name
gpl               - git pull
gplb branch-name  - git pull origin branch-name
gs                - git status
gl                - git log
gb                - git branch
gbd branch-name   - git branch -d branch-name
gco branch-name   - git checkout branch-name
gcb branch-name   - git checkout -b branch-name
cl                - clear
gsh               - Show this help message
``` 
