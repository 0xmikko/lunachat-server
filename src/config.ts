/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { validate, IsNotEmpty } from "class-validator";

export class Config {
  static port: number;

  @IsNotEmpty()
  static database_url: string;

  @IsNotEmpty()
  static jwt_secret: string;

  @IsNotEmpty()
  static twillio_sid: string;

  @IsNotEmpty()
  static twillio_key: string;

  @IsNotEmpty()
  static twillio_from: string;

  @IsNotEmpty()
  static sentryDSN: string;

  @IsNotEmpty()
  static  send_to_debug: boolean;

  @IsNotEmpty()
  static debug_phone: string;

  @IsNotEmpty()
  static ampq_url: string;

  @IsNotEmpty()
  static nucypher_url: string;



  static init() {
    Config.port = parseInt(process.env.PORT || "4000");
    Config.database_url = process.env.DATABASE_URL || "";
    Config.jwt_secret = process.env.JWT_SECRET || "";
    Config.twillio_sid = process.env.TWILLIO_SID || "";
    Config.twillio_key = process.env.TWILLIO_KEY || "";
    Config.twillio_from = process.env.TWILLIO_FROM || "";
    Config.sentryDSN = process.env.SENTRY_DSN|| "";
    Config.send_to_debug = process.env.SEND_TO_DEBUG === "true";
    Config.debug_phone = process.env.DEBUG_PHONE || "";
    Config.ampq_url = process.env.AMPQ_URL || "";
    Config.nucypher_url = process.env.NUCYPHER_URL || "";

  }


  static async validate(): Promise<void> {
    console.log("Loading configuration...")
    Config.init();
    const errors = await validate(Config);
    if (errors.length > 0)
      throw new Error(`Configuration problems: ${errors.join("\n")}`);
  }
}

Config.init();

export default Config;
