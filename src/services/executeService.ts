// Service to execute code using the public Judge0 API
// https://ce.judge0.com/submissions

// Mapping Monaco language IDs to Judge0 language IDs
const LANGUAGE_MAP: Record<string, number> = {
  javascript: 93, // Node.js 18.15.0
  typescript: 94, // TypeScript 5.0.3
  python: 71,     // Python 3.11.2
  java: 62,       // Java (OpenJDK 13.0.1)
  cpp: 54,        // C++ (GCC 9.2.0)
  csharp: 51,     // C# (Mono 6.6.0.161)
  go: 60,         // Go (1.13.5)
  rust: 73,       // Rust (1.40.0)
};

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  error?: string;
  compileOutput?: string;
}

export async function executeCode(
  languageId: string,
  content: string,
  stdin: string = ''
): Promise<ExecuteResult> {
  const judge0LangId = LANGUAGE_MAP[languageId];

  if (!judge0LangId) {
    return {
      stdout: '',
      stderr: `Execution not supported for language: ${languageId}`,
      error: 'Unsupported language',
    };
  }

  try {
    const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language_id: judge0LangId,
        source_code: content,
        stdin: stdin,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.message) {
      throw new Error(data.message);
    }

    return {
      stdout: data.stdout || '',
      stderr: data.stderr || '',
      compileOutput: data.compile_output || '',
      error: data.status?.id > 3 ? data.status?.description : undefined,
    };
  } catch (error) {
    console.error('Execution Failed:', error);
    return {
      stdout: '',
      stderr: error instanceof Error ? error.message : 'Unknown execution error',
      error: error instanceof Error ? error.message : 'Unknown execution error',
    };
  }
}

