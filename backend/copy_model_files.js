import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyModelFiles() {
    try {
        console.log('📁 Copying model files to correct location...');
        
        const sourceDir = path.join(process.cwd(), 'models', 'chatbot_model');
        const targetDir = path.join(process.cwd(), 'node_modules', '@xenova', 'transformers', 'models', 'chatbot_model');
        
        console.log('📂 Source:', sourceDir);
        console.log('📂 Target:', targetDir);
        
        // Check if source exists
        if (!fs.existsSync(sourceDir)) {
            console.log('❌ Source model directory not found');
            return false;
        }
        
        // Create target directory if it doesn't exist
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
            console.log('✅ Created target directory');
        }
        
        // Get all files in source directory
        const files = fs.readdirSync(sourceDir);
        console.log('📄 Files to copy:', files);
        
        let copiedCount = 0;
        
        // Copy each file
        for (const file of files) {
            const sourceFile = path.join(sourceDir, file);
            const targetFile = path.join(targetDir, file);
            
            // Only copy files (not directories)
            if (fs.statSync(sourceFile).isFile()) {
                fs.copyFileSync(sourceFile, targetFile);
                copiedCount++;
                console.log(`✅ Copied: ${file}`);
            }
        }
        
        console.log(`🎉 Successfully copied ${copiedCount} files`);
        console.log('📁 Model is now available at:', targetDir);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error copying model files:', error.message);
        return false;
    }
}

// Run the copy function
copyModelFiles();