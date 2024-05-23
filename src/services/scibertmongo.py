import os
import torch
from transformers import AutoTokenizer, AutoModel
from nltk.stem import WordNetLemmatizer
from pymongo import MongoClient

def extract_abstract(text):
    start_tag = "--A"
    end_tag = "--B"
    start = text.find(start_tag) + len(start_tag)
    end = text.find(end_tag)
    if start < len(start_tag) or end < 0:
        return None  # Abstract not found
    return text[start:end].strip()

def extract_title(text):
    start_tag = "--T"
    end_tag = "--A"
    start = text.find(start_tag) + len(start_tag)
    end = text.find(end_tag)
    if start < len(start_tag) or end < 0:
        return None  # Title not found
    return text[start:end].strip()

def preprocess_text(text):
    lemmatizer = WordNetLemmatizer()
    return ' '.join([lemmatizer.lemmatize(word) for word in text.split()])

def generate_vectors():
    # SciBERT modelini ve tokenizer'ı yükle
    tokenizer = AutoTokenizer.from_pretrained('allenai/scibert_scivocab_uncased')
    model = AutoModel.from_pretrained('allenai/scibert_scivocab_uncased')

    client = MongoClient('mongodb+srv://mall-e:efmukl123@cluster0.gc0ynhe.mongodb.net/?retryWrites=true&w=majority&appName=cluster0')
    db = client.yazlab231
    collection = db.scibert

    docs_path = '/Users/mali/Desktop/Krapivin2009/docsutf8'
    processed_files = set()

    for filename in os.listdir(docs_path):
        if filename.endswith('.txt') and filename not in processed_files:
            with open(os.path.join(docs_path, filename), 'r', encoding='utf-8') as file:
                content = file.read()
                title = extract_title(content)
                abstract = extract_abstract(content)

                if title and abstract:
                    preprocessed_text = preprocess_text(abstract)
                    inputs = tokenizer(preprocessed_text, return_tensors='pt', max_length=512, truncation=True, padding=True)
                    with torch.no_grad():
                        outputs = model(**inputs)
                        vector = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

                    # MongoDB'ye kaydet
                    collection.insert_one({
                        'title': title,
                        'abstract' : abstract,
                        'vector': vector.tolist(),
                    })

                    processed_files.add(filename)

if __name__ == "__main__":
    generate_vectors()
