import chalk from "chalk";
import consola from "consola";
import settingsJson from "../settings.json" with { type: "json" };
import "./global.js";

export const log = consola;
export const settings = settingsJson;

export * from "./env.js";
export * from "./error.js";
export * from "./platform.js";

log.success(chalk.green("✅ Configurações carregadas!"));