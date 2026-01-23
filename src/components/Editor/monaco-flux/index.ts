import type * as monaco from "monaco-editor";
import {
  fluxLanguageConfiguration,
  fluxMonarchTokenizer,
} from "./monarch-tokenizer";
import { createFluxCompletionProvider } from "./completion-provider";
import { createFluxHoverProvider } from "./hover-provider";
import { fluxDarkTheme, fluxLightTheme } from "./theme";

export const FLUX_LANGUAGE_ID = "flux";

/**
 * Registers the Flux language with Monaco Editor.
 * This should be called once when the application initializes.
 */
export function registerFluxLanguage(monacoInstance: typeof monaco): void {
  // Register the language
  monacoInstance.languages.register({
    id: FLUX_LANGUAGE_ID,
    extensions: [".flux"],
    aliases: ["Flux", "flux"],
    mimetypes: ["text/x-flux"],
  });

  // Set language configuration (brackets, comments, etc.)
  monacoInstance.languages.setLanguageConfiguration(
    FLUX_LANGUAGE_ID,
    fluxLanguageConfiguration
  );

  // Set the tokenizer (syntax highlighting)
  monacoInstance.languages.setMonarchTokensProvider(
    FLUX_LANGUAGE_ID,
    fluxMonarchTokenizer
  );

  // Register completion provider
  monacoInstance.languages.registerCompletionItemProvider(
    FLUX_LANGUAGE_ID,
    createFluxCompletionProvider(monacoInstance)
  );

  // Register hover provider
  monacoInstance.languages.registerHoverProvider(
    FLUX_LANGUAGE_ID,
    createFluxHoverProvider(monacoInstance)
  );

  // Define themes
  monacoInstance.editor.defineTheme("flux-dark", fluxDarkTheme);
  monacoInstance.editor.defineTheme("flux-light", fluxLightTheme);
}

/**
 * Detects the language based on file extension.
 * Returns "flux" for .flux files, otherwise returns a common Monaco language.
 */
export function detectLanguage(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "flux":
      return FLUX_LANGUAGE_ID;
    case "js":
      return "javascript";
    case "ts":
      return "typescript";
    case "jsx":
      return "javascript";
    case "tsx":
      return "typescript";
    case "json":
      return "json";
    case "html":
      return "html";
    case "css":
      return "css";
    case "md":
      return "markdown";
    case "yaml":
    case "yml":
      return "yaml";
    case "xml":
      return "xml";
    case "sh":
    case "bash":
      return "shell";
    case "rs":
      return "rust";
    case "py":
      return "python";
    case "go":
      return "go";
    default:
      return "plaintext";
  }
}
