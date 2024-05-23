import os
import json
import fasttext
from nltk.stem import PorterStemmer
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
    stemmer = PorterStemmer()
    return ' '.join([stemmer.stem(word) for word in text.split()])

def generate_vectors():
    # FastText modelini yükle
    model = fasttext.load_model('/Users/mali/Desktop/cc.en.300.bin')

    client = MongoClient('mongodb+srv://mall-e:efmukl123@cluster0.gc0ynhe.mongodb.net/?retryWrites=true&w=majority&appName=cluster0')
    db = client.yazlab231
    collection = db.fasttext

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
                    vector = model.get_sentence_vector(preprocessed_text)

                    # MongoDB'ye kaydet
                    collection.insert_one({
                        'title': title,
                        'abstract' : abstract,
                        'vector': vector.tolist(),
                    })

                    processed_files.add(filename)

if __name__ == "__main__":
    generate_vectors()
