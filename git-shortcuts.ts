#!/usr/bin/env -S deno run --allow-run --allow-env

import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts"
import {
  green,
  red,
  yellow,
  rgb8,
  bold,
} from "https://deno.land/std@0.224.0/fmt/colors.ts"

const VERSION = "1.0.4"
const LATEST_UPDATE = "12/12/2025"

/* -----------------------------------------------------
   STREAMING EXECUTION HELPERS
----------------------------------------------------- */

async function runStreaming(cmd: string, args: string[] = []): Promise<void> {
  const command = new Deno.Command(cmd, {
    args,
    stdin: "inherit",
    stdout: "piped",
    stderr: "piped",
  })

  const child = command.spawn()

  // Stream stdout
  ;(async () => {
    for await (const chunk of child.stdout) {
      await Deno.stdout.write(chunk)
    }
  })()

  // Stream stderr
  ;(async () => {
    for await (const chunk of child.stderr) {
      await Deno.stderr.write(chunk)
    }
  })()

  await child.status // just wait — ignore CommandStatus
}

/* -----------------------------------------------------
   GIT SHORTCUTS
----------------------------------------------------- */

const SHORTCUTS: Record<string, (args: string[]) => Promise<void> | void> = {
  // git add .
  gaa: async () => await runStreaming("git", ["add", "."]),

  // git restore .
  gra: async () => await runStreaming("git", ["restore", "."]),

  // git commit -m "message"
  gcm: async (args: string[]) => {
    if (args.length === 0) {
      console.error("%cError: Commit message is required", "color: red")
      return
    }
    await runStreaming("git", ["commit", "-m", args.join(" ")])
  },

  // git push
  gp: async () => await runStreaming("git", ["push"]),

  // git push branch
  gpb: async (args: string[]) => {
    if (args.length === 0) {
      console.error("%cError: Branch name is required", "color: red")
      return
    }
    await runStreaming("git", ["push", "origin", args[0]])
  },

  // git pull
  gpl: async () => await runStreaming("git", ["pull"]),

  gplr: async () => await runStreaming("git", ["pull", "--rebase"]),

  // git pull branch
  gplb: async (args: string[]) => {
    if (args.length === 0) {
      console.error("%cError: Branch name is required", "color: red")
      return
    }
    await runStreaming("git", ["pull", "origin", args[0]])
  },

  // git merge branch
  gmb: async (args: string[]) => {
    if (args.length === 0) {
      console.error("%cError: Branch name is required", "color: red")
      return
    }
    await runStreaming("git", ["merge", args[0]])
  },

  // git status — still colored!
  gs: async () => {
    const command = new Deno.Command("git", { args: ["status"] })
    const { stdout } = await command.output()
    const output = new TextDecoder().decode(stdout)

    const lines = output.split("\n")

    let currentColor: ((text: string) => string) | null = null

    for (const line of lines) {
      if (line.includes("Changes to be committed:")) {
        currentColor = green
        console.log(line)
      } else if (line.includes("Changes not staged for commit:")) {
        currentColor = red
        console.log(line)
      } else if (line.includes("Untracked files:")) {
        currentColor = red
        console.log(line)
      } else if (line.trim() === "") {
        currentColor = null
        console.log(line)
      } else if (line.trimStart().startsWith("(")) {
        console.log(line)
      } else {
        console.log(currentColor ? currentColor(line) : line)
      }
    }
  },

  // git log — still colored!
  gl: async () => {
    const command = new Deno.Command("git", {
      args: ["log", "--decorate", "-n", "4"],
    })
    const { stdout } = await command.output()
    const output = new TextDecoder().decode(stdout)

    const lines = output.split("\n")

    for (const line of lines) {
      if (line.startsWith("commit")) {
        let coloredLine = line

        coloredLine = coloredLine.replace(/\(([^)]+)\)/, (_, group1) => {
          const parts = group1.split(", ").map((part: string) => {
            if (part.startsWith("HEAD -> ")) {
              const [, branch] = part.split("HEAD -> ")
              return bold(rgb8("HEAD -> ", 45)) + bold(green(branch))
            }
            if (part.startsWith("origin/")) return bold(red(part))
            return bold(green(part))
          })
          return `(${parts.join(", ")})`
        })

        console.log(yellow(coloredLine))
      } else {
        console.log(line)
      }
    }
  },

  // git branch
  gb: async () => await runStreaming("git", ["branch"]),

  // git branch -d
  gbd: async (args: string[]) => {
    if (args.length === 0) {
      console.error("%cError: Branch name is required", "color: red")
      return
    }
    await runStreaming("git", ["branch", "-d", args[0]])
  },

  // git checkout
  gco: async (args: string[]) => {
    if (args.length === 0) {
      console.error("%cError: Branch name is required", "color: red")
      return
    }
    await runStreaming("git", ["checkout", args[0]])
  },

  // git checkout -b
  gcb: async (args: string[]) => {
    if (args.length === 0) {
      console.error("%cError: Branch name is required", "color: red")
      return
    }
    await runStreaming("git", ["checkout", "-b", args[0]])
  },

  /* -----------------------------------------------------
     OTHER SHORTCUTS
  ----------------------------------------------------- */

  // clear
  cl: async () => await runStreaming("clear"),

  // deno upgrade
  du: async () => await runStreaming("deno", ["upgrade"]),

  // show help
  gsh: () => {
    console.log(
      `%c
Git Shortcuts - Available Commands:
----------------------------------
gaa               - git add .
gra               - git restore .
gcm "message"     - git commit -m "message"
gp                - git push
gpb branch-name   - git push origin branch-name
gpl               - git pull
gplr              - git pull --rebase
gplb branch-name  - git pull origin branch-name
gmb branch-name   - git merge branch-name
gs                - git status
gl                - git log
gb                - git branch
gbd branch-name   - git branch -d branch-name
gco branch-name   - git checkout branch-name
gcb branch-name   - git checkout -b branch-name
cl                - clear
du                - deno upgrade
gsv               - Show version
gsh               - Show this help message
    `,
      "color: orange",
    )
  },
  gsv: () => {
    console.log(
      `%c
Git Shortcuts - Details:
----------------------------------
Version: ${VERSION}
Latest update: ${LATEST_UPDATE}
    `,
      "color: orange",
    )
  },
}

/* -----------------------------------------------------
   MAIN
----------------------------------------------------- */

async function main() {
  const args = parse(Deno.args)
  const command = args._[0] as string
  const restArgs = args._.slice(1).map((arg) => String(arg))

  if (!command) {
    console.log(
      "%cNo command provided. Use 'help' to see available commands.",
      "color: orange",
    )
    return
  }

  const shortcutFn = SHORTCUTS[command]
  if (!shortcutFn) {
    console.error(`%cUnknown command: ${command}`, "color: red")
    console.log("%cUse 'help' to see available commands.", "color: orange")
    return
  }

  try {
    await shortcutFn(restArgs)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`%cError executing command: ${error.message}`, "color: red")
    } else {
      console.error(
        `%cUnknown error executing command: ${String(error)}`,
        "color: red",
      )
    }
  }
}

if (import.meta.main) {
  main()
}
