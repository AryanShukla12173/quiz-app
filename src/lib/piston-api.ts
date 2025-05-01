
import { LANGUAGES } from "./types"

const getPistonLanguageInfo = (language: string): { language: string; version: string } => {
    const lang = LANGUAGES.find((l) => l.value === language)
    return {
      language: lang?.pistonLanguage || language,
      version: lang?.pistonVersion || "latest",
    }
  }
const executeCode = async (source: string, language: string, input: string) => {
    const { language: pistonLanguage, version } = getPistonLanguageInfo(language);
    
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: pistonLanguage,
          version: version,
          files: [
            {
              content: source,
            },
          ],
          stdin: input,
          args: [],
          compile_timeout: 10000,
          run_timeout: 5000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`API error ${response.status}: ${errorData}`)
      }

      const result = await response.json()
      
      // Handle successful execution
      if (result.run) {
        return {
          output: result.run.stdout || "",
          error: result.run.stderr || "",
          exitCode: result.run.code
        }
      } else {
        throw new Error("Invalid response format from code execution API")
      }
    } catch (err: unknown) {
      console.error("Code execution error:", err);
      
      let errorMessage = "An unknown error occurred.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
    
      return {
        output: "",
        error: errorMessage,
        exitCode: -1
      };
    }
  }

export {executeCode}