import firebase_admin
from firebase_admin import credentials, firestore
from gensim.models.fasttext import load_facebook_vectors
import numpy as np
import json
import nltk
from nltk.stem import SnowballStemmer

# Firebase Admin'i başlat
cred = credentials.Certificate('/Users/mali/Desktop/articlesuggestion-firebase-adminsdk-cmt89-493bc1648d.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# NLTK veri indirme
nltk.download('punkt')
nltk.download('stopwords')
from nltk.corpus import stopwords

# Initialize stemmer
stemmer = SnowballStemmer('english')
stop_words = set(stopwords.words('english'))

def preprocess_text(text):
    words = nltk.word_tokenize(text)
    stemmed_words = [stemmer.stem(word) for word in words if word not in stop_words]
    return ' '.join(stemmed_words)

def create_fasttext_embeddings(data, model):
    fasttext_vectors = {}
    for key, value in data.items():
        stemmed_abstract = preprocess_text(value['abstract'])
        vectors = [model[word] for word in stemmed_abstract.split() if word in model]
        if vectors:
            vector = np.mean(vectors, axis=0).tolist()
            fasttext_vectors[key] = {"vector": vector, "title": value['title'], "model": "fasttext"}
    return fasttext_vectors

def save_vectors_to_firebase(vectors):
    for key, value in vectors.items():
        db.collection('article_vectors').document(key).set(value)

def main():
    input_path = '/Users/mali/Desktop/processed_data_fasttext.json'
    model_path = '/Users/mali/Desktop/cc.en.300.bin'  # Önceden eğitilmiş modelin yolu

    model = load_facebook_vectors(model_path)

    with open(input_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    fasttext_vectors = create_fasttext_embeddings(data, model)
    save_vectors_to_firebase(fasttext_vectors)

if __name__ == '__main__':
    main()
