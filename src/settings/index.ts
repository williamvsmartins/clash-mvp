import chalk from "chalk";
import consola from "consola";
import settingsJson from "../settings.json" with { type: "json" };

export const log = consola;
export const settings = settingsJson;

export * from "./env.js";
export * from "./error.js";

log.success(chalk.green("✅ Configurações carregadas!"));