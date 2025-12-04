# Install required packages
!pip install transformers datasets torch accelerate pandas scikit-learn matplotlib seaborn -q

# Import libraries
import pandas as pd
import torch
import os
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification, 
    Trainer, 
    TrainingArguments,
    DistilBertConfig
)
from datasets import Dataset
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix
from google.colab import drive
import zipfile
import shutil

print("🚀 Starting Chatbot Intent Classification Model Training")

# Mount Google Drive to save model
drive.mount('/content/drive')

# Set up paths
drive_model_path = '/content/drive/MyDrive/chatbot_model'
local_model_path = './chatbot_model'
os.makedirs(drive_model_path, exist_ok=True)
os.makedirs(local_model_path, exist_ok=True)

print("✅ Google Drive mounted and paths created")

# Load and validate dataset
try:
    df = pd.read_csv('/content/full_chatbot_data.csv')
    print(f"✅ Dataset loaded with {len(df)} examples")
    
    # Check for required columns
    if 'text' not in df.columns or 'intent' not in df.columns:
        raise ValueError("Dataset must contain 'text' and 'intent' columns")
    
    # Check for empty values
    if df['text'].isnull().any() or df['intent'].isnull().any():
        print("⚠️  Warning: Dataset contains empty values. Cleaning...")
        df = df.dropna(subset=['text', 'intent'])
    
    print(f"✅ Cleaned dataset has {len(df)} examples")
    print(f"📊 Intents distribution:\n{df['intent'].value_counts()}")
    
except Exception as e:
    print(f"❌ Error loading dataset: {e}")
    raise

# Preprocess data - map intents to labels
intents = sorted(df['intent'].unique())
intent_to_id = {intent: idx for idx, intent in enumerate(intents)}
id_to_intent = {idx: intent for intent, idx in intent_to_id.items()}
df['label'] = df['intent'].map(intent_to_id)

print(f"📊 Number of classes: {len(intents)}")
print("🔤 Class mapping:", intent_to_id)

# Split data (80% train, 20% test)
train_texts, test_texts, train_labels, test_labels = train_test_split(
    df['text'].tolist(), 
    df['label'].tolist(), 
    test_size=0.2, 
    random_state=42, 
    stratify=df['label']
)
print(f"📚 Training samples: {len(train_texts)}, Test samples: {len(test_texts)}")

# Load DistilBERT tokenizer and model
model_name = "distilbert-base-uncased"
print(f"🔧 Loading model: {model_name}")

try:
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # Create model configuration
    config = DistilBertConfig.from_pretrained(
        model_name,
        num_labels=len(intents),
        id2label=id_to_intent,
        label2id=intent_to_id,
        problem_type="single_label_classification"
    )
    
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        config=config,
        ignore_mismatched_sizes=False
    )
    
    print("✅ Model and tokenizer loaded successfully")
    
except Exception as e:
    print(f"❌ Error loading model: {e}")
    raise

# Tokenize datasets
def tokenize_function(examples):
    return tokenizer(
        examples["text"], 
        padding="max_length", 
        truncation=True, 
        max_length=128,
        return_tensors=None
    )

print("🔤 Tokenizing datasets...")

train_dataset = Dataset.from_dict({
    "text": train_texts, 
    "label": train_labels
})
test_dataset = Dataset.from_dict({
    "text": test_texts, 
    "label": test_labels
})

train_dataset = train_dataset.map(tokenize_function, batched=True)
test_dataset = test_dataset.map(tokenize_function, batched=True)

# Set format for PyTorch
train_dataset.set_format(type='torch', columns=['input_ids', 'attention_mask', 'label'])
test_dataset.set_format(type='torch', columns=['input_ids', 'attention_mask', 'label'])

print("✅ Datasets tokenized and formatted")

# Evaluation metrics
def compute_metrics(p):
    predictions, labels = p
    predictions = np.argmax(predictions, axis=1)
    
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, predictions, average='weighted', zero_division=0
    )
    acc = accuracy_score(labels, predictions)
    
    return {
        'accuracy': acc,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }

# Training configuration
training_args = TrainingArguments(
    output_dir='./training_results',
    num_train_epochs=4,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    learning_rate=2e-5,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir='./logs',
    logging_steps=20,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    greater_is_better=True,
    save_total_limit=2,
    report_to="none",
    dataloader_pin_memory=False,
)

# Initialize trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    compute_metrics=compute_metrics,
    tokenizer=tokenizer,
)

print("✅ Training configuration set up")

# Train model
print("🎯 Starting training...")
try:
    training_results = trainer.train()
    print("✅ Training completed successfully")
    
    # Get final metrics
    final_metrics = trainer.evaluate()
    print("\n📊 Final Evaluation Results:")
    for key, value in final_metrics.items():
        print(f"   {key}: {value:.4f}")
        
except Exception as e:
    print(f"❌ Training failed: {e}")
    raise

# Generate predictions for detailed analysis
print("📈 Generating evaluation visualizations...")

predictions = trainer.predict(test_dataset)
y_pred = np.argmax(predictions.predictions, axis=1)
y_true = predictions.label_ids

# Classification Report
print("\n📋 Classification Report:")
class_report = classification_report(y_true, y_pred, target_names=intents)
print(class_report)

# Save classification report
with open('classification_report.txt', 'w') as f:
    f.write(class_report)

# Confusion Matrix
plt.figure(figsize=(12, 10))
cm = confusion_matrix(y_true, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=intents, 
            yticklabels=intents)
plt.title('Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.xticks(rotation=45)
plt.yticks(rotation=0)
plt.tight_layout()
plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
plt.show()

print("✅ Evaluation visualizations generated")

# Save model with proper configuration
print("\n💾 Saving model and artifacts...")
try:
    # Save to Google Drive
    trainer.save_model(drive_model_path)
    tokenizer.save_pretrained(drive_model_path)
    
    # Also save locally
    trainer.save_model(local_model_path)
    tokenizer.save_pretrained(local_model_path)
    
    # Save label mappings and configuration
    model_config = {
        'intent_to_id': intent_to_id,
        'id_to_intent': id_to_intent,
        'intents': intents,
        'model_name': model_name,
        'num_classes': len(intents)
    }
    
    with open(f'{drive_model_path}/model_config.json', 'w') as f:
        json.dump(model_config, f, indent=2)
        
    with open(f'{local_model_path}/model_config.json', 'w') as f:
        json.dump(model_config, f, indent=2)
    
    print("✅ Model saved successfully to both Google Drive and local directory")
    
except Exception as e:
    print(f"❌ Error saving model: {e}")
    raise

# Enhanced testing with examples
test_examples = [
    "Show me all restaurants",
    "I want to order pizza",
    "What's in my cart?",
    "Add burger to cart",
    "Update order status",
    "Find Italian food",
    "Show my past orders",
    "Where is my order?",
    "Go to home page",
    "Delete restaurant Pizza Palace"
]

print("\n🧪 Testing with sample phrases:")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"   Using device: {device}")

# Load the saved model for testing
try:
    test_model = AutoModelForSequenceClassification.from_pretrained(local_model_path)
    test_tokenizer = AutoTokenizer.from_pretrained(local_model_path)
    test_model.to(device)
    test_model.eval()
    print("✅ Test model loaded successfully")
    
except Exception as e:
    print(f"❌ Error loading test model: {e}")
    test_model = model
    test_tokenizer = tokenizer
    test_model.to(device)
    test_model.eval()

print("\n📝 Prediction Results:")
print("-" * 60)

test_results = []
for phrase in test_examples:
    try:
        inputs = test_tokenizer(
            phrase, 
            return_tensors="pt", 
            padding=True, 
            truncation=True, 
            max_length=128
        )
        inputs = {key: value.to(device) for key, value in inputs.items()}
        
        with torch.no_grad():
            outputs = test_model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
        predicted_class_id = predictions.argmax().item()
        predicted_intent = id_to_intent[predicted_class_id]
        confidence = predictions.max().item()
        
        result = f"Text: '{phrase}' -> Intent: {predicted_intent} (Confidence: {confidence:.4f})"
        print(result)
        test_results.append(result)
        
    except Exception as e:
        error_msg = f"Error predicting for '{phrase}': {e}"
        print(error_msg)
        test_results.append(error_msg)

# Save test results
with open('test_results.txt', 'w') as f:
    f.write("Model Test Results:\n")
    f.write("=" * 50 + "\n")
    for result in test_results:
        f.write(result + "\n")

print("✅ Test results saved")

# Create comprehensive zip file
print("\n📦 Creating comprehensive zip file...")
zip_filename = 'chatbot_model_complete.zip'

files_to_include = [
    'classification_report.txt',
    'confusion_matrix.png', 
    'test_results.txt'
]

try:
    with zipfile.ZipFile(zip_filename, 'w') as zipf:
        # Add evaluation files
        for file in files_to_include:
            if os.path.exists(file):
                zipf.write(file)
        
        # Add model files from local model directory
        for root, dirs, files in os.walk(local_model_path):
            for file in files:
                file_path = os.path.join(root, file)
                zipf.write(file_path, os.path.relpath(file_path, '.'))
    
    print(f"✅ Zip file created: {zip_filename}")
    
    # Copy to Google Drive
    drive_zip_path = f'/content/drive/MyDrive/{zip_filename}'
    if os.path.exists(drive_zip_path):
        os.remove(drive_zip_path)
    
    shutil.copy(zip_filename, drive_zip_path)
    print(f"✅ Zip file copied to Google Drive: {drive_zip_path}")
    
except Exception as e:
    print(f"❌ Error creating zip file: {e}")

# Display file structure
print("\n📁 Model file structure:")
model_files = []
try:
    for root, dirs, files in os.walk(local_model_path):
        for file in files:
            relative_path = os.path.relpath(os.path.join(root, file), local_model_path)
            model_files.append(relative_path)
    
    for file in sorted(model_files):
        print(f"   📄 {file}")
        
    print(f"\n   Total model files: {len(model_files)}")
    
except Exception as e:
    print(f"   Could not list model files: {e}")

# Final summary
print("\n" + "="*60)
print("🎉 CHATBOT MODEL TRAINING COMPLETE! 🎉")
print("="*60)
print(f"📁 Model saved to:")
print(f"   Google Drive: {drive_model_path}")
print(f"   Local: {local_model_path}")
print(f"   Zip Backup: /content/drive/MyDrive/{zip_filename}")

print("\n📋 Model Artifacts:")
print("✅ chatbot_model/ - Complete model directory")
print("✅ model_config.json - Model configuration")
print("✅ pytorch_model.bin - Model weights")
print("✅ tokenizer files - Tokenizer configuration")
print("✅ classification_report.txt - Detailed metrics")
print("✅ confusion_matrix.png - Confusion matrix visualization")
print("✅ test_results.txt - Test examples with predictions")
print(f"✅ {zip_filename} - Complete package")

print("\n✨ Training script finished successfully!")