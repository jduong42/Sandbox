const fs = require('fs');
const path = 'src/screens/FigmaAIChatScreen.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "import { llamaTextGenerationService } from '../services/LlamaTextGenerationService';",
  "import { useAICoachStore } from '../store/aiCoachStore';"
);
code = code.replace("import { createSportsPromptWithContext } from '../services/prompts/sportsPrompts';\n", "");
code = code.replace("import { trainingContextService } from '../services/TrainingContextService';\n", "");

const initialMsgRegex = /const INITIAL_MESSAGE: Message = \{\s+id: 0,\s+role: 'assistant',\s+content:\s+"Hi! I'm your local AI fitness assistant\. How can I help you with your fitness journey today\?",\s+\};\n\n/m;
code = code.replace(initialMsgRegex, "");

fs.writeFileSync(path, code);
