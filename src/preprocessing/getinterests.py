import firebase_admin
from firebase_admin import credentials, firestore
from transformers import BertTokenizer, BertModel
import torch

# Initialize Firebase Admin
cred = credentials.Certificate('/Users/mali/Desktop/articlesuggestion-firebase-adminsdk-cmt89-493bc1648d.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

def get_user_interests(user_id):
    interests_ref = db.collection('users').document(user_id).collection('interests')
    interests_docs = interests_ref.stream()  # Tüm 'interests' dökümanlarını çeker

    interests_list = []
    for doc in interests_docs:
        interests_list.append(doc.to_dict())  # Her dökümanın içeriğini listeye ekler
        print(doc.to_dict())  # İlgi alanlarını görmek için yazdır

    return interests_list


# Model ve Tokenizer yükleme
tokenizer = BertTokenizer.from_pretrained('allenai/scibert_scivocab_uncased')
model = BertModel.from_pretrained('allenai/scibert_scivocab_uncased')

def get_interest_vector(interests):
    # İlgi alanlarını tek bir metne dönüştür
    combined_text = ' '.join([interest['interest_name'] for interest in interests])
    # Tokenize et ve modelden geçir
    inputs = tokenizer(combined_text, return_tensors='pt', padding=True, truncation=True, max_length=512)
    outputs = model(**inputs)
    # Vektörlerin ortalamasını al
    interest_vector = outputs.last_hidden_state.mean(dim=1).detach().numpy()
    return interest_vector

# Örnek kullanıcı ilgi alanlarını al ve vektör temsilini oluştur
user_interests = get_user_interests("WPAEXx7knqNveXCo4kXfGX1HSrp2")
user_vector = get_interest_vector(user_interests)
