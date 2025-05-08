#!/usr/bin/env -S deno run --allow-run --allow-env

import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts"
import {
  green,
  red,
  yellow,
  rgb8,
  bold,
} from "https://deno.land/std@0.224.0/fmt/colors.ts"

// Define the shortcuts and their corresponding commands
const SHORTCUTS: Record<string, (args: string[]) => Promise<void> | void> = {
  gaa: async () => {
    // git add .
    const command = new Deno.Command("git", { args: ["add", "."] })
    const { stdout } = await command.output()
    console.log(new TextDecoder().decode(stdout))
  },
  gra: async () => {
    // git add .
    const command = new Deno.Command("git", { args: ["restore", "."] })
    const { stdout } = await command.output()
    console.log(new TextDecoder().decode(stdout))
  },
  gcm: async (args: string[]) => {
    // git commit -m "message"
    if (args.length === 0) {
      console.error("%cError: Commit message is required", "color: red")
      return
    }
    const message = args.join(" ")
    const command = new Deno.Command("git", { args: ["commit", "-m", message] })
    const { stdout } = await command.output()
    console.log(new TextDecoder().decode(stdout))
  },
  gp: async () => {
    // git push
    const command = new Deno.Command("git", { args: ["push"] })
    const { stdout } = await command.output()
    console.log(new TextDecoder().decode(stdout))
  },
  gpb: async (args: string[]) => {
    // git push branch
    if (args.length === 0) {
      console.error("%cError: Branch name is required", "color: red")
      return
    }

    const command = new Deno.Command("git", {
      args: ["push", "origin", args[0]],
    })
    const { stdout } = await command.output()
    console.log(new TextDecoder().decode(stdout))
  },
  gpl: async () => {
    // git pull
    const command = new Deno.Command("git", { args: ["pull"] })
    const { stdout } = await command.output()
    console.log(new TextDecoder().decode(stdout))
  },
  gplb: async (args: string[]) => {
    // git pull
    if (args.length === 0) {
      console.error("%cError: Branch name is required", "color: red")
      return
    }

    const command = new Deno.Command("git", {
      args: ["pull", "origin", args[0]],
    })
    const { stdout } = await command.output()
    console.log(new TextDecoder().decode(stdout))
  },
  gs: async () => {
    const command = new Deno.Command("git", { args: ["status"] })
    const { stdout } = await command.output()
    const output = new TextDecoder().decode(stdout)

    const lines = output.split("\n")

    // Tracks which section we're in
    let currentColor: ((text: string) => string) | null = null

    for (const line of lines) {
      if (line.includes("Changes to be committed:")) {
        currentColor = green
        console.log(line) // Header stays white
      } else if (line.includes("Changes not staged for commit:")) {
        currentColor = red
        console.log(line) // Header stays white
      } else if (line.includes("Untracked files:")) {
        currentColor = red
        console.log(line) // Header stays white
      } else if (line.trim() === "") {
        currentColor = null
        console.log(line) // Blank line, just print
      } else if (line.trimStart().startsWith("(")) {
        console.log(line) // Instruction line, stays white
      } else {
        // Apply section color if set
        console.log(currentColor ? currentColor(line) : line)
      }
    }
  },
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

        // Final full decoration coloring
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
  gb: async () => {
    // git branch
    const command = new Deno.Command("git", { args: ["branch"] })
    const { stdout } = await command.output()
    console.log(new TextDecoder().decode(stdout))
  },
  gbd: async (args: string[]) => {
    // git branch -d
    if (args.length === 0) {
      console.error("%cError: Branch name is required", "color: red")
      return
    }
    const command = new Deno.Command("git", { args: ["branch", "-d", args[0]] })
    const { stdout } = await command.output()
    console.log(new TextDecoder().decode(stdout))
  },
  gco: async (args: string[]) => {
    // git checkout
    if (args.length === 0) {
      console.error("%cError: Branch name is required", "color: red")
      return
    }
    const command = new Deno.Command("git", { args: ["checkout", args[0]] })
    const { stdout } = await command.output()
    console.log(new TextDecoder().decode(stdout))
  },
  gcb: async (args: string[]) => {
    // git checkout -b (new branch)
    if (args.length === 0) {
      console.error("%cError: Branch name is required", "color: red")
      return
    }
    const command = new Deno.Command("git", {
      args: ["checkout", "-b", args[0]],
    })
    const { stdout } = await command.output()
    console.log(new TextDecoder().decode(stdout))
  },
  cl: async () => {
    // git branch
    const command = new Deno.Command("clear")
    const { stdout } = await command.output()
    console.log(new TextDecoder().decode(stdout))
  },
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
gplb branch-name  - git pull origin branch-name
gs                - git status
gl                - git log
gb                - git branch
gbd branch-name   - git branch -d branch-name
gco branch-name   - git checkout branch-name
gcb branch-name   - git checkout -b branch-name
cl                - clear
gsh               - Show this help message
    `,
      "color: orange"
    )
  },
}

async function main() {
  const args = parse(Deno.args)
  const command = args._[0] as string
  const restArgs = args._.slice(1).map((arg) => String(arg))

  if (!command) {
    console.log(
      "%cNo command provided. Use 'help' to see available commands.",
      "color: orange"
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
        "color: red"
      )
    }
  }
}

if (import.meta.main) {
  main()
}
