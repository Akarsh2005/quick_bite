import { pipeline } from '@xenova/transformers';
import fs from 'fs';

async function testModel() {
    try {
        console.log('🧪 Testing model loading...');
        
        // Try different path approaches
        const paths = [
            './models/chatbot_model',
            'models/chatbot_model',
            '../models/chatbot_model'
        ];

        for (const modelPath of paths) {
            console.log(`\n🔍 Trying path: ${modelPath}`);
            
            if (!fs.existsSync(modelPath)) {
                console.log('❌ Path does not exist');
                continue;
            }

            try {
                const classifier = await pipeline(
                    'text-classification',
                    modelPath,
                    { 
                        local_files_only: true,
                        revision: 'main'
                    }
                );
                
                console.log('✅ Model loaded successfully!');
                
                // Test prediction
                const result = await classifier("Show all restaurants");
                console.log('🧪 Test prediction:', result);
                
                return;
            } catch (error) {
                console.log('❌ Failed:', error.message);
            }
        }
        
        console.log('\n💡 All path attempts failed. Using keyword fallback will work.');
        
    } catch (error) {
        console.error('❌ Model test failed:', error.message);
    }
}

testModel();