import firebase_admin
from firebase_admin import credentials, firestore
import numpy as np
import json
from transformers import AutoTokenizer, AutoModel
import torch
import nltk
from nltk.stem import WordNetLemmatizer

# Firebase Admin'i başlat
cred = credentials.Certificate('/Users/mali/Desktop/articlesuggestion-firebase-adminsdk-cmt89-493bc1648d.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# NLTK veri indirme
nltk.download('punkt')
nltk.download('wordnet')
from nltk.corpus import wordnet

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

def lemmatize_text(text):
    words = nltk.word_tokenize(text)
    lemmatized_words = [lemmatizer.lemmatize(word, wordnet.VERB) for word in words]
    return ' '.join(lemmatized_words)

def create_scibert_embeddings(data, tokenizer, model):
    scibert_vectors = {}
    for key, value in data.items():
        lemmatized_abstract = lemmatize_text(value['abstract'])
        encoded_input = tokenizer(lemmatized_abstract, return_tensors='pt', padding=True, truncation=True)
        with torch.no_grad():
            output = model(**encoded_input)
        vector = output.last_hidden_state.mean(dim=1).squeeze().numpy()
        scibert_vectors[key] = {"vector": vector.tolist(), "title": value['title'], "model": "scibert"}
    return scibert_vectors

def save_vectors_to_firebase(vectors):
    for key, value in vectors.items():
        db.collection('article_vectors').document(key).set(value)

def main():
    input_path = '/Users/mali/Desktop/processed_data2.json'
    tokenizer = AutoTokenizer.from_pretrained('allenai/scibert_scivocab_uncased')
    model = AutoModel.from_pretrained('allenai/scibert_scivocab_uncased')

    with open(input_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    scibert_vectors = create_scibert_embeddings(data, tokenizer, model)
    save_vectors_to_firebase(scibert_vectors)

if __name__ == '__main__':
    main()
