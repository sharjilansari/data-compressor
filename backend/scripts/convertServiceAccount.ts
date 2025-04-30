// scripts/convertServiceAccount.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const convertServiceAccount = () => {
  try {
    const jsonPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    const json = fs.readFileSync(jsonPath, 'utf-8');
    const escaped = json
      .replace(/\n/g, '\\n')
      .replace(/"/g, '\\"')
      .replace(/\r/g, '')
      .trim();

    // Read existing .env file if it exists
    const envPath = path.join(__dirname, '..', '.env');
    let existingEnv = '';
    try {
      existingEnv = fs.readFileSync(envPath, 'utf-8');
    } catch (error) {
      // File doesn't exist, that's okay
    }

    // Parse existing env variables
    const envLines = existingEnv.split('\n');
    const envVars: Record<string, string> = {};
    
    envLines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    // Update or add Firebase service account
    envVars['FIREBASE_SERVICE_ACCOUNT'] = escaped;

    // Create new env content
    const newEnvContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n';

    // Write back to .env file
    fs.writeFileSync(envPath, newEnvContent, 'utf-8');

    console.log('✅ Successfully updated .env file with Firebase service account');
    console.log('📝 Existing environment variables have been preserved');
  } catch (error) {
    console.error('❌ Error converting service account:', error);
    console.log('\nUsage:');
    console.log('1. Place your serviceAccountKey.json in the backend directory');
    console.log('2. Run: npm run convert-service-account');
  }
};

convertServiceAccount();
