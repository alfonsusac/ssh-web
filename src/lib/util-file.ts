import { mkdir, readFile, stat, writeFile } from "fs/promises"
import { dirname } from "path"

export async function get_path_kind(path: string): Promise<
  null | "file" | "folder"
> {
  try {
    const info = await stat(path)
    if (info.isFile()) return "file"
    if (info.isDirectory()) return "folder"
    throw new Error("Unsupported path type")
  } catch (error) {
    return null
  }
}

// File class for node
export class TextFile {
  constructor(
    readonly path: string,
    readonly init?: () => string
  ) { }
  async read() {
    const kind = await get_path_kind(this.path)
    if (kind === "folder") throw new Error(this.path + ' is a directory! expected a file or absent.')
    if (kind === null) {
      await mkdir(dirname(this.path), { recursive: true })
      await this.write()
    }
    return await readFile(this.path, { encoding: "utf-8" })
  }
  async write(content?: string) {
    await writeFile(this.path, content ?? this.init?.() ?? "''")
  }
}

export class JsonFile<T> {
  readonly file: TextFile
  constructor(
    path: string,
    readonly parser: JsonParser<T>,
    readonly init: () => T,
  ) {
    this.file = new TextFile(path, () => {
      return this.parser.stringify(init())
    })
  }
  async read() {
    try {
      const raw = await this.file.read()
      const parsed = this.parser.parse(raw)
      return { ok: true, data: parsed } as const
    } catch (error) {
      return {
        ok: false,
        error: {
          ref: error,
          msg: error instanceof Error ? error.message : String(error)
        }
      } as const
    }
  }
  async write(t?: T) {
    const parsed = this.parser.stringify(t || this.init())
    await this.file.write(parsed)
  }
  async reset() {
    await this.write()
  }
}





export class JsonParser<T> {
  constructor(
    private readonly parser: (o: unknown) => T,
  ) { }
  parse(o: string): T {
    const raw = JSON.parse(o) as unknown
    const parsed = this.parser(raw)
    return parsed
  }
  stringify(o: T): string {
    const parsed = this.parser(o)
    return JSON.stringify(parsed)
  }
}
